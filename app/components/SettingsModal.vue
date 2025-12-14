<template>
  <UModal v-model:open="isOpen" title="Settings" description="Configure your monthly threshold and other preferences.">
    <template #body>
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="flex flex-col items-center space-y-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Saving...</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Monthly Threshold Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monthly Threshold (IDR)
          </label>
          <input
            ref="thresholdInput"
            type="text"
            placeholder="e.g., 1.000.000"
            :disabled="loading"
            required
            class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-600"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Months with bills exceeding this amount will be highlighted in red
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p class="text-sm text-green-600 dark:text-green-400">Settings updated successfully!</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
            :disabled="loading"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading"
          >
            Save Settings
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useCurrencyMask } from '~/composables/useCurrencyMask'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { monthlyThreshold, updateMonthlyThreshold } = useBills()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const { el: thresholdInput, typed: thresholdTyped } = useCurrencyMask()

// Watch for modal open and set initial value
watch(() => props.open, (newValue) => {
  if (newValue) {
    // Wait for next tick to ensure the input is mounted
    nextTick(() => {
      if (thresholdInput.value) {
        // Set the unmasked value directly - IMask will format it
        thresholdInput.value.value = monthlyThreshold.value.toString()
        // Trigger input event to update IMask
        thresholdInput.value.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
    error.value = null
    success.value = false
  }
})

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  success.value = false

  try {
    const threshold = thresholdTyped.value
    
    if (isNaN(threshold) || threshold < 0) {
      error.value = 'Please enter a valid positive number'
      return
    }

    await updateMonthlyThreshold(threshold)
    success.value = true
    
    // Close modal after short delay to show success message
    setTimeout(() => {
      isOpen.value = false
      emit('success')
    }, 1000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update settings'
  } finally {
    loading.value = false
  }
}
</script>
