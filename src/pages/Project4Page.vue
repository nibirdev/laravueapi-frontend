<template>
  <div class="max-w-2xl mx-auto px-4 py-10">

    <router-link to="/" class="text-sm text-blue-500 hover:underline mb-6 inline-block">
      ← Back to Home
    </router-link>

    <h1 class="text-2xl font-bold text-gray-800 mb-1">Project 4 — Authentication</h1>
    <p class="text-gray-400 text-sm mb-8">Sanctum token auth • protected routes • token inspector</p>

    <!-- User Card -->
    <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400 mb-1">Logged in as</p>
          <p class="font-semibold text-gray-800">{{ auth.user?.name }}</p>
          <p class="text-sm text-gray-400">{{ auth.user?.email }}</p>
        </div>
        <button
          @click="handleLogout"
          class="text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Token Inspector -->
    <div class="bg-gray-900 rounded-2xl p-5 mb-6">
      <p class="text-xs text-gray-400 mb-2 font-mono">Authorization Header (sent with every request):</p>
      <p class="text-xs text-green-400 font-mono break-all">Bearer {{ auth.token }}</p>

      <div class="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-3">
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-1">Method</p>
          <span class="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded font-mono">GET</span>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-1">Endpoint</p>
          <span class="text-xs text-yellow-400 font-mono">/api/me</span>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-1">Status</p>
          <span class="text-xs font-mono" :class="meStatus === 200 ? 'text-green-400' : 'text-red-400'">
            {{ meStatus ?? '—' }}
          </span>
        </div>
      </div>

      <button
        @click="fetchMe"
        class="mt-4 w-full text-xs bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition font-mono"
      >
        GET /api/me
      </button>

      <pre v-if="meData" class="mt-3 text-xs text-green-300 font-mono">{{ meData }}</pre>
    </div>

    <!-- Protected Tasks -->
    <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h2 class="font-semibold text-gray-700 mb-4">Your Tasks (protected endpoint)</h2>

      <div v-if="loadingTasks" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center gap-3 border border-gray-100 rounded-lg px-4 py-2.5"
        >
          <span
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="{
              'bg-red-400': task.priority === 'high',
              'bg-yellow-400': task.priority === 'medium',
              'bg-gray-300': task.priority === 'low',
            }"
          />
          <span class="flex-1 text-sm text-gray-700">{{ task.title }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="task.status === 'done' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-400'"
          >
            {{ task.status }}
          </span>
        </li>
      </ul>

      <p v-if="!loadingTasks && tasks.length === 0" class="text-sm text-gray-400 text-center py-6">
        No tasks found.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../stores/auth'

const router      = useRouter()
const tasks       = ref([])
const loadingTasks = ref(false)
const meData      = ref(null)
const meStatus    = ref(null)

const fetchMe = async () => {
  try {
    const res  = await api.get('/me')
    meStatus.value = res.status
    meData.value   = JSON.stringify(res.data, null, 2)
  } catch (err) {
    meStatus.value = err.response?.status
  }
}

const fetchTasks = async () => {
  loadingTasks.value = true
  try {
    const res  = await api.get('/tasks')
    tasks.value = res.data.data ?? res.data
  } finally {
    loadingTasks.value = false
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  fetchTasks()
  fetchMe()
})
</script>