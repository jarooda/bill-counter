<script setup lang="ts">
const supabase = useSupabaseClient()
const loading = ref(false)
const error = ref<string | null>(null)

const signInWithGoogle = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    
    if (signInError) throw signInError
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in with Google'
    console.error('Error signing in:', err)
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Credit Card Bill Tracker
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Sign in to manage your bills and installment payments
          </p>
        </div>

        <div class="space-y-4">
          <!-- Error Alert -->
          <UAlert 
            v-if="error" 
            color="error" 
            variant="subtle" 
            title="Sign in failed" 
            :description="error"
            class="mb-4"
          />

          <!-- Google Sign In Button -->
          <UButton
            @click="signInWithGoogle"
            :loading="loading"
            :disabled="loading"
            size="lg"
            block
            class="justify-center"
          >
            <template #leading>
              <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </template>
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in with Google</span>
          </UButton>
        </div>

        <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By signing in, you agree to track your bills securely</p>
        </div>
      </div>
    </div>
  </div>
</template>
