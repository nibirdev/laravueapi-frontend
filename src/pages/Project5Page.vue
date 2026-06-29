<template>
  <div class="max-w-3xl mx-auto px-4 py-10">

    <router-link to="/" class="text-sm text-blue-500 hover:underline mb-6 inline-block">
      ← Back to Home
    </router-link>

    <h1 class="text-2xl font-bold text-gray-800 mb-1">Project 5 — Authorization</h1>
    <p class="text-gray-400 text-sm mb-8">Role-based access • Admin vs User • 403 Forbidden</p>

    <!-- Role Badge -->
    <div class="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm mb-6">
      <div class="flex-1">
        <p class="text-sm text-gray-500">Logged in as <strong class="text-gray-800">{{ auth.user?.name }}</strong></p>
        <p class="text-xs text-gray-400">{{ auth.user?.email }}</p>
      </div>
      <span
        class="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
        :class="auth.isAdmin
          ? 'bg-purple-100 text-purple-600'
          : 'bg-blue-50 text-blue-500'"
      >
        {{ auth.user?.role }}
      </span>
    </div>

    <!-- What you can do -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase mb-3">User Permissions</p>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2 text-green-600">✓ View own tasks</li>
          <li class="flex items-center gap-2 text-green-600">✓ Create tasks</li>
          <li class="flex items-center gap-2 text-green-600">✓ Edit own tasks</li>
          <li class="flex items-center gap-2 text-green-600">✓ Delete own tasks</li>
          <li class="flex items-center gap-2 text-red-400">✗ View all users</li>
          <li class="flex items-center gap-2 text-red-400">✗ Change user roles</li>
          <li class="flex items-center gap-2 text-red-400">✗ View others' tasks</li>
        </ul>
      </div>
      <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase mb-3">Admin Permissions</p>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2 text-green-600">✓ View ALL tasks</li>
          <li class="flex items-center gap-2 text-green-600">✓ Create tasks</li>
          <li class="flex items-center gap-2 text-green-600">✓ Edit any task</li>
          <li class="flex items-center gap-2 text-green-600">✓ Delete any task</li>
          <li class="flex items-center gap-2 text-green-600">✓ View all users</li>
          <li class="flex items-center gap-2 text-green-600">✓ Change user roles</li>
          <li class="flex items-center gap-2 text-green-600">✓ Full access</li>
        </ul>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4">
      <button
        @click="activeTab = 'tasks'"
        class="text-sm px-4 py-2 rounded-lg transition"
        :class="activeTab === 'tasks'
          ? 'bg-blue-500 text-white'
          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        {{ auth.isAdmin ? 'All Tasks' : 'My Tasks' }}
      </button>
      <button
        v-if="auth.isAdmin"
        @click="activeTab = 'users'; fetchUsers()"
        class="text-sm px-4 py-2 rounded-lg transition"
        :class="activeTab === 'users'
          ? 'bg-purple-500 text-white'
          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        Manage Users
      </button>
      <button
        @click="test403"
        class="text-sm px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition ml-auto"
      >
        Test 403 →
      </button>
    </div>

    <!-- Tasks Tab -->
    <div v-if="activeTab === 'tasks'">

      <!-- Add Task -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newTitle"
          @keyup.enter="addTask"
          placeholder="New task..."
          class="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          @click="addTask"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Add
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingTasks" class="space-y-2">
        <div v-for="n in 4" :key="n" class="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <!-- Task List -->
      <ul v-else class="space-y-2">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
        >
          <span
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="{
              'bg-red-400':    task.priority === 'high',
              'bg-yellow-400': task.priority === 'medium',
              'bg-gray-300':   task.priority === 'low',
            }"
          />
          <span class="flex-1 text-sm text-gray-700">{{ task.title }}</span>

          <!-- Show owner if admin -->
          <span v-if="auth.isAdmin" class="text-xs text-gray-300">
            {{ task.user?.name ?? 'Unknown' }}
          </span>

          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="task.status === 'done'
              ? 'bg-green-50 text-green-500'
              : 'bg-blue-50 text-blue-400'"
          >
            {{ task.status }}
          </span>

          <button
            @click="deleteTask(task.id)"
            class="text-xs text-red-400 hover:underline"
          >
            Delete
          </button>
        </li>
      </ul>

      <p v-if="!loadingTasks && tasks.length === 0" class="text-center text-gray-400 text-sm py-8">
        No tasks found.
      </p>
    </div>

    <!-- Users Tab (Admin only) -->
    <div v-if="activeTab === 'users' && auth.isAdmin">
      <div v-if="loadingUsers" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="user in users"
          :key="user.id"
          class="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">{{ user.name }}</p>
            <p class="text-xs text-gray-400">{{ user.email }} · {{ user.tasks_count }} tasks</p>
          </div>

          <!-- Role toggle -->
          <select
            :value="user.role"
            @change="updateRole(user, $event.target.value)"
            class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200"
            :disabled="user.id === auth.user?.id"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="user.role === 'admin'
              ? 'bg-purple-100 text-purple-600'
              : 'bg-blue-50 text-blue-500'"
          >
            {{ user.role }}
          </span>
        </li>
      </ul>
    </div>

    <!-- 403 Test Panel -->
    <div v-if="forbidden403" class="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
      <p class="text-sm font-semibold text-red-600 mb-1">403 Forbidden Response</p>
      <pre class="text-xs text-red-500 font-mono">{{ forbidden403 }}</pre>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { auth } from '../stores/auth'

const activeTab    = ref('tasks')
const tasks        = ref([])
const users        = ref([])
const newTitle     = ref('')
const loadingTasks = ref(false)
const loadingUsers = ref(false)
const forbidden403 = ref(null)

const fetchTasks = async () => {
  loadingTasks.value = true
  try {
    const res   = await api.get('/tasks')
    tasks.value = res.data.data ?? res.data
  } finally {
    loadingTasks.value = false
  }
}

const fetchUsers = async () => {
  if (users.value.length) return
  loadingUsers.value = true
  try {
    const res   = await api.get('/admin/users')
    users.value = res.data
  } finally {
    loadingUsers.value = false
  }
}

const addTask = async () => {
  if (!newTitle.value.trim()) return
  await api.post('/tasks', { title: newTitle.value })
  newTitle.value = ''
  fetchTasks()
}

const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  } catch (err) {
    if (err.response?.status === 403) {
      forbidden403.value = JSON.stringify(err.response.data, null, 2)
    }
  }
}

const updateRole = async (user, role) => {
  await api.patch(`/admin/users/${user.id}/role`, { role })
  user.role = role
}

// Test 403 — user try to hit admin endpoint
const test403 = async () => {
  try {
    await api.get('/admin/users')
    forbidden403.value = null
  } catch (err) {
    forbidden403.value = JSON.stringify({
      status:  err.response?.status,
      message: err.response?.data?.message,
    }, null, 2)
  }
}

onMounted(fetchTasks)
</script>