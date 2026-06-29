<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-100 px-4 py-3">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <router-link to="/" class="font-semibold text-gray-800">
          API Roadmap
        </router-link>

        <div class="flex items-center gap-3">
          <template v-if="auth.isLoggedIn">
            <span class="text-sm text-gray-500">{{ auth.user?.name }}</span>
            <button
              @click="logout"
              class="text-sm text-red-400 hover:underline"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="text-sm text-blue-500 hover:underline">Login</router-link>
            <router-link
              to="/register"
              class="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
            >
              Register
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { auth } from './stores/auth'

const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>