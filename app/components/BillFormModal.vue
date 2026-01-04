<template>
  <UModal v-model:open="isOpen" :title="isEdit ? 'Edit Bill' : 'Add New Bill'" description="Manage your credit card bills and installment plans here.">
    <template #body>
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="flex flex-col items-center space-y-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ isEdit ? 'Updating...' : 'Creating...' }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-[120px_1fr] gap-3 items-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</div>
          <UInput
            id="name"
            v-model="formData.name"
            placeholder="Enter bill name (e.g., Sofa, CCTV)"
            :disabled="loading"
            required
          />
        </div>

        <div class="grid grid-cols-[120px_1fr] gap-3 items-start">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">Description</div>
          <UTextarea
            id="desc"
            v-model="formData.desc"
            placeholder="Enter bill description"
            :disabled="loading"
            :rows="3"
          />
        </div>

        <div class="grid grid-cols-[120px_1fr] gap-3 items-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount (IDR) *</div>
          <input
            ref="amountInput"
            id="amount"
            type="text"
            placeholder="e.g., 1.000.000"
            :disabled="loading"
            required
            class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-600"
          />
        </div>

        <div class="grid grid-cols-[120px_1fr] gap-3 items-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Installment Count (months) *</div>
          <USelectMenu
            id="count"
            v-model="selectedInstallment"
            :items="installmentOptions"
            placeholder="Select installment period"
            required
          />
        </div>

        <div class="grid grid-cols-[120px_1fr] gap-3 items-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Start Month *</div>
          <UInput
            id="started_at"
            v-model="formData.started_at"
            type="month"
            :disabled="loading"
            required
          />
        </div>

        <div v-if="amountTyped && formData.count" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Monthly payment: <strong>IDR {{ formatCurrency(Math.round(amountTyped / formData.count)) }}</strong>
          </p>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <UButton color="neutral" variant="outline" @click="closeModal" :disabled="loading">
            Cancel
          </UButton>
          <UButton type="submit" :loading="loading">
            {{ isEdit ? 'Update' : 'Create' }} Bill
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { BillFormData, Bill } from '~/composables/useBills'
import { useCurrencyMask } from '~/composables/useCurrencyMask'

interface Props {
  open: boolean
  bill?: Bill | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  bill: null
})

const emit = defineEmits<Emits>()

const { createBill, updateBill } = useBills()
const toast = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEdit = computed(() => !!props.bill)
const loading = ref(false)

const { el: amountInput, typed: amountTyped, masked: amountMasked } = useCurrencyMask({
  onAccept: (value, unmasked, typed) => {
    // Value automatically synced via amountTyped ref
  }
})

// Credit card installment options
const installmentOptions = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '9 months', value: 9 },
  { label: '12 months', value: 12 },
  { label: '15 months', value: 15 },
  { label: '18 months', value: 18 },
  { label: '24 months', value: 24 }
]

const selectedInstallment = ref(installmentOptions[0]) // Default to 3 months

// Watch for selectedInstallment changes and update formData
watch(selectedInstallment, (newSelection) => {
  if (newSelection) {
    formData.value.count = newSelection.value
  }
})

const defaultFormData: Omit<BillFormData, 'amount'> = {
  name: '',
  desc: '',
  count: 3,
  started_at: new Date().toISOString().slice(0, 7) || ''
}

const formData = ref<Omit<BillFormData, 'amount'>>({ ...defaultFormData })

const resetForm = () => {
  formData.value = { ...defaultFormData }
  if (amountInput.value) {
    amountInput.value.value = ''
  }
}

// Populate form when bill changes or modal opens
const populateForm = (bill: Bill | null | undefined) => {
  if (bill) {
    formData.value = {
      name: bill.name,
      desc: bill.desc,
      count: bill.count,
      started_at: bill.started_at.slice(0, 7) || ''
    }
    // Set amount in the masked input - use nextTick to ensure DOM is ready
    nextTick(() => {
      if (amountInput.value) {
        amountInput.value.value = formatCurrency(bill.amount)
      }
    })
    // Set the selected installment option
    selectedInstallment.value = installmentOptions.find(option => option.value === bill.count) || installmentOptions[0]
  } else {
    resetForm()
    selectedInstallment.value = installmentOptions[0]
  }
}

// Watch for bill prop changes to populate form
watch(() => props.bill, (newBill) => {
  populateForm(newBill)
}, { immediate: true })

// Watch for modal opening to repopulate form
watch(() => props.open, (isOpen) => {
  if (isOpen && props.bill) {
    populateForm(props.bill)
  }
})

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    // Convert the month format (YYYY-MM) to a proper timestamp
    const submitData = {
      ...formData.value,
      amount: amountTyped.value,
      started_at: `${formData.value.started_at}-01T00:00:00.000Z`
    }
    
    if (isEdit.value && props.bill) {
      await updateBill(props.bill.id, submitData)
      toast.add({
        title: 'Success',
        description: 'Bill updated successfully',
        color: 'success'
      })
    } else {
      await createBill(submitData)
      toast.add({
        title: 'Success', 
        description: 'Bill created successfully',
        color: 'success'
      })
    }
    
    emit('success')
    closeModal()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'An error occurred',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}
</script>