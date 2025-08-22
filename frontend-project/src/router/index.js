import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/homepage.vue'
import AuthPage from '../views/authPage.vue'
import ProjectList from '@/views/projectList.vue'
import ProjectPage from '@/views/projectPage.vue'
import TestComponent from '@/TestComponent.vue'
const routes = [
  { path: '/', component: TestComponent },
  {
    path: '/home',
    component: Home,
  },
  { path: '/signup', component: AuthPage },
  { path: '/login', component: AuthPage },
  {
    path: '/projects',
    component: ProjectList,
    //     props: true,
    //     children: [
    //       { }
    // ]
  },
  { path: '/project/:id', component: ProjectPage, props: true },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
