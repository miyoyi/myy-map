//router
import { createRouter, createWebHistory } from 'vue-router'
import map from '../components/map.vue'
import world from '../components/world.vue'


const routes = [
  {
    path: '/',
    name: 'world',
    component: world
  },
  {
    path: '/map',
    name: 'map',
    component: map
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router