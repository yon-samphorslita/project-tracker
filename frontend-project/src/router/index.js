import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/homepage.vue'
import AuthPage from '../views/authPage.vue'
import ProjectList from '@/views/projectList.vue'
import ProjectPage from '@/views/projectPage.vue'
import TestComponent from '@/TestComponent.vue'
import SettingsPage from '@/views/settingsPage.vue'
import CalendarPage from '@/views/calendarPage.vue'
const routes = [
  { path: '/', component: TestComponent, redirect: { name: 'Login' } },
  {
    path: '/home',
    component: Home,
  },
  { path: '/login', component: AuthPage, name: 'Login' },
  {
    path: '/projects',
    component: ProjectList,
  },
  { path: '/project/:id', component: ProjectPage, props: true },
  { path: '/settings', component: SettingsPage },
  { path: '/calendar', component: CalendarPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
