<template>
  <div class="max-w-3xl mx-auto px-4 py-10">

    <router-link to="/" class="text-sm text-blue-500 hover:underline mb-6 inline-block">
      ← Back to Home
    </router-link>

    <h1 class="text-2xl font-bold text-gray-800 mb-1">Project 7 — File Upload</h1>
    <p class="text-gray-400 text-sm mb-8">
      multipart/form-data • storage • image preview • upload progress
    </p>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm text-white shadow-lg transition-all"
      :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      {{ toast.message }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Left: Create Task with Upload -->
      <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 class="font-semibold text-gray-700 mb-4">Create Task with Attachment</h2>

        <!-- Title -->
        <div class="mb-3">
          <label class="text-xs text-gray-400 mb-1 block">Title</label>
          <input
            v-model="form.title"
            placeholder="Task title..."
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            :class="errors.title ? 'border-red-300' : ''"
          />
          <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title[0] }}</p>
        </div>

        <!-- Priority -->
        <div class="mb-3">
          <label class="text-xs text-gray-400 mb-1 block">Priority</label>
          <select
            v-model="form.priority"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <!-- File Drop Zone -->
        <div class="mb-4">
          <label class="text-xs text-gray-400 mb-1 block">Attachment (optional)</label>
          <div
            class="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition"
            :class="isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <!-- Preview -->
            <div v-if="preview" class="mb-2">
              <img
                v-if="isImageFile"
                :src="preview"
                class="max-h-28 mx-auto rounded-lg object-contain"
              />
              <div v-else class="text-4xl mb-1">📄</div>
            </div>

            <div v-if="selectedFile">
              <p class="text-sm font-medium text-gray-700">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-400">{{ humanSize(selectedFile.size) }}</p>
              <button
                @click.stop="clearFile"
                class="text-xs text-red-400 hover:underline mt-1"
              >
                Remove
              </button>
            </div>
            <div v-else>
              <p class="text-sm text-gray-400">Drop file here or click to browse</p>
              <p class="text-xs text-gray-300 mt-1">Images, PDF, DOC, TXT — max 5MB</p>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            @change="onFileSelect"
          />
          <p v-if="errors.attachment" class="text-xs text-red-500 mt-1">
            {{ errors.attachment[0] }}
          </p>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            />
          </div>
        </div>

        <button
          @click="createTask"
          :disabled="submitting"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg transition"
        >
          {{ submitting ? 'Uploading...' : 'Create Task' }}
        </button>
      </div>

      <!-- Right: Task List with Attachments -->
      <div>
        <h2 class="font-semibold text-gray-700 mb-4">Tasks with Attachments</h2>

        <div v-if="loading" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="task in tasks"
            :key="task.id"
            class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <span
                class="text-sm font-medium flex-1"
                :class="task.is_done ? 'line-through text-gray-400' : 'text-gray-700'"
              >
                {{ task.title }}
              </span>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-red-50 text-red-500':    task.priority === 'high',
                    'bg-yellow-50 text-yellow-500': task.priority === 'medium',
                    'bg-gray-100 text-gray-400': task.priority === 'low',
                  }"
                >
                  {{ task.priority }}
                </span>
                <button
                  @click="deleteTask(task.id)"
                  class="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Attachment preview -->
            <div v-if="task.attachment" class="mt-2">
              <!-- Image -->
              <div v-if="task.attachment.is_image">
                <img
                  :src="task.attachment.url"
                  class="w-full max-h-32 object-cover rounded-lg cursor-pointer"
                  @click="openLightbox(task.attachment.url)"
                />
              </div>

              <!-- Non-image file -->
              <a
                v-else
                :href="task.attachment.url"
                target="_blank"
                class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
              >
                <span class="text-2xl">📄</span>
                <div>
                  <p class="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                    {{ task.attachment.name }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ task.attachment.size_human }} · {{ task.attachment.type }}
                  </p>
                </div>
                <span class="ml-auto text-xs text-blue-500">Download ↓</span>
              </a>

              <!-- Remove attachment -->
              <button
                @click="removeAttachment(task)"
                class="text-xs text-red-400 hover:underline mt-1"
              >
                Remove attachment
              </button>
            </div>

            <div v-else class="mt-2">
              <p class="text-xs text-gray-300">No attachment</p>
            </div>

            <p class="text-xs text-gray-300 mt-2">{{ task.created_ago }}</p>
          </li>
        </ul>

        <p v-if="!loading && tasks.length === 0" class="text-center text-gray-400 text-sm py-8">
          No tasks yet. Create one with a file!
        </p>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      @click="lightboxUrl = null"
    >
      <img :src="lightboxUrl" class="max-w-full max-h-full rounded-xl shadow-2xl" />
    </div>

    <!-- Request Inspector -->
    <div class="mt-8 bg-gray-900 rounded-2xl p-5">
      <p class="text-xs text-gray-400 mb-2 font-mono">
        Key difference — file upload uses FormData, not JSON:
      </p>
      <pre class="text-xs text-green-400 font-mono">{{ codeExample }}</pre>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const tasks          = ref([])
const loading        = ref(false)
const submitting     = ref(false)
const uploadProgress = ref(0)
const errors         = ref({})
const selectedFile   = ref(null)
const preview        = ref(null)
const isDragging     = ref(false)
const lightboxUrl    = ref(null)
const fileInput      = ref(null)
const toast          = ref({ show: false, type: 'success', message: '' })

const form = ref({
  title:    '',
  priority: 'medium',
})

const isImageFile = computed(() => {
  return selectedFile.value?.type?.startsWith('image/')
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, type, message }
  setTimeout(() => (toast.value.show = false), 3000)
}

const humanSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i]
}

const onFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) setFile(file)
}

const onDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) setFile(file)
}

const setFile = (file) => {
  selectedFile.value = file
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => (preview.value = e.target.result)
    reader.readAsDataURL(file)
  } else {
    preview.value = null
  }
}

const clearFile = () => {
  selectedFile.value = null
  preview.value      = null
  if (fileInput.value) fileInput.value.value = ''
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const res   = await api.get('/tasks', { params: { per_page: 10 } })
    tasks.value = res.data.data ?? res.data
  } finally {
    loading.value = false
  }
}

const createTask = async () => {
  errors.value       = {}
  submitting.value   = true
  uploadProgress.value = 0

  // File upload needs FormData, NOT JSON
  const formData = new FormData()
  formData.append('title',    form.value.title)
  formData.append('priority', form.value.priority)
  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value)
  }

  try {
    await api.post('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / e.total)
      },
    })

    form.value  = { title: '', priority: 'medium' }
    clearFile()
    uploadProgress.value = 0
    showToast('Task created with attachment!')
    fetchTasks()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else {
      showToast('Upload failed. Try again.', 'error')
    }
    uploadProgress.value = 0
  } finally {
    submitting.value = false
  }
}

const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`)
    showToast('Task deleted')
    fetchTasks()
  } catch {
    showToast('Delete failed', 'error')
  }
}

const removeAttachment = async (task) => {
  try {
    const formData = new FormData()
    formData.append('remove_attachment', 'true')
    formData.append('_method', 'PUT')

    await api.post(`/tasks/${task.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    showToast('Attachment removed')
    fetchTasks()
  } catch {
    showToast('Failed to remove attachment', 'error')
  }
}

const openLightbox = (url) => {
  lightboxUrl.value = url
}

const codeExample = `// ✗ Wrong for file upload
axios.post('/tasks', { title: 'Task', file: file })

// ✓ Correct — FormData
const formData = new FormData()
formData.append('title', 'Task')
formData.append('attachment', file)

axios.post('/tasks', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (e) => {
    progress = Math.round((e.loaded * 100) / e.total)
  }
})`

onMounted(fetchTasks)
</script>