import Vue from 'vue'
import VueRouter from 'vue-router'
import { Route } from 'vue-router/types';
import Meta from 'vue-meta'
import store from '@/store'
import { Capacitor } from '@capacitor/core'

import * as MessagesTypes from '@/definitions/Messages'
import { fullName, groupNameList } from '@/plugins/filters'

import Home from '@/views/landing/Home.vue'
import NativeHome from '@/views/landing/NativeHome.vue'
import About from '@/views/landing/About.vue'
import Pricing from '@/views/landing/Pricing.vue'
import Contact from '@/views/landing/Contact.vue'
import Support from '@/views/support/Support.vue'
import SupportArticle from '@/views/support/SupportArticle.vue'
import Privacy from '@/views/landing/Privacy.vue'
import Terms from '@/views/landing/Terms.vue'
import SignIn from '@/views/auth/SignIn.vue'
import SignUp from '@/views/auth/SignUp.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'
import ConfirmEmail from '@/views/auth/ConfirmEmail.vue'
import Clock from '@/views/Clock.vue'
import Payments from '@/views/payments/Payments.vue'
// import Availability from '@/views/Availability.vue'
import Jobs from '@/views/jobs/Jobs.vue'
import Job from '@/views/jobs/Job.vue'
import Users from '@/views/users/Users.vue'
import User from '@/views/users/User.vue'
import Schedule from '@/views/Schedule.vue'
import Messages from '@/views/messages/Messages.vue'
import Conversation from '@/views/messages/Conversation.vue'
import Settings from '@/views/settings/Settings.vue'
import NotFound from '@/views/errors/NotFound.vue'

Vue.use(VueRouter)
Vue.use(Meta)

import { UserRole, Managers, defaultRoute } from '@/definitions/User'


const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      landing: true,
    },
    beforeEnter(to: Route, from: Route, next: Function) {
      if (Capacitor.isNativePlatform()) {
        if (store.state.authenticatedUser)
          next({ name: defaultRoute() })
        else
          next({ name: 'nativeHome' })
      }
      else next()
    },
  },
  {
    path: '/native-home',
    name: 'nativeHome',
    component: NativeHome,
    meta: {
      noSkeleton: true,
      fullHeight: true,
    }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {
      landing: true,
    }
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: Pricing,
    meta: {
      landing: true
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    meta: {
      landing: true,
    }
  },
  {
    path: '/support',
    name: 'support',
    component: Support,
    meta: {
      landing: true,
    }
  },
  {
    path: '/support/:articleId',
    name: 'supportArticle',
    component: SupportArticle,
    meta: {
      landing: true,
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
    meta: {
      landing: true,
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: {
      landing: true,
    }
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: SignIn,
    meta: {
      landing: true,
      fullHeight: true,
    }
  },
  {
    path: '/sign-up',
    alias: '/confirmed',
    name: 'signUp',
    component: SignUp,
    meta: {
      landing: true,
      fullHeight: true,
    }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPassword,
    meta: {
      landing: true,
      fullHeight: true,
    }
  },
  {
    path: '/confirm-email',
    name: 'confirmEmail',
    component: ConfirmEmail,
    meta: {
      landing: true,
      fullHeight: true,
    }
  },
  {
    path: '/clock',
    name: 'clock',
    component: Clock,
    meta: {
      icon: 'mdi-clock-outline',
      restrict: [UserRole.Contractor]
    }
  },
  // {
  //   path: '/availability',
  //   name: 'availability',
  //   component: Availability,
  //   meta: {
  //     icon: 'mdi-calendar-check',
  //     restrict: [UserRole.Contractor]
  //   }
  // },
  {
    path: '/jobs',
    name: 'jobs',
    component: Jobs,
    meta: {
      icon: 'mdi-calendar-check',
      restrict: Managers
    },
  },
  {
    path: '/jobs/:jobId',
    name: 'job',
    component: Job,
    meta: {
      restrict: Managers,
      paramMap: {
        jobId: 'jobs',
        prop: 'name'
      }
    }
  },
  {
    path: '/payments',
    name: 'payments',
    component: Payments,
    meta: {
      icon: 'mdi-cash-multiple',
    }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
    meta: {
      icon: 'mdi-calendar-multiselect',
      fullHeight: true,
      hideNav: true,
    }
  },
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: {
      icon: 'mdi-account-group',
      restrict: Managers
    }
  },
  {
    path: '/users/:userId',
    name: 'user',
    component: User,
    meta: {
      paramMap: {
        userId: 'users',
        propBuilder: fullName
      },
    }
  },
  {
    path: '/messages',
    name: 'messages',
    component: Messages,
    meta: {
      icon: 'mdi-message-text-outline',
      fullHeight: true,
    },
    children: [
      {
        name: 'conversation',
        path: ':conversationId',
        component: Conversation,
        meta: {
          fullHeight: true,
          paramMap: {
            conversationId: 'conversations',
            propBuilder(conversation: MessagesTypes.Conversation) {
              return groupNameList(conversation, store.state.authenticatedUser)
            },
          },
        },
      },
    ],
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
      landing: true
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
