<script setup lang="ts">
import type { Bill } from "~/composables/useBills"

// Initialize bills data
const { fetchBills, loading, error, bills } = useBills()

// Modal states
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedBill = ref<Bill | null>(null)
const editingBill = ref<Bill | null>(null)

// Fetch bills on mount
onMounted(() => {
  fetchBills()
})

// Handler for creating new bill
const handleCreateBill = () => {
  editingBill.value = null
  showCreateModal.value = true
}

// Handler for editing bill from table
const handleEditBillFromTable = (bill: Bill) => {
  selectedBill.value = bill
  showDetailModal.value = true
}

// Handler for editing bill from detail modal
const handleEditBillFromDetail = (bill: Bill) => {
  editingBill.value = bill
  showDetailModal.value = false
  showCreateModal.value = true
}

// Handler for successful operations
const handleSuccess = () => {
  fetchBills() // Refresh the data
}

// Handler for bill deletion
const handleBillDeleted = () => {
  fetchBills() // Refresh the data
  selectedBill.value = null
}

useHead({
  title: "Credit Card Bill Tracker",
  meta: [
    {
      name: "description",
      content: "Track your credit card bills and installment payments easily."
    }
  ]
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NuxtRouteAnnouncer />

      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div class="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div class="text-center sm:text-left">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Credit Card Bill Tracker
              </h1>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Track your installment payments and monthly dues
              </p>
            </div>
            <div class="flex justify-center sm:justify-end">
              <UButton @click="handleCreateBill" icon="i-heroicons-plus" class="w-full sm:w-auto justify-center">
                <span class="sm:inline">Add New Bill</span>
                <span class="sm:hidden">Add Bill</span>
              </UButton>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="text-gray-500 dark:text-gray-400">Loading bills...</p>
          </div>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" color="error" variant="subtle" :title="'Error loading bills'" :description="error" class="mb-6" />

        <!-- Bills Content -->
        <BillTable v-else :bills="bills" @edit-bill="handleEditBillFromTable" />
      </main>

      <!-- Modals -->
      <BillFormModal
        v-model:open="showCreateModal"
        :bill="editingBill"
        @success="handleSuccess"
      />

      <BillDetailModal
        v-model:open="showDetailModal"
        :bill="selectedBill"
        @edit-bill="handleEditBillFromDetail"
        @deleted="handleBillDeleted"
      />
    </div>
  </UApp>
</template>
