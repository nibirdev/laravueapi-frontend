<template>
  <div class="min-h-screen bg-slate-50 py-10 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Back -->
      <router-link
        to="/"
        class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6 transition"
      >
        ← Back to Home
      </router-link>

      <!-- Header -->
      <div
        class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg mb-8"
      >
        <h1 class="text-3xl font-bold mb-2">
          Error Handling Playground
        </h1>

        <p class="text-blue-100">
          Test validation errors (422), resource not found (404), and inspect API responses.
        </p>
      </div>

      <!-- Toast -->
      <transition
        enter-active-class="transition duration-300"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="toast.show"
          class="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-white shadow-xl"
          :class="
            toast.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-red-500'
          "
        >
          {{ toast.message }}
        </div>
      </transition>

      <!-- Add Task -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
      >
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-slate-800">
            Create New Task
          </h2>

          <span
            class="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full"
          >
            POST /tasks
          </span>
        </div>

        <label class="block text-sm font-medium text-slate-600 mb-2">
          Task Title
        </label>

        <input
          v-model="newTitle"
          placeholder="Enter task title (minimum 3 characters)"
          class="w-full rounded-xl px-4 py-3 border transition outline-none"
          :class="
            errors.title
              ? 'border-red-300 focus:ring-4 focus:ring-red-100'
              : 'border-slate-200 focus:ring-4 focus:ring-blue-100'
          "
        />

        <div
          v-if="errors.title"
          class="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
        >
          <p class="text-sm text-red-600">
            {{ errors.title[0] }}
          </p>
        </div>

        <button
          @click="addTask"
          :disabled="submitting"
          class="w-full mt-5 py-3 rounded-xl text-white font-medium transition shadow-sm"
          :class="
            submitting
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          "
        >
          {{ submitting ? 'Creating Task...' : 'Create Task' }}
        </button>
      </div>

      <!-- Fetch Task -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
      >
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-slate-800">
            Find Task by ID
          </h2>

          <span
            class="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full"
          >
            GET /tasks/{id}
          </span>
        </div>

        <div class="flex gap-3">
          <input
            v-model="searchId"
            type="number"
            placeholder="Enter task ID"
            class="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"
          />

          <button
            @click="fetchById"
            class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition"
          >
            Search
          </button>
        </div>

        <!-- Success -->
        <div
          v-if="fetchedTask"
          class="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"
            >
              ✅
            </div>

            <div>
              <p class="font-medium text-emerald-700">
                Task Found
              </p>

              <p class="text-sm text-emerald-600 mt-1">
                {{ fetchedTask.title }}
              </p>

              <span
                class="inline-block mt-2 text-xs bg-white border border-emerald-200 px-3 py-1 rounded-full"
              >
                {{ fetchedTask.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="fetchError"
          class="mt-5 bg-red-50 border border-red-100 rounded-xl p-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
            >
              ❌
            </div>

            <div>
              <p class="font-medium text-red-700">
                Request Failed
              </p>

              <p class="text-sm text-red-600">
                {{ fetchError }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- API Response -->
      <div
        class="bg-slate-950 rounded-2xl overflow-hidden shadow-lg"
      >
        <div
          class="px-5 py-4 border-b border-slate-800 flex justify-between items-center"
        >
          <h2 class="text-sm font-semibold text-white">
            API Response Inspector
          </h2>

          <span class="text-xs text-slate-400">
            JSON Output
          </span>
        </div>

        <pre
          class="p-5 text-sm text-green-400 overflow-auto min-h-[220px]"
        >{{ lastResponse }}</pre>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const newTitle = ref('')
const errors = ref({})
const submitting = ref(false)
const searchId = ref('')
const fetchedTask = ref(null)
const fetchError = ref('')
const lastResponse = ref('No request made yet.')

const toast = ref({ show: false, type: 'success', message: '' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, type, message }
  setTimeout(() => (toast.value.show = false), 3000)
}

const addTask = async () => {
  errors.value = {}
  submitting.value = true

  try {
    const res = await api.post('/tasks', { title: newTitle.value })
    lastResponse.value = JSON.stringify({ status: 201, data: res.data }, null, 2)
    showToast('Task created successfully!')
    newTitle.value = ''
  } catch (err) {
    const status = err.response?.status
    const data = err.response?.data

    lastResponse.value = JSON.stringify({ status, data }, null, 2)

    if (status === 422) {
      // Validation errors — show under each field
      errors.value = data.errors
      showToast('Validation failed. Check the form.', 'error')
    } else {
      showToast('Something went wrong.', 'error')
    }
  } finally {
    submitting.value = false
  }
}

const fetchById = async () => {
  fetchedTask.value = null
  fetchError.value = ''

  try {
    const res = await api.get(`/tasks/${searchId.value}`)
    fetchedTask.value = res.data
    lastResponse.value = JSON.stringify({ status: 200, data: res.data }, null, 2)
  } catch (err) {
    const status = err.response?.status
    const data = err.response?.data

    lastResponse.value = JSON.stringify({ status, data }, null, 2)

    if (status === 404) {
      fetchError.value = `404 — ${data.message}`
    } else {
      fetchError.value = 'Unexpected error occurred.'
    }
  }
}
</script>