<template>
  <UModal v-model:open="isOpen" :title="`Bills for ${monthTitle}`" :description="`Total: IDR ${formatCurrency(totalAmount)} (${billsForMonth.length} bills)`">
    <template #body>
      <div class="space-y-3">
        <div
          v-for="bill in billsForMonth"
          :key="bill.id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ bill.name }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ bill.desc || 'No description' }}
              </p>
            </div>
            <div class="text-right ml-4">
              <div class="font-mono font-semibold text-green-600 dark:text-green-400">
                IDR {{ formatCurrency(bill.monthly_amount) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                per month
              </div>
            </div>
          </div>
        </div>

        <div v-if="billsForMonth.length === 0" class="text-center py-8 text-gray-500">
          No bills found for this month
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Bill } from '~/composables/useBills'
import { isNil } from 'jalutils'

interface Props {
  modelValue: boolean
  monthKey: string
  bills: readonly Bill[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const monthTitle = computed(() => {
  const [year, month] = props.monthKey.split('-')
  if (isNil(year) || isNil(month)) return props.monthKey
  
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const billsForMonth = computed(() => {
  const [year, month] = props.monthKey.split('-')
  if (isNil(year) || isNil(month)) return []
  
  const targetYear = parseInt(year)
  const targetMonth = parseInt(month) - 1 // 0-indexed
  
  return props.bills.filter(bill => {
    const startDate = new Date(bill.started_at)
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    
    // Check each month this bill covers
    for (let i = 0; i < bill.count; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(startMonth + i)
      
      if (paymentDate.getFullYear() === targetYear && paymentDate.getMonth() === targetMonth) {
        return true
      }
    }
    
    return false
  })
})

const totalAmount = computed(() => {
  return billsForMonth.value.reduce((sum, bill) => sum + bill.monthly_amount, 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}
</script>
