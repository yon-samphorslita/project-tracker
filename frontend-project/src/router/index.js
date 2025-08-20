import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/homepage.vue'
import AuthPage from '../views/authPage.vue'
const routes = [
  {
    path: '/home',
    component: Home,
  },
  { path: '/signup', component: AuthPage },
  { path: '/login', component: AuthPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
