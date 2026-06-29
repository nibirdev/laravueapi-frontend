import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../stores/auth'
import HomePage from '../pages/HomePage.vue'
import Project1Page from '../pages/Project1Page.vue'
import Project2Page from '../pages/Project2Page.vue'
import Project3Page from '../pages/Project3Page.vue'
import Project4Page from '../pages/Project4Page.vue'
import Project5Page from '../pages/Project5Page.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import Project6Page from '../pages/Project6Page.vue'
import Project7Page from '../pages/Project7Page.vue'

const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/project/1', component: Project1Page, meta: { requiresAuth: true } },
    { path: '/project/2', component: Project2Page, meta: { requiresAuth: true } },
    { path: '/project/3', component: Project3Page, meta: { requiresAuth: true } },
    { path: '/project/4', component: Project4Page, meta: { requiresAuth: true } },
    { path: '/project/5', component: Project5Page, meta: { requiresAuth: true } },
    { path: '/project/6', component: Project6Page, meta: { requiresAuth: true } },
    { path: '/project/7', component: Project7Page, meta: { requiresAuth: true } },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
    if (to.meta.requiresAdmin && !auth.isAdmin) return '/'
})

export default router