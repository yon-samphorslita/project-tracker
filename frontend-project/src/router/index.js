import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/homepage.vue'
import AuthPage from '../views/authentication/authPage.vue'
import ProjectList from '@/views/projectList.vue'
import ProjectPage from '@/views/projectPage.vue'
import SettingsProfile from '@/views/settings/settingsProfile.vue'
import ActivityLogs from '@/views/settings/activityLogs.vue'
import SettingsPage from '@/views/settings/settingsPage.vue'
import ChangePassword from '@/views/authentication/changePassword.vue'
import ForgotPassword from '@/views/authentication/forgotPassword.vue'
import SettingsLayout from '@/views/settings/settingsLayout.vue'
import CalendarPage from '@/views/calendarPage.vue'
import UserPage from '@/views/userPage.vue'
import UserDetail from '@/views/userDetail.vue'
import { useAuthStore } from '@/stores/auth'
import TeamList from '@/views/teamList.vue'
import TeamEditPage from '@/views/teamEditPage.vue'
import TeamDetail from '@/views/teamDetail.vue'
import UserProfile from '@/views/userProfile.vue'
import NotificationPage from '@/views/notificationPage.vue'
import Taskpage from '@/views/taskpage.vue'
import Dashboard from '@/views/dashboard.vue'
import GetHelp from '@/views/settings/getHelp.vue'
import ThemeSettings from '@/views/settings/ThemeSettings.vue'
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', component: AuthPage, name: 'Login' },
  { path: '/change-password', component: ChangePassword, meta: { requiresAuth: true } },
  { path: '/forgot-password', component: ForgotPassword },
  {
    path: '/projects',
    component: ProjectList,
    meta: { requiresAuth: true, title: 'Projects' },
    name: 'Projects',
  },
  {
    path: '/project/:id',
    component: ProjectPage,
    props: true,
    meta: { requiresAuth: true, title: 'Projects' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsLayout,
    meta: { requiresAuth: true, title: 'Settings' },
    children: [
      { path: '', component: SettingsPage },
      { path: 'profile', component: SettingsProfile },
      { path: 'activity-logs', component: ActivityLogs },
      { path: 'theme', component: ThemeSettings },
    ],
  },
  { path: '/help', component: GetHelp, meta: { requiresAuth: true, title: 'Get Help' } },
  { path: '/calendar', component: CalendarPage, meta: { requiresAuth: true, title: 'Calendar' } },
  {
    path: '/users',
    component: UserPage,
    meta: { requiresAuth: true, title: 'Users' },
    name: 'Users',
  },
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: { requiresAdmin: true, title: 'Users' },
  },
  {
    path: '/user/profile/:id',
    component: UserProfile,
    meta: { requiresAuth: true, title: 'Teams' },
  },

  { path: '/teams', component: TeamList, meta: { requiresAuth: true, title: 'Teams' } },
  { path: '/teams/:id', component: TeamDetail, meta: { requiresAuth: true, title: 'Teams' } },
  {
    path: '/teams/:id/edit',
    component: TeamEditPage,
    meta: { requiresAuth: true, title: 'Teams' },
  },

  {
    path: '/notifications',
    component: NotificationPage,
    meta: { requiresAuth: true, title: 'Notifications' },
  },
  { path: '/task', component: Taskpage, meta: { requiresAuth: true, title: 'Tasks' } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, title: 'Dashboard' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Only try to fetch profile if there is a token and user data is not yet loaded
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch {
      // If fetch fails, clear token and redirect to login
      await authStore.logout()
      return next('/login')
    }
  }

  const isLoggedIn = authStore.isAuthenticated

  // Protected routes require login
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login')
  }

  // Prevent logged-in users from visiting login page
  if (to.path === '/login' && isLoggedIn) {
    const role = authStore.user?.role
    return next('/dashboard') // fallback
  }

  next()
})

export default router
