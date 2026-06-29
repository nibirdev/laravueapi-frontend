<template>
  <div class="max-w-3xl mx-auto px-4 py-10">

    <router-link to="/" class="text-sm text-blue-500 hover:underline mb-6 inline-block">
      ← Back to Home
    </router-link>

    <h1 class="text-2xl font-bold text-gray-800 mb-1">Project 6 — API Resources</h1>
    <p class="text-gray-400 text-sm mb-8">
      Consistent response shape • computed fields • nested relations • response inspector
    </p>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="text-sm px-4 py-2 rounded-lg transition"
        :class="activeTab === tab.id
          ? 'bg-blue-500 text-white'
          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Task List -->
    <div v-if="activeTab === 'list'">
      <div v-if="loading" class="space-y-2">
        <div v-for="n in 4" :key="n" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <!-- Summary Stats from meta -->
      <div v-if="meta" class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-gray-800">{{ meta.summary.total_tasks }}</p>
          <p class="text-xs text-gray-400 mt-1">Total Tasks</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-blue-500">{{ meta.summary.pending_count }}</p>
          <p class="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-500">{{ meta.summary.done_count }}</p>
          <p class="text-xs text-gray-400 mt-1">Done</p>
        </div>
      </div>

      <ul class="space-y-3">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <span
              class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              :class="{
                'bg-red-400':    task.priority === 'high',
                'bg-yellow-400': task.priority === 'medium',
                'bg-gray-300':   task.priority === 'low',
              }"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span
                  class="text-sm font-medium"
                  :class="task.is_done ? 'line-through text-gray-400' : 'text-gray-700'"
                >
                  {{ task.title }}
                </span>
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="task.is_done
                      ? 'bg-green-50 text-green-500'
                      : 'bg-blue-50 text-blue-400'"
                  >
                    {{ task.status }}
                  </span>
                  <span class="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                    P{{ task.priority_level }}
                  </span>
                </div>
              </div>

              <!-- Resource computed fields -->
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-gray-400">{{ task.created_ago }}</span>
                <span v-if="task.owner" class="text-xs text-gray-300">
                  by {{ task.owner.name }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Tab: Single Task Inspector -->
    <div v-if="activeTab === 'single'">
      <div class="flex gap-2 mb-4">
        <input
          v-model="taskId"
          type="number"
          placeholder="Enter task ID..."
          class="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          @click="fetchSingle"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Fetch
        </button>
      </div>

      <div v-if="singleTask" class="space-y-3">
        <!-- Rendered -->
        <div class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-800">{{ singleTask.title }}</h3>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="singleTask.is_done ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-400'"
            >
              {{ singleTask.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>Priority: <strong>{{ singleTask.priority }}</strong> (level {{ singleTask.priority_level }})</div>
            <div>Done: <strong>{{ singleTask.is_done ? 'Yes' : 'No' }}</strong></div>
            <div>Created: <strong>{{ singleTask.created_at }}</strong></div>
            <div>Updated: <strong>{{ singleTask.updated_at }}</strong></div>
            <div class="col-span-2">Age: <strong>{{ singleTask.created_ago }}</strong></div>
            <div v-if="singleTask.owner" class="col-span-2">
              Owner: <strong>{{ singleTask.owner.name }}</strong>
            </div>
          </div>
        </div>

        <!-- Raw JSON -->
        <div class="bg-gray-900 rounded-xl p-4">
          <p class="text-xs text-gray-400 mb-2 font-mono">Raw API Response (GET /api/tasks/{{ taskId }}):</p>
          <pre class="text-xs text-green-400 font-mono overflow-auto">{{ singleJson }}</pre>
        </div>
      </div>
    </div>

    <!-- Tab: Response Shape Comparison -->
    <div v-if="activeTab === 'compare'">
      <p class="text-sm text-gray-500 mb-4">
        Before vs After — raw model vs API Resource:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Before -->
        <div>
          <p class="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wider">
            ✗ Before (raw model)
          </p>
          <div class="bg-gray-900 rounded-xl p-4">
            <pre class="text-xs text-red-300 font-mono">{{ beforeShape }}</pre>
          </div>
        </div>

        <!-- After -->
        <div>
          <p class="text-xs font-semibold text-green-500 mb-2 uppercase tracking-wider">
            ✓ After (API Resource)
          </p>
          <div class="bg-gray-900 rounded-xl p-4">
            <pre class="text-xs text-green-300 font-mono">{{ afterShape }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Collection Meta -->
    <div v-if="activeTab === 'meta'">
      <div class="bg-gray-900 rounded-xl p-5">
        <p class="text-xs text-gray-400 mb-3 font-mono">Collection Response Shape:</p>
        <pre class="text-xs text-green-400 font-mono overflow-auto">{{ collectionJson }}</pre>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const activeTab  = ref('list')
const tasks      = ref([])
const meta       = ref(null)
const loading    = ref(false)
const taskId     = ref('')
const singleTask = ref(null)
const singleJson = ref('')
const collectionJson = ref('')

const tabs = [
  { id: 'list',    label: 'Task List' },
  { id: 'single',  label: 'Single Inspector' },
  { id: 'compare', label: 'Before vs After' },
  { id: 'meta',    label: 'Collection Meta' },
]

const fetchTasks = async () => {
  loading.value = true
  try {
    const res    = await api.get('/tasks', { params: { per_page: 5 } })
    tasks.value  = res.data.data
    meta.value   = res.data.meta
    collectionJson.value = JSON.stringify(res.data, null, 2)
  } finally {
    loading.value = false
  }
}

const fetchSingle = async () => {
  if (!taskId.value) return
  try {
    const res       = await api.get(`/tasks/${taskId.value}`)
    singleTask.value = res.data.data
    singleJson.value = JSON.stringify(res.data, null, 2)
  } catch (err) {
    singleTask.value = null
    singleJson.value = JSON.stringify({
      success: false,
      message: err.response?.data?.message ?? 'Not found',
    }, null, 2)
  }
}

// Static comparison shapes
const beforeShape = JSON.stringify({
  id: 1,
  title: 'Learn Laravel',
  status: 'pending',
  priority: 'high',
  user_id: 3,
  created_at: '2024-01-15T10:30:00.000000Z',
  updated_at: '2024-01-15T10:30:00.000000Z',
}, null, 2)

const afterShape = JSON.stringify({
  success: true,
  message: 'Success',
  data: {
    id: 1,
    title: 'Learn Laravel',
    status: 'pending',
    priority: 'high',
    is_done: false,
    priority_level: 3,
    owner: { id: 3, name: 'John Doe' },
    created_at: '2024-01-15 10:30',
    updated_at: '2024-01-15 10:30',
    created_ago: '2 days ago',
  },
}, null, 2)

onMounted(fetchTasks)
</script>