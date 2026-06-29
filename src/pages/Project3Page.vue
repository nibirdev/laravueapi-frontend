<template>
  <div class="max-w-3xl mx-auto px-4 py-10">

    <!-- Header -->
    <router-link to="/" class="text-sm text-blue-500 hover:underline mb-6 inline-block">
      ← Back to Home
    </router-link>
    <h1 class="text-2xl font-bold text-gray-800 mb-1">Project 3 — Filtering & Pagination</h1>
    <p class="text-gray-400 text-sm mb-8">Query params • search • sort • paginate</p>

    <!-- Active URL display -->
    <div class="bg-gray-900 rounded-lg px-4 py-2 mb-6 font-mono text-xs text-green-400 break-all">
      GET {{ currentUrl }}
    </div>

    <!-- Filters Row -->
    <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">

        <!-- Search -->
        <div class="col-span-2">
          <label class="text-xs text-gray-400 mb-1 block">Search</label>
          <input
            v-model="filters.search"
            @input="onFilterChange"
            placeholder="Search tasks..."
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Status</label>
          <select
            v-model="filters.status"
            @change="onFilterChange"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- Priority -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Priority</label>
          <select
            v-model="filters.priority"
            @change="onFilterChange"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <!-- Sort Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Sort By</label>
          <select
            v-model="filters.sort_by"
            @change="onFilterChange"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="created_at">Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Direction</label>
          <select
            v-model="filters.sort_dir"
            @change="onFilterChange"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-400 mb-1 block">Per Page</label>
          <select
            v-model="filters.per_page"
            @change="onFilterChange"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </div>

        <!-- Reset -->
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm text-gray-400">
        Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }} tasks
      </p>
      <p class="text-xs text-gray-300">Page {{ meta.current_page }} of {{ meta.last_page }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="tasks.length === 0"
      class="text-center py-16 text-gray-400"
    >
      <p class="text-3xl mb-2">🔍</p>
      <p class="text-sm">No tasks match your filters.</p>
    </div>

    <!-- Task List -->
    <ul v-else class="space-y-2 mb-6">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
      >
        <!-- Priority dot -->
        <span
          class="w-2 h-2 rounded-full flex-shrink-0"
          :class="{
            'bg-red-400': task.priority === 'high',
            'bg-yellow-400': task.priority === 'medium',
            'bg-gray-300': task.priority === 'low',
          }"
        />

        <span
          class="flex-1 text-sm"
          :class="task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'"
        >
          {{ task.title }}
        </span>

        <!-- Priority badge -->
        <span
          class="text-xs px-2 py-0.5 rounded-full capitalize"
          :class="{
            'bg-red-50 text-red-500': task.priority === 'high',
            'bg-yellow-50 text-yellow-500': task.priority === 'medium',
            'bg-gray-100 text-gray-400': task.priority === 'low',
          }"
        >
          {{ task.priority }}
        </span>

        <!-- Status badge -->
        <span
          class="text-xs px-2 py-0.5 rounded-full"
          :class="task.status === 'done' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'"
        >
          {{ task.status }}
        </span>
      </li>
    </ul>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-2">
      <button
        @click="goToPage(meta.current_page - 1)"
        :disabled="meta.current_page === 1"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
      >
        ← Prev
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        class="px-3 py-1.5 text-sm border rounded-lg transition"
        :class="page === meta.current_page
          ? 'bg-blue-500 text-white border-blue-500'
          : 'border-gray-200 hover:bg-gray-50'"
      >
        {{ page }}
      </button>

      <button
        @click="goToPage(meta.current_page + 1)"
        :disabled="meta.current_page === meta.last_page"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
      >
        Next →
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const tasks = ref([])
const loading = ref(false)

const filters = ref({
  search: '',
  status: 'all',
  priority: 'all',
  sort_by: 'created_at',
  sort_dir: 'desc',
  per_page: 5,
  page: 1,
})

const meta = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
})

// Build query params object (skip 'all' values)
const buildParams = () => {
  const params = {}
  for (const [key, val] of Object.entries(filters.value)) {
    if (val !== 'all' && val !== '') {
      params[key] = val
    }
  }
  return params
}

// Show URL so you can SEE what query params are being sent
const currentUrl = computed(() => {
  const params = new URLSearchParams(buildParams())
  return `/api/tasks?${params.toString()}`
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await api.get('/tasks', { params: buildParams() })
    tasks.value = res.data.data
    meta.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      total: res.data.total,
      from: res.data.from ?? 0,
      to: res.data.to ?? 0,
    }
  } finally {
    loading.value = false
  }
}

// Reset page to 1 on filter change
const onFilterChange = () => {
  filters.value.page = 1
  fetchTasks()
}

const goToPage = (page) => {
  if (page < 1 || page > meta.value.last_page) return
  filters.value.page = page
  fetchTasks()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: 'all',
    priority: 'all',
    sort_by: 'created_at',
    sort_dir: 'desc',
    per_page: 5,
    page: 1,
  }
  fetchTasks()
}

// Show max 5 page buttons
const visiblePages = computed(() => {
  const total = meta.value.last_page
  const current = meta.value.current_page
  const delta = 2
  const pages = []

  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i)
  }
  return pages
})

onMounted(fetchTasks)
</script>