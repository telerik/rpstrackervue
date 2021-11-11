import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DashboardPage from '@/views/DashboardPage.vue';
import BacklogPage from '@/views/BacklogPage.vue';
import DetailPage from '@/views/DetailPage.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/backlog',
    redirect: '/backlog/open',
  },
  {
    path: '/backlog/:preset',
    name: 'backlog',
    component: BacklogPage,
  },
  {
    path: '/detail/:id/:screen',
    name: 'detail',
    component: DetailPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
