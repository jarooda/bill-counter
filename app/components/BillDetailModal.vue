<template>
  <UModal v-model:open="isOpen" :title="`Bill Details - ${bill?.name || ''}`" description="View detailed information about your bill, including payment schedule and status.">
    <template #body>
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="flex flex-col items-center space-y-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Deleting bill...</p>
        </div>
      </div>

      <div v-if="bill" class="space-y-6">
        <!-- Bill Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Name</dt>
              <dd class="text-sm text-gray-900 dark:text-white">{{ bill.name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Start Month</dt>
              <dd class="text-sm text-gray-900 dark:text-white">{{ formatDate(bill.started_at) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</dt>
              <dd class="text-sm font-mono text-gray-900 dark:text-white">IDR {{ formatCurrency(bill.amount) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Payment</dt>
              <dd class="text-sm font-mono text-green-600 dark:text-green-400">IDR {{ formatCurrency(bill.monthly_amount) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Duration</dt>
              <dd class="text-sm text-gray-900 dark:text-white">{{ bill.count }} months</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Status</dt>
              <dd class="text-sm">
                <UBadge 
                  :color="getBillStatus(bill).color as any" 
                  :variant="getBillStatus(bill).variant as any"
                >
                  {{ getBillStatus(bill).label }}
                </UBadge>
              </dd>
            </div>
          </div>
          
          <div v-if="bill.desc">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-300">Description</dt>
            <dd class="text-sm text-gray-900 dark:text-white">{{ bill.desc }}</dd>
          </div>
        </div>

        <!-- Payment Schedule -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Payment Schedule</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
            <div 
              v-for="(payment, index) in getPaymentSchedule(bill)" 
              :key="index"
              class="p-3 rounded-md"
              :class="getPaymentStatusClass(payment.date)"
            >
              <div class="text-xs font-medium">
                {{ payment.monthLabel }}
              </div>
              <div class="text-sm font-mono font-bold">
                IDR {{ formatCurrency(payment.amount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton color="neutral" variant="outline" @click="closeModal" :disabled="loading">
            Close
          </UButton>
          <UButton color="primary" @click="editBill" :disabled="loading">
            Edit Bill
          </UButton>
          <UButton color="error" @click="confirmDelete" :loading="loading">
            Delete Bill
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Delete Confirmation Modal -->
  <UModal v-model:open="showDeleteConfirm" title="Confirm Deletion">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete the bill "{{ bill?.name }}"? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <UButton color="neutral" variant="outline" @click="showDeleteConfirm = false" :disabled="loading">
            Cancel
          </UButton>
          <UButton color="error" @click="handleDelete" :loading="loading">
            Delete
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Bill } from '~/composables/useBills'
import { isNil } from 'jalutils'

interface Props {
  open: boolean
  bill?: Bill | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'edit-bill', bill: Bill): void
  (e: 'deleted'): void
}

const props = withDefaults(defineProps<Props>(), {
  bill: null
})

const emit = defineEmits<Emits>()

const { deleteBill } = useBills()
const toast = useToast()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const showDeleteConfirm = ref(false)

const closeModal = () => {
  isOpen.value = false
  showDeleteConfirm.value = false
}

const editBill = () => {
  if (props.bill) {
    emit('edit-bill', props.bill)
    closeModal()
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (isNil(props.bill)) return
  loading.value = true
  
  try {
    await deleteBill(props.bill.id)
    toast.add({
      title: 'Success',
      description: 'Bill deleted successfully',
      color: 'success'
    })
    
    emit('deleted')
    closeModal()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete bill',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

const getBillStatus = (bill: Bill) => {
  const now = new Date()
  const startDate = new Date(bill.started_at)
  const endDate = new Date(startDate)
  endDate.setMonth(startDate.getMonth() + bill.count)

  if (now < startDate) {
    return { label: 'Upcoming', color: 'info', variant: 'subtle' }
  } else if (now >= startDate && now < endDate) {
    return { label: 'Active', color: 'success', variant: 'subtle' }
  } else {
    return { label: 'Completed', color: 'neutral', variant: 'subtle' }
  }
}

const getPaymentSchedule = (bill: Bill) => {
  const schedule = []
  const startDate = new Date(bill.started_at)
  
  for (let i = 0; i < bill.count; i++) {
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(startDate.getMonth() + i)
    
    schedule.push({
      date: paymentDate,
      amount: bill.monthly_amount,
      monthLabel: paymentDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    })
  }
  
  // Sort by date in reverse order (latest first)
  return schedule.sort((a, b) => b.date.getTime() - a.date.getTime())
}

const getPaymentStatusClass = (paymentDate: Date) => {
  const currentDate = new Date()
  const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth())
  const paymentMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth())
  
  if (paymentMonth < currentMonth) {
    // Past month - gray
    return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
  } else if (paymentMonth.getTime() === currentMonth.getTime()) {
    // Current month - green
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  } else {
    // Future month - yellow
    return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  }
}
</script>