<script setup lang="ts">
import type { Bill } from "~/composables/useBills"

// Authentication
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// Initialize bills data
const { fetchBills, loading, error, bills } = useBills()

// Modal states
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedBill = ref<Bill | null>(null)
const editingBill = ref<Bill | null>(null)

// Fetch bills on mount when user is authenticated
onMounted(() => {
  if (user.value) {
    fetchBills()
  }
})

// Watch for user changes and fetch bills
watch(user, (newUser) => {
  if (newUser) {
    fetchBills()
  }
})

// Logout handler
const handleLogout = async () => {
  await supabase.auth.signOut()
}

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
  showDetailModal.value = false
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
    <!-- Show login if not authenticated -->
    <Login v-if="!user" />

    <!-- Show app if authenticated -->
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            <div class="flex items-center gap-3 justify-center sm:justify-end">
              <!-- User Info -->
              <div v-if="user" class="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div class="flex items-center gap-2">
                  <div v-if="user.user_metadata?.avatar_url" class="w-8 h-8 rounded-full overflow-hidden">
                    <img :src="user.user_metadata.avatar_url" :alt="user.email" class="w-full h-full object-cover" />
                  </div>
                  <span class="font-medium">{{ user.email }}</span>
                </div>
              </div>
              
              <!-- Logout Button -->
              <UButton 
                @click="handleLogout" 
                icon="i-heroicons-arrow-right-on-rectangle" 
                color="neutral"
                variant="ghost"
                class="sm:w-auto"
              >
                <span class="hidden sm:inline">Logout</span>
              </UButton>
              
              <!-- Add Bill Button -->
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
