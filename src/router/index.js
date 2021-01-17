import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import SignIn from '../views/SignIn.vue'
import SignUp from '../views/SignUp.vue'
import Clock from '../views/Clock.vue'
import Approvals from '../views/approvals/Approvals.vue'
import Availability from '../views/Availability.vue'
import Jobs from '../views/Jobs.vue'
import Schedule from '../views/Schedule.vue'
import Messages from '../views/messages/Messages.vue'
import Conversation from '../views/messages/Conversation.vue'

Vue.use(VueRouter)

const EMPLOYEE = 1, MANAGER = 2

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: SignIn
  },
  {
    path: '/sign-up',
    alias: '/confirmed',
    name: 'signUp',
    component: SignUp,
  },
  {
    path: '/clock',
    name: 'clock',
    component: Clock,
    meta: {
      icon: 'mdi-clock-outline',
      showInNav: [EMPLOYEE]
    }
  },
  {
    path: '/approvals',
    name: 'approvals',
    component: Approvals,
    meta: {
      icon: 'mdi-clock-check-outline',
      showInNav: [MANAGER]
    }
  },
  {
    path: '/availability',
    name: 'availability',
    component: Availability,
    meta: {
      icon: 'mdi-calendar-check',
      showInNav: [EMPLOYEE]
    }
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: Jobs,
    meta: {
      icon: 'mdi-calendar-check',
      showInNav: [MANAGER]
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      showInNav: [EMPLOYEE, MANAGER]
    }
  },
  {
    path: '/messages',
    name: 'messages',
    component: Messages,
    meta: {
      icon: 'mdi-message-text-outline',
      showInNav: [EMPLOYEE, MANAGER]
    },
    children: [{
      name: 'conversation',
      path: 'conversation/:conversationId',
      component: Conversation
    }]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

/* router.beforeEach((to, from, next) => {
  if (store.state.authenticatedUser && to.meta.showInNav && !to.meta.showInNav.some(
    (role) => store.state.authenticatedUser.roles.map(r => r.id).includes(role)
  )) {
    console.log('fuck u')
    next({ name: 'home' })
  }
  else next()
}) */

export default router
