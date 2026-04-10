import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScheduleView from '../views/ScheduleView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/schedule',
        name: 'Schedule',
        component: ScheduleView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/')
    } else {
        next()
    }
})

export default router