import Vue from 'vue'
import VueRouter from 'vue-router'
import Meta from 'vue-meta'

import Home from '@/views/Home'

import SignIn from '@/views/auth/SignIn'
import SignUp from '@/views/auth/SignUp'
import ResetPassword from '@/views/auth/ResetPassword'

import User from '@/views/User'

import Clock from '@/views/Clock'
import Payments from '@/views/payments/Payments'
// import Availability from '@/views/Availability'
import Jobs from '@/views/jobs/Jobs'
import Job from '@/views/jobs/Job'
import Workforce from '@/views/workforce/Workforce'
import Schedule from '@/views/Schedule'
import Messages from '@/views/messages/Messages'
import Conversation from '@/views/messages/Conversation'

import Settings from '@/views/settings/Settings'

import NotFound from '@/views/errors/NotFound'

Vue.use(VueRouter)
Vue.use(Meta)

import { EMPLOYEE, EMPLOYEE_MANAGER, ORGANIZATION_MANAGER } from '@/definitions/userRoles'
const MANAGER = [EMPLOYEE_MANAGER, ORGANIZATION_MANAGER]

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
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPassword,
    meta: {
      fullHeight: true,
    }
  },
  {
    path: '/users/:userId',
    name: 'user',
    component: User,
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
    path: '/payments',
    name: 'payments',
    component: Payments,
    meta: {
      icon: 'mdi-clock-check-outline',
      restrict: [...MANAGER]
    }
  },
  // {
  //   path: '/availability',
  //   name: 'availability',
  //   component: Availability,
  //   meta: {
  //     icon: 'mdi-calendar-check',
  //     restrict: [EMPLOYEE]
  //   }
  // },
  {
    path: '/jobs',
    name: 'jobs',
    component: Jobs,
    meta: {
      icon: 'mdi-calendar-check',
      restrict: [...MANAGER]
    }
  },
  {
    path: '/jobs/:jobId',
    name: 'job',
    component: Job,
    meta: {
      restrict: [...MANAGER]
    }
  },
  {
    path: '/workforce',
    name: 'workforce',
    component: Workforce,
    meta: {
      icon: 'mdi-account-group',
      restrict: [...MANAGER]
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      restrict: [EMPLOYEE, ...MANAGER],
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
      restrict: [EMPLOYEE, ...MANAGER],
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
  },
  {
    path: '*',
    name: 'Not found',
    component: NotFound
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
