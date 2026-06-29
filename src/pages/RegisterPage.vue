<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

      <h1 class="text-2xl font-bold text-gray-800 mb-1">Create account</h1>
      <p class="text-gray-400 text-sm mb-6">
        Already have an account?
        <router-link to="/login" class="text-blue-500 hover:underline">Sign in</router-link>
      </p>

      <!-- Name -->
      <div class="mb-4">
        <label class="text-xs text-gray-500 mb-1 block">Name</label>
        <input
          v-model="form.name"
          placeholder="Your name"
          class="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'"
        />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name[0] }}</p>
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="text-xs text-gray-500 mb-1 block">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="you@example.com"
          class="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'"
        />
        <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email[0] }}</p>
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label class="text-xs text-gray-500 mb-1 block">Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="Min 8 characters"
          class="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'"
        />
        <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password[0] }}</p>
      </div>

      <!-- Confirm Password -->
      <div class="mb-6">
        <label class="text-xs text-gray-500 mb-1 block">Confirm Password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          placeholder="Repeat password"
          class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button
        @click="register"
        :disabled="loading"
        class="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
      >
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../stores/auth'

const router = useRouter()
const loading = ref(false)
const errors  = ref({})

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const register = async () => {
  errors.value = {}
  loading.value = true

  try {
    const res = await api.post('/register', form.value)
    // auth.login(res.data.token, res.data.user)
    const { token, user } = res.data.data
    auth.login(token, user)
    router.push('/')
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>