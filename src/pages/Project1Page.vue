<template>
  <div class="min-h-screen bg-slate-100 py-10 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Back -->
      <router-link
        to="/"
        class="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
      >
        ← Back to Home
      </router-link>

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
        <h1 class="text-3xl font-bold text-slate-800">
          Task Manager
        </h1>

        <p class="text-slate-500 mt-2">
          Simple CRUD Application using Laravel API & Vue.js
        </p>
      </div>

      <!-- Add Task Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div class="flex gap-3">
          <input
            v-model="newTitle"
            @keyup.enter="addTask"
            placeholder="Enter a new task..."
            class="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            @click="addTask"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Add Task
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="bg-white rounded-2xl p-10 text-center text-slate-500 shadow-sm"
      >
        Loading tasks...
      </div>

      <!-- Empty -->
      <div
        v-else-if="tasks.length === 0"
        class="bg-white rounded-2xl p-10 text-center text-slate-500 shadow-sm"
      >
        No tasks found.
      </div>

      <!-- Tasks -->
      <div
        v-else
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <ul>
          <li
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
          >
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="task.status === 'done'"
              @change="toggleStatus(task)"
              class="w-5 h-5 accent-blue-600 cursor-pointer"
            />

            <!-- Edit Mode -->
            <template v-if="editingId === task.id">
              <input
                v-model="editTitle"
                class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                @click="updateTask(task)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>

              <button
                @click="editingId = null"
                class="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
              >
                Cancel
              </button>
            </template>

            <!-- View Mode -->
            <template v-else>
              <div class="flex-1">
                <p
                  class="font-medium"
                  :class="
                    task.status === 'done'
                      ? 'line-through text-slate-400'
                      : 'text-slate-700'
                  "
                >
                  {{ task.title }}
                </p>
              </div>

              <!-- Status Badge -->
              <span
                class="text-xs font-medium px-3 py-1 rounded-full"
                :class="
                  task.status === 'done'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                "
              >
                {{ task.status }}
              </span>

              <button
                @click="startEdit(task)"
                class="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Edit
              </button>

              <button
                @click="deleteTask(task.id)"
                class="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Delete
              </button>
            </template>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const tasks = ref([])
const newTitle = ref('')
const editingId = ref(null)
const editTitle = ref('')
const loading = ref(false)

const fetchTasks = async () => {
  loading.value = true
  const res = await api.get('/tasks')
  tasks.value = res.data
  loading.value = false
}

const addTask = async () => {
  if (!newTitle.value.trim()) return
  await api.post('/tasks', { title: newTitle.value })
  newTitle.value = ''
  fetchTasks()
}

const startEdit = (task) => {
  editingId.value = task.id
  editTitle.value = task.title
}

const updateTask = async (task) => {
  await api.put(`/tasks/${task.id}`, { title: editTitle.value })
  editingId.value = null
  fetchTasks()
}

const toggleStatus = async (task) => {
  await api.put(`/tasks/${task.id}`, {
    status: task.status === 'pending' ? 'done' : 'pending'
  })
  fetchTasks()
}

const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`)
  fetchTasks()
}

onMounted(fetchTasks)
</script>