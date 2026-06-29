import { reactive } from 'vue'
import api from '../services/api'

export const auth = reactive({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,

    get isLoggedIn() { return !!this.token },
    get isAdmin() { return this.user && this.user.role === 'admin' },
    get isUser() { return this.user && this.user.role === 'user' },

    login(token, user) {
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
        api.post('/logout').finally(() => {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        })
    },
})