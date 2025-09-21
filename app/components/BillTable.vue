<template>
  <div class="space-y-8">
    <!-- Current & Future Years (Accordion) -->
    <div v-if="currentAndFutureYears.length > 0" class="space-y-6">
      <UAccordion
        :items="currentAndFutureAccordionItems"
        v-model="openItems"
        multiple
      >
        <template #default="{ item, index, open }">
          <UButton
            :color="parseInt(item.label || '0') === currentYear ? 'primary' : 'neutral'"
            variant="ghost"
            class="p-0 font-medium w-full h-full flex items-center"
          >
            <div class="flex items-center justify-between w-full py-2">
              <div class="flex items-center">
                <span class="text-xl font-semibold flex items-center">
                  {{ item.label }}
                  <span v-if="item.label && parseInt(item.label) === currentYear" class="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    Current Year
                  </span>
                </span>
              </div>
              <p class="text-sm text-gray-500 ml-2">
                {{ item.label ? (billsByYear[item.label]?.length || 0) : 0 }} {{ (item.label ? (billsByYear[item.label]?.length || 0) : 0) === 1 ? 'bill' : 'bills' }}
              </p>
            </div>
          </UButton>
        </template>

        <template #item="{ item }">
          <div v-if="item.label" class="space-y-6 p-4">
            <!-- Bills Table -->
            <UTable
              :data="billsByYear[item.label] || []"
              :columns="columns"
              class="w-full"
            >
              <template #name-cell="{ row }">
                <button 
                  @click="$emit('edit-bill', row.original)"
                  class="text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium hover:underline"
                >
                  {{ row.original.name }}
                </button>
              </template>

              <template #desc-cell="{ row }">
                <span class="text-gray-600 dark:text-gray-300">{{ row.original.desc || '-' }}</span>
              </template>

              <template #amount-cell="{ row }">
                <span class="font-mono">IDR {{ formatCurrency(row.original.amount) }}</span>
              </template>

              <template #monthly_amount-cell="{ row }">
                <span class="font-mono text-green-600 dark:text-green-400">IDR {{ formatCurrency(row.original.monthly_amount) }}</span>
              </template>

              <template #count-cell="{ row }">
                <span class="font-medium">{{ row.original.count }} months</span>
              </template>

              <template #started_at-cell="{ row }">
                <span class="text-gray-600 dark:text-gray-300">{{ formatDate(row.original.started_at) }}</span>
              </template>

              <template #status-cell="{ row }">
                <UBadge 
                  :color="getBillStatus(row.original).color as any" 
                  :variant="getBillStatus(row.original).variant as any"
                >
                  {{ getBillStatus(row.original).label }}
                </UBadge>
              </template>
            </UTable>

            <!-- Monthly Summary for Each Year -->
            <div class="mt-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Payment Summary {{ item.label }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div 
                  v-for="(amount, month) in getYearMonthlyPayments(parseInt(item.label))" 
                  :key="month"
                  :class="getMonthStatusClass(month.toString())"
                  class="p-4 rounded-lg"
                >
                  <div class="text-sm font-medium">
                    {{ formatMonth(month) }}
                  </div>
                  <div class="text-lg font-bold">
                    IDR {{ formatCurrency(amount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UAccordion>
    </div>

    <!-- Separator for Previous Years -->
    <div v-if="pastYears.length > 0" class="border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-6 flex items-center">
        <span class="mr-3">Previous Years</span>
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      </h2>
      
      <!-- Past Years (Simple Tables) -->
      <div class="space-y-6">
        <div v-for="year in pastYears" :key="year">
          <!-- Bills Table for Past Year -->
          <UTable
            :data="billsByYear[year] || []"
            :columns="columns"
            class="w-full"
          >
            <template #name-cell="{ row }">
              <button 
                @click="$emit('edit-bill', row.original)"
                class="text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium hover:underline"
              >
                {{ row.original.name }}
              </button>
            </template>

            <template #desc-cell="{ row }">
              <span class="text-gray-600 dark:text-gray-300">{{ row.original.desc || '-' }}</span>
            </template>

            <template #amount-cell="{ row }">
              <span class="font-mono">IDR {{ formatCurrency(row.original.amount) }}</span>
            </template>

            <template #monthly_amount-cell="{ row }">
              <span class="font-mono text-green-600 dark:text-green-400">IDR {{ formatCurrency(row.original.monthly_amount) }}</span>
            </template>

            <template #count-cell="{ row }">
              <span class="font-medium">{{ row.original.count }} months</span>
            </template>

            <template #started_at-cell="{ row }">
              <span class="text-gray-600 dark:text-gray-300">{{ formatDate(row.original.started_at) }}</span>
            </template>

            <template #status-cell="{ row }">
              <UBadge 
                :color="getBillStatus(row.original).color as any" 
                :variant="getBillStatus(row.original).variant as any"
              >
                {{ getBillStatus(row.original).label }}
              </UBadge>
            </template>
          </UTable>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="Object.keys(billsByYear).length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg mb-2">No bills found</div>
      <p class="text-gray-500">Start by adding your first installment bill</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bill } from '~/composables/useBills'

interface Props {
  bills: readonly Bill[]
}

interface Emits {
  (e: 'edit-bill', bill: Bill): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { getMonthlyPayments } = useBills()

const currentYear = new Date().getFullYear()

// Group bills by year
const getBillsByYear = () => {
  const billsByYear: Record<string, Bill[]> = {}
  
  props.bills.forEach(bill => {
    const startDate = new Date(bill.started_at)
    const startYear = startDate.getFullYear()
    
    // Calculate all years this bill spans
    const endDate = new Date(startDate)
    endDate.setMonth(startDate.getMonth() + bill.count - 1)
    const endYear = endDate.getFullYear()
    
    // Add bill to all years it spans
    for (let year = startYear; year <= endYear; year++) {
      const yearString = year.toString()
      if (!billsByYear[yearString]) {
        billsByYear[yearString] = []
      }
      billsByYear[yearString].push(bill)
    }
  })

  // Sort years in descending order
  const sortedYears = Object.keys(billsByYear).sort((a, b) => parseInt(b) - parseInt(a))
  const sortedBillsByYear: Record<string, Bill[]> = {}
  
  sortedYears.forEach(year => {
    const yearBills = billsByYear[year]
    if (yearBills) {
      // Remove duplicates (in case same bill appears multiple times)
      const uniqueBills = Array.from(new Map(yearBills.map(bill => [bill.id, bill])).values())
      sortedBillsByYear[year] = uniqueBills.sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
    }
  })

  return sortedBillsByYear
}

const billsByYear = computed(() => getBillsByYear())

// Separate years into past and current/future
const currentAndFutureYears = computed(() => {
  return Object.keys(billsByYear.value).filter(year => parseInt(year) >= currentYear).sort((a, b) => parseInt(b) - parseInt(a))
})

const pastYears = computed(() => {
  return Object.keys(billsByYear.value).filter(year => parseInt(year) < currentYear).sort((a, b) => parseInt(b) - parseInt(a))
})

// Create accordion items from current and future years only
const currentAndFutureAccordionItems = computed(() => {
  return currentAndFutureYears.value.map(year => ({
    label: year,
    icon: undefined,
    disabled: false,
    slot: 'item'
  }))
})

// Create accordion items from billsByYear (kept for compatibility)
const accordionItems = computed(() => {
  return Object.keys(billsByYear.value).map(year => ({
    label: year,
    icon: undefined,
    disabled: false,
    slot: 'item'
  }))
})

// Open items for accordion - ensure current year is expanded
const openItems = ref<string>('')

// Watch for changes in billsByYear to set default open items for current/future years
watch(currentAndFutureYears, (newCurrentAndFutureYears) => {
  const currentYearString = currentYear.toString()
  const currentYearIndex = newCurrentAndFutureYears.findIndex(year => year === currentYearString)
  openItems.value = currentYearIndex >= 0 ? currentYearIndex.toString() : newCurrentAndFutureYears.length > 0 ? '0' : ''
}, { immediate: true })

// Calculate monthly payments for bills
const getPropsMonthlyPayments = () => {
  const monthlyPayments: Record<string, number> = {}

  props.bills.forEach(bill => {
    const startDate = new Date(bill.started_at)
    
    for (let i = 0; i < bill.count; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(startDate.getMonth() + i)
      
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyPayments[monthKey]) {
        monthlyPayments[monthKey] = 0
      }
      monthlyPayments[monthKey] += bill.monthly_amount
    }
  })

  return monthlyPayments
}
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'desc', header: 'Description' },
  { accessorKey: 'amount', header: 'Total Amount' },
  { accessorKey: 'monthly_amount', header: 'Monthly Payment' },
  { accessorKey: 'count', header: 'Duration' },
  { accessorKey: 'started_at', header: 'Start Month' },
  { id: 'status', header: 'Status' }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}

const formatMonth = (monthKey: string | number) => {
  const monthKeyStr = monthKey.toString()
  const [year, month] = monthKeyStr.split('-')
  if (!year || !month) return monthKeyStr
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}

const getBillStatus = (bill: Bill) => {
  const now = new Date()
  const startDate = new Date(bill.started_at)
  const endDate = new Date(startDate)
  endDate.setMonth(startDate.getMonth() + bill.count)

  if (now >= endDate) {
    return { label: 'Completed', color: 'neutral', variant: 'subtle' }
  } else {
    return { label: 'Ongoing', color: 'success', variant: 'subtle' }
  }
}

const getYearMonthlyPayments = (year: number) => {
  const allMonthlyPayments = getPropsMonthlyPayments()
  const yearPayments: Record<string, number> = {}
  
  Object.entries(allMonthlyPayments).forEach(([monthKey, amount]) => {
    if (monthKey.startsWith(year.toString())) {
      yearPayments[monthKey] = amount as number
    }
  })
  
  // Sort by month in reverse order (December first)
  const sortedEntries = Object.entries(yearPayments).sort(([a], [b]) => b.localeCompare(a))
  return Object.fromEntries(sortedEntries)
}

const getMonthStatusClass = (monthKey: string) => {
  const [year, month] = monthKey.split('-')
  if (!year || !month) return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  
  const monthDate = new Date(parseInt(year), parseInt(month) - 1)
  const currentDate = new Date()
  const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth())
  
  if (monthDate < currentMonth) {
    // Past month - gray
    return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
  } else if (monthDate.getTime() === currentMonth.getTime()) {
    // Current month - green
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  } else {
    // Future month - yellow
    return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  }
}
</script>