<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">API Learning Roadmap</h1>
    <p class="text-gray-500 mb-10">Click a project to get started</p>

    <!-- Phase 1 -->
    <div class="mb-10">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">
        Phase 1 — Basics
      </h2>
      <div class="grid gap-4">
        <router-link
          v-for="project in phase1"
          :key="project.id"
          :to="`/project/${project.id}`"
          class="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition group"
        >
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                Project {{ project.id }}
              </span>
              <h3 class="text-gray-800 font-semibold mt-2 group-hover:text-blue-600 transition">
                {{ project.title }}
              </h3>
              <p class="text-gray-500 text-sm mt-1">{{ project.desc }}</p>
            </div>
            <span class="text-gray-300 group-hover:text-blue-400 text-xl transition">→</span>
          </div>
          <div class="flex gap-2 mt-3 flex-wrap">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- More phases coming soon -->
    <div class="bg-gray-100 rounded-xl p-5 text-center text-gray-400 text-sm">
      Nibir Hossain 2026
    </div>
  </div>
</template>

<script setup>
const phase1 = [
  {
    id: 1,
    title: 'Simple CRUD API — Task Manager',
    desc: 'GET, POST, PUT, DELETE endpoints with Vue list/add/edit/delete UI.',
    tags: ['routes', 'controller', 'JSON response', 'HTTP methods'],
  },
  {
    id: 2,
    title: 'Status Codes & Error Handling',
    desc: '422 validation, 404 not found, proper error messages in Vue.',
    tags: ['validation', 'status codes', 'error format', 'toast'],
  },
  {
    id: 3,
    title: 'Query Params, Filtering & Pagination',
    desc: 'Filter by status/priority, search, sort, paginate results.',
    tags: ['query params', 'filtering', 'pagination', 'sorting'],
  },
  {
  id: 4,
  title: 'Authentication — Laravel Sanctum',
  desc: 'Register, login, logout. Token-based auth. Protected routes in Vue.',
  tags: ['sanctum', 'token', 'auth guard', 'protected routes'],
},
{
  id: 5,
  title: 'Authorization — Role-based Access',
  desc: 'Admin vs User roles. 403 Forbidden. Admin panel with user management.',
  tags: ['roles', 'middleware', 'admin', '403 forbidden'],
},
{
  id: 6,
  title: 'API Resources & Response Structuring',
  desc: 'Clean response shape, computed fields, nested relations, consistent format.',
  tags: ['api resources', 'response shape', 'transformers', 'consistency'],
},
{
  id: 7,
  title: 'File Upload API',
  desc: 'Upload images/docs with tasks. Preview, progress bar, file management.',
  tags: ['multipart/form-data', 'storage', 'file preview', 'upload progress'],
},
]
</script>