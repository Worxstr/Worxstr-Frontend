import Vue from 'vue'
import VueRouter from 'vue-router'
import Meta from 'vue-meta'
import store from '@/store'
import { Capacitor } from '@capacitor/core'

import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import Privacy from '@/views/Privacy.vue'
import Terms from '@/views/Terms.vue'
import SignIn from '@/views/auth/SignIn.vue'
import SignUp from '@/views/auth/SignUp.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'
import User from '@/views/User.vue'
import Clock from '@/views/Clock.vue'
import Payments from '@/views/payments/Payments.vue'
// import Availability from '@/views/Availability.vue'
import Jobs from '@/views/jobs/Jobs.vue'
import Job from '@/views/jobs/Job.vue'
import Workforce from '@/views/workforce/Workforce.vue'
import Schedule from '@/views/Schedule.vue'
import Messages from '@/views/messages/Messages.vue'
import Conversation from '@/views/messages/Conversation.vue'
import Settings from '@/views/settings/Settings.vue'
import NotFound from '@/views/errors/NotFound.vue'

Vue.use(VueRouter)
Vue.use(Meta)

import { UserRole, Manager, defaultRoute } from '@/definitions/User'


const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      showFooter: true,
    },
    beforeEnter(to, from, next) {
      if (Capacitor.isNativePlatform() && store.state.authenticatedUser) {
        next({ name: defaultRoute() })
      }
      else next()
    },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {
      showFooter: true,
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    meta: {
      showFooter: true,
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
    meta: {
      showFooter: true,
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: {
      showFooter: true,
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
      restrict: [UserRole.Employee]
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
      restrict: Manager
    }
  },
  {
    path: '/payments',
    name: 'payments',
    component: Payments,
    meta: {
      icon: 'mdi-clock-check-outline',
      restrict: Manager
    }
  },
  {
    path: '/jobs/:jobId',
    name: 'job',
    component: Job,
    meta: {
      restrict: Manager
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      restrict: [UserRole.Employee, ...Manager],
      fullHeight: true,
      hideNav: true,
    }
  },
  {
    path: '/workforce',
    name: 'workforce',
    component: Workforce,
    meta: {
      icon: 'mdi-account-group',
      restrict: Manager
    }
  },
  {
    path: '/messages',
    name: 'messages',
    component: Messages,
    meta: {
      icon: 'mdi-message-text-outline',
      restrict: [UserRole.Employee, ...Manager],
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
    component: NotFound,
    meta: {
      fullHeight: true,
    }
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
