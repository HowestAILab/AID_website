import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/projects' },
  { path: '/projects', component: () => import('./pages/projects.vue') },
  { path: '/diamond/exercises', component: () => import('./pages/diamond-exercises.vue') },
  { path: '/diamond/pipeline', component: () => import('./pages/diamond-pipeline.vue') },
  { path: '/diamond/reflexion', component: () => import('./pages/diamond-reflexion.vue') },
  { path: '/tools', component: () => import('./pages/tools.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
