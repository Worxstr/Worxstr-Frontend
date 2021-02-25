import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'
import SignIn from '@/views/SignIn'
import SignUp from '@/views/SignUp'
import Clock from '@/views/Clock'
import Approvals from '@/views/approvals/Approvals'
import Availability from '@/views/Availability'
import Jobs from '@/views/jobs/Jobs'
import Job from '@/views/jobs/Job'
import Workforce from '@/views/Workforce'
import Schedule from '@/views/Schedule'
import Messages from '@/views/messages/Messages'
import Conversation from '@/views/messages/Conversation'
import Settings from '@/views/settings/Settings'

Vue.use(VueRouter)

import { EMPLOYEE, EMPLOYEE_MANAGER, ORGANIZATION_MANAGER } from '@/definitions/userRoles'

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
      restrict: [EMPLOYEE_MANAGER]
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
      restrict: [EMPLOYEE_MANAGER]
    }
  },
  {
    path: '/jobs/:jobId',
    name: 'job',
    component: Job,
    meta: {
      restrict: [EMPLOYEE_MANAGER]
    }
  },
  {
    path: '/workforce',
    name: 'workforce',
    component: Workforce,
    meta: {
      icon: 'mdi-account-group',
      restrict: [EMPLOYEE_MANAGER, ORGANIZATION_MANAGER]
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      restrict: [EMPLOYEE, EMPLOYEE_MANAGER],
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
      restrict: [EMPLOYEE, EMPLOYEE_MANAGER],
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
