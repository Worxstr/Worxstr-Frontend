<template lang="pug">

v-app
  v-app-bar(app :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'" elevate-on-scroll)
    v-container.py-0.fill-height
      router-link(to='/' style='text-decoration: none')
        v-avatar.mr-10(tile size='50')
          img(src='@/assets/logo.svg' alt='Worxstr logo')

      .d-flex.flex-row(v-if='!$vuetify.breakpoint.smAndDown')
        v-btn(v-for='link in primaryNavLinks'
        :key='link.text'
        text
        :to='{ name: link.to }'
        active-class='primary--text')
          | {{ link.text }}

      v-spacer

      div(v-for='link in secondaryNavLinks')

        //- Icon button
        v-tooltip(v-if='link.icon' bottom)
          template(v-slot:activator='{ on, attrs }')
            v-btn(
              icon
              v-bind='attrs'
              v-on='on'
              :to='link.to ? { name: link.to } : null'
              @click="() => link.click ? link.click() : ''"
            )
              v-icon {{ link.icon }}
          
          span {{ link.text }}

        //- Text button
        v-btn(
          v-else
          text
          :to='{ name: link.to }'
          active-class='primary--text'
        )
          | {{ link.text }}
      

  v-main(
    :class="{'grey': !$vuetify.theme.dark, 'lighten-3': !$vuetify.theme.dark}"
    :style="`padding-bottom: ${bottomPadding}`"
  )
    v-container.pa-0.align-start(fluid)
      transition(appear name='fade-transition' mode='out-in' :duration="{ enter: 150, leave: 50 }")
        router-view#router-view(:style='`height: ${pageHeight}`')

  transition(name='slide-fade')
    v-bottom-navigation(
      app
      color='indigo'
      grow
      v-if="showBottomNav"
    )
        
      v-btn(
        v-for='link in primaryNavLinks'
        :key='link.to'
        :value='link.text'
        :to='{ name: link.to }'
      )
        span {{ link.text | capitalize }}
        v-icon {{ link.icon }}
  
  worxstr-footer(v-if='$route.meta.showFooter')

  v-snackbar(
    app
    v-model='snackbar.show'
    :timeout='snackbar.timeout'
  )
    | {{ snackbar.text }}

    template(
      v-slot:action='{ attrs }'
      v-if='snackbar.action'
    )
      v-btn(
        color='blue'
        text
        v-bind='attrs'
        @click='() => {snackbar.action(); snackbar.show = false}'
      )
        | {{snackbar.actionText}}

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import WorxstrFooter from '@/components/WorxstrFooter.vue'
import { Role, User, UserRole } from './definitions/User'

@Component({
  metaInfo: {
    titleTemplate: '%s | Worxstr',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'description',
        content: 'The adaptive solution to wide-scale temp labor management.',
      },
    ],
  },
  components: {
    WorxstrFooter,
  },
})
export default class App extends Vue {
  async mounted() {
    this.initDarkMode()
    this.promptSSN()
  }

  promptSSN() {
    // If SSN isn't set, need_info flag will be true. Prompt user to enter SSN
    const user = this.$store.state.authenticatedUser
    if (user.employee_info && user.employee_info.need_info) {
      this.$store.dispatch('showSnackbar', {
        text: `You haven't set your Social Security number.`,
        action: () => {
          this.$router.push({
            name: 'settings',
            params: {
              openSSNDialog: 'true',
            },
          })
        },
        actionText: 'Set SSN',
      })
    }
  }

  initDarkMode() {
    const userPrefDarkMode = window.localStorage.getItem('darkMode')
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    if (userPrefDarkMode == 'System default') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      darkMediaQuery.addEventListener('change', e => {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      })

      if (darkMediaQuery.matches) {
        setTimeout(() => (this.$vuetify.theme.dark = true), 0)
      }
    } else {
      this.$vuetify.theme.dark = userPrefDarkMode == 'Dark'
    }
  }

  signOut(): void {
    this.$store.dispatch('signOut')
  }

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser
  }

  get snackbar() {
    return this.$store.state.snackbar
  }

  get showBottomNav() {
    return this.authenticatedUser &&
      this.authenticatedUser.roles &&
      this.$vuetify.breakpoint.smAndDown &&
      this.$route.name != 'conversation'&&
      this.$route.name != 'home'
  }
  
  get bottomPadding() {
    return this.showBottomNav ? '56px' : '0px'
  }

  get pageHeight() {
    // Normal view
    if (!this.$route.meta.fullHeight) return '100%'
    
    // Full height, bottom nav visible
    // 100% - (top bar height + bottom bar height)
    else if (this.showBottomNav) return 'calc(100vh - (56px + 56px))'
  
    // Full height, bottom nav hidden
    // 100% - top bar height
    else return 'calc(100vh - 56px)'
  }

  get primaryNavLinks() {
    return this.$router.options.routes
      ?.filter((route) => {
        const meta = route.meta

        if (!meta) return false

        const icon = !!meta.icon
        const restrict = !!meta.restrict

        const userHasRequiredRole = !!meta.restrict?.some((role: UserRole) =>
          this.authenticatedUser?.roles?.map((r: Role) => r.id).includes(role)
        )

        return (icon && !restrict) || (icon && userHasRequiredRole)
      })
      .map((route) => ({
        text: route.name,
        icon: route.meta.icon,
        to: route.name,
      }))
  }

  get secondaryNavLinks() {
    return this.authenticatedUser
      ?
      [{
        text: 'Settings',
        icon: 'mdi-cog',
        to: 'settings',
      },
      {
        text: 'Sign out',
        icon: 'mdi-logout-variant',
        click: this.signOut,
      }]
      :
      [{
        text: 'About',
        to: 'about',
      },
      {
        text: 'Contact us',
        to: 'contact',
      }]
  }
}
</script>

<style lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease !important;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(100%) !important;
  height: 0 !important;
  opacity: 0;
}
</style>