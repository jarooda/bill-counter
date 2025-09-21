import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      monthlyThreshold: process.env.MONTHLY_THRESHOLD || '1000000'
    }
  },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()]
  },
  supabase: {
    redirect: false
  }
})