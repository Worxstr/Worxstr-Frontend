import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home.vue'
import SignIn from '@/views/SignIn.vue'
import SignUp from '@/views/SignUp.vue'
import Clock from '@/views/Clock.vue'
import Approvals from '@/views/approvals/Approvals.vue'
import Availability from '@/views/Availability.vue'
import Jobs from '@/views/jobs/Jobs.vue'
import Job from '@/views/jobs/Job.vue'
import Schedule from '@/views/Schedule.vue'
import Messages from '@/views/messages/Messages.vue'
import Conversation from '@/views/messages/Conversation.vue'
import Settings from '@/views/Settings.vue'

Vue.use(VueRouter)

const EMPLOYEE = 1, MANAGER = 2

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      fullHeight: true
    }
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: SignIn,
    meta: {
      fullHeight: true
    }
  },
  {
    path: '/sign-up',
    alias: '/confirmed',
    name: 'signUp',
    component: SignUp,
    meta: {
      fullHeight: true
    }
  },
  {
    path: '/clock',
    name: 'clock',
    component: Clock,
    meta: {
      icon: 'mdi-clock-outline',
      restrict: [EMPLOYEE]
    }
  },
  {
    path: '/approvals',
    name: 'approvals',
    component: Approvals,
    meta: {
      icon: 'mdi-clock-check-outline',
      restrict: [MANAGER]
    }
  },
  {
    path: '/availability',
    name: 'availability',
    component: Availability,
    meta: {
      icon: 'mdi-calendar-check',
      restrict: [EMPLOYEE]
    }
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: Jobs,
    meta: {
      icon: 'mdi-calendar-check',
      restrict: [MANAGER]
    }
  },
  {
    path: '/jobs/:jobId',
    name: 'job',
    component: Job,
    meta: {
      restrict: [MANAGER]
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      restrict: [EMPLOYEE, MANAGER],
      fullHeight: true,
      hideNav: true,
    }
  },
  {
    path: '/messages',
    name: 'messages',
    component: Messages,
    meta: {
      icon: 'mdi-message-text-outline',
      restrict: [EMPLOYEE, MANAGER],
    },
    children: [{
      name: 'conversation',
      path: 'conversation/:conversationId',
      component: Conversation,
      meta: {
        fullHeight: true,
      }
    }]
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
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
