import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/homepage.vue'
import AuthPage from '../views/authPage.vue'
import ProjectList from '@/views/projectList.vue'
import ProjectPage from '@/views/projectPage.vue'
import SettingsProfile from '@/views/settingsProfile.vue'
import ActivityLogs from '@/views/activityLogs.vue'
import ChangePassword from '@/views/changePassword.vue'
import ForgotPassword from '@/views/forgotPassword.vue'
import SettingsLayout from '@/views/settingsLayout.vue'
import CalendarPage from '@/views/calendarPage.vue'
import UserPage from '@/views/userPage.vue'
import { useAuthStore } from '@/stores/auth'
import TeamList from '@/views/teamList.vue'
import TeamEditPage from '@/views/teamEditPage.vue'
import TeamDetail from '@/views/teamDetail.vue'
import UserProfile from '@/views/userProfile.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/home', name: 'Home',component: Home, meta: { requiresAuth: true } },
  { path: '/login', component: AuthPage, name: 'Login' },
  { path: '/change-password', component: ChangePassword, meta: { requiresAuth: true } },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/projects', component: ProjectList, meta: { requiresAuth: true, title: 'Projects' } },
  { path: '/project/:id', component: ProjectPage, props: true, meta: { requiresAuth: true, title: 'Projects' } },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsLayout,
    meta: { requiresAuth: true, title:'Settings' },
    children: [
      { path: 'profile', component: SettingsProfile },
      { path: 'activity-logs', component: ActivityLogs },
    ],
  },
  { path: '/calendar', component: CalendarPage, meta: { requiresAuth: true, title: 'Calendar' } },
  { path: '/user', component: UserPage, meta: { requiresAuth: true } },
  { path: '/user/profile/:id', component: UserProfile, meta: { requiresAuth: true , title: 'Teams'} },

  { path: '/teams', component: TeamList, meta: { requiresAuth: true, title:'Teams' } },
  { path: '/teams/:id', component: TeamDetail, meta: { requiresAuth: true, title:'Teams' } },
  { path: '/teams/:id/edit', component: TeamEditPage, meta: { requiresAuth: true, title:'Teams' } }
]
  

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If token exists but user not loaded, fetch profile to validate
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }

  const isLoggedIn = authStore.isAuthenticated

  // Prevent access to protected routes if not logged in
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login')
  }

  // Prevent logged-in users from visiting login page
  if (to.path === '/login' && isLoggedIn) {
    // Redirect based on role
    const role = authStore.user?.role
    if (role === 'admin') return next('/settings/profile')
    if (role === 'project_manager') return next('/projects')
    if (role === 'member') return next('/home')
    return next('/') // fallback
  }

  next()
})

export default router
