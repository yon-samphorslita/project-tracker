import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../views/homepage.vue';

const routes = [
  { 
    path: '/homepage', 
    component: Homepage 
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
