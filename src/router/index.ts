import Vue from 'vue'
import VueRouter from 'vue-router'
import { Route } from 'vue-router/types';
import Meta from 'vue-meta'
import { Capacitor } from '@capacitor/core'

import * as MessagesTypes from '@/definitions/Messages'
import { fullName, groupNameList } from '@/util/filters'
import usersStore from '@/store/users'

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
import Clock from '@/views/clock/Clock.vue'
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
import SettingsMe from "@/views/settings/pages/me/Me.vue"
import SettingsOrganization from "@/views/settings/pages/organization/Organization.vue"
import SettingsPayments from "@/views/settings/pages/payments/Payments.vue"
import SettingsSecurity from "@/views/settings/pages/security/Security.vue"
import SettingsPreferences from "@/views/settings/pages/preferences/Preferences.vue"
import NotFound from '@/views/errors/NotFound.vue'

Vue.use(VueRouter)
Vue.use(Meta)

import { UserRole, Managers, defaultRoute, currentUserIs, isAuthenticated } from '@/definitions/User'

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
        if (usersStore.state.authenticatedUser)
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
      bleedSafeAreaBottom: true,
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
    alias: '/auth/reset',
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
              return groupNameList(conversation, usersStore.state.authenticatedUser)
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
    beforeEnter: (_to: any, _from: any, next: any) => {
      // Default to /me if no sub-route is specified
      if (_to.matched.length === 1) next({name: 'settings/me'})
      else next()
    },
    children: [
      {
        name: 'settings/me',
        path: 'me',
        component: SettingsMe,
        meta: {
          icon: 'mdi-account',
        }
      },
      {
        name: 'settings/organization',
        path: 'organization',
        component: SettingsOrganization,
        meta: {
          icon: 'mdi-account-group',
          restrict: [UserRole.OrganizationManager],
        }
      },
      {
        name: 'settings/payments',
        path: 'payments',
        component: SettingsPayments,
        meta: {
          icon: 'mdi-cash-multiple',
        }
      },
      {
        name: 'settings/security',
        path: 'security',
        component: SettingsSecurity,
        meta: {
          icon: 'mdi-lock',
        }
      },
      {
        name: 'settings/preferences',
        path: 'preferences',
        component: SettingsPreferences,
        meta: {
          icon: 'mdi-palette',
        }
      },
    ]
  },
  {
    path: '*',
    name: 'notFound',
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
  routes,
  scrollBehavior (_to: any, _from: any, savedPosition: any) {
    if (savedPosition) {
      return savedPosition
    } else {
      window.scrollTo(0, 0)
    }
  }
})

router.beforeEach((to: any, _from: any, next: any) => {
  if (to.meta.restrict && !currentUserIs(...to.meta.restrict)) {
    if (!isAuthenticated()) {
      next({ name: 'signIn' })
    }
    else {
      next({ name: defaultRoute() })
    }
  }
  else next()
})

export default router
