<template lang="pug">
v-app
  v-system-bar(app v-if='safeAreaTop' :height='safeAreaTop' :color="$vuetify.theme.dark ? 'black' : 'white'")

  toolbar(@toggleDrawer="drawer = !drawer" v-if='showHeader')
  
  nav-drawer(v-if="showNavDrawer" v-model="drawer")

  app-update-dialog(:opened.sync='appUpdateDialog')

  v-main#main(
    :class="{ white: !$vuetify.theme.dark, 'lighten-3': !$vuetify.theme.dark }"
    :style="`padding-top: ${topMargin}px; padding-bottom: ${bottomMargin}px`"
  )
    v-container.pa-0.align-start(fluid :style="`height: ${pageHeight}`")
      
      //- Identity verification alert
      v-container.pb-0(v-if='showUnverifiedWarning')
        v-alert.mb-0(
          dense
          prominent
          type='warning'
          color='warning'
          icon='mdi-alert'
        )
          .d-flex.align-center
            span.flex-grow-1 You have not completed your identity verification.
            v-btn(text :to="{name: 'settings/payments', params: { verifyIdentity: 'true' }}") Verify
      
      //- Offline state alert
      transition(
        appear
        name='slide-y-reverse-transition'
      )
        v-alert.offline-alert.soft-shadow(
          v-if='offline'
          dense
          type='error'
          :class='{center: $vuetify.breakpoint.mdAndUp}'
          :style="`margin-bottom: ${bottomMargin}px`"
        ) You are offline. Some features may not be available until you reconnect.

      //- Test site watermark
      - var n = 0
      .test-site-watermark(v-if='showWatermark')
        while n < 60
          span.mr-7 FOR TESTING PURPOSES ONLY
          - n++
      
      //- Main view
      transition(
        appear,
        name="fade-transition",
        mode="out-in",
        :duration="{ enter: 150, leave: 50 }"
      )
        router-view#router-view(:style="`height: ${pageHeight};`")
        
      //- For some dumbass reason this computed value won't recalculate unless I have this here
      div(style='display: none') {{ safeAreaTop }}

  worxstr-footer(v-if='showFooter')

  message-snackbar(:bottom-offset='bottomMargin')

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User } from './types/Users'

import Toolbar from '@/layouts/Toolbar.vue'
import NavDrawer from '@/layouts/NavDrawer.vue'
import WorxstrFooter from '@/layouts/Footer.vue'
import MessageSnackbar from '@/layouts/MessageSnackbar.vue'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import { environment, sandboxMode } from './services/app'
import AppUpdateDialog from '@/views/AppUpdateDialog.vue'

@Component({
  metaInfo: {
    titleTemplate: '%s | Worxstr',
    meta: [
      {
        name: 'description',
        content: 'The adaptive solution to wide-scale temp labor management.',
      },
    ],
  },
  components: {
    Toolbar,
    NavDrawer,
    WorxstrFooter,
    MessageSnackbar,
    AppUpdateDialog,
  },
})
export default class App extends Vue {
  drawer = false
  stylesLoaded = false
  offline = false

  // Wait for external styles to load to compute safe areas
  created() {
    window.addEventListener('load', () => {
      this.stylesLoaded = true
    })
    // Sometimes that doesn't work. So for the next 8 seconds we will recompute the value
    // This is the most bullshit way to do this but it works
    for (let i = 0; i < 13; i++) {
      setTimeout(() => {
        this.stylesLoaded = false
        this.stylesLoaded = true
      }, 2 ** i)
    }

    Network.addListener('networkStatusChange', status => {
      this.offline = !status.connected
    })

    this.shouldShowWatermark() // Initialize watermark
    environment.on('baseUrlChanged', () => {
      this.shouldShowWatermark()
    })
  }

  get env() {
    return process.env.VUE_APP_TEST_MODE
  }

  get me(): User {
    return this.$store.getters.me
  }

  get showUnverifiedWarning() {
    return !this.$store.getters.iAmVerified && this.$store.getters.me && !this.$route.meta?.landing
  }

  get showNavDrawer() {
    return !this.$route.meta?.landing && !this.$route.meta?.noSkeleton
  }

  get showHeader() {
    return !this.$route.meta?.noSkeleton
  }

  get showFooter() {
    return this.isLanding && !Capacitor.isNativePlatform()
  }

  get isLanding() {
    return !!this.$route.meta?.landing
  }

  get headerHeight() {
    if (!this.showHeader) return 0
    return !this.mobileLayout ? 64 : 56
  }
  footerHeight = 56

  get pageHeight() {
    const viewportHeight =  `calc(100vh - ${this.headerHeight +
                                            this.safeAreaTop +
                                            this.safeAreaBottom}px)`
    this.setCSSVariable('page-height', viewportHeight)
    
    // Normal view
    if (!this.$route.meta?.fullHeight || this.$route.meta?.noSkeleton) {
      return '100%'
    }
    // Full height, bottom nav hidden
    else {
      return viewportHeight
    }
  }

  setCSSVariable(key: string, val: string) {
    document.documentElement.style.setProperty(`--${key}`, val)
  }

  get mobileLayout() {
    return this.$vuetify.breakpoint.smAndDown
  }

  // Get safe area values from css definitions
  get safeAreaTop() {
    if (!this.stylesLoaded) return 0
    return parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sat')
        .replace('px', '')
    )
  }
  get safeAreaBottom() {
    if (!this.stylesLoaded || this.$route.meta?.bleedSafeAreaBottom) return 0
    return parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sab')
        .replace('px', '')
    )
  }

  get topMargin() {
    if (!this.mobileLayout || this.isLanding) {
      const val = this.headerHeight + this.safeAreaTop
      this.setCSSVariable('top-margin', val + 'px')
      return val
    }
    this.setCSSVariable('top-margin', this.safeAreaTop + 'px')
    return this.safeAreaTop
  }

  get bottomMargin() {
    if (this.mobileLayout && !this.isLanding) {
      return this.headerHeight + this.safeAreaBottom
    }
    return this.safeAreaBottom
  }

  get appUpdateDialog() {
    return this.$store.state.app.appUpdateDialog
  }

  showWatermark = false
  shouldShowWatermark() {
    const noWatermark = JSON.parse(window.localStorage.getItem('noWatermark') || 'false')
    const isTestSite = window.location.href.includes('test.worxstr.com')
    const isSandbox = sandboxMode.getStoredPreference()
    this.showWatermark = (isTestSite || isSandbox) && !noWatermark
  }
}
</script>

<style lang="scss">
.v-system-bar {
  z-index: 100 !important;
}

// Helper classes to hide app content for QR code scanner
// Used in ClockInDialog.vue
.webview-transparent {
  display: none !important;
  opacity: 0 !important;
}
.no-bg {
  background-color: transparent !important;
}

$navwidth: 256px;
$halfnavwidth: $navwidth / 2;

.offline-alert {
  position: fixed !important;
  z-index: 5;
  bottom: 0;
  margin: 10px;
  width: 580px;
  left: 50%;
  transform: translateX(calc(-50% - 10px));
  max-width: calc(100% - 20px);

  // Center, accounting for nav drawer width
  &.center {
    left: calc(50% + #{$navwidth});
    transform: translateX(calc(-50% - 10px - #{$halfnavwidth}));
  }
}

.test-site-watermark {
  transform: rotate(-6deg) scale(1.4) translateX(-5%);
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(255,0,0,.05);
  z-index: 9999;
  font-size: 3em;
  text-align: center;
  color: rgba(128,128,128,.08);
  font-weight: 800;
  pointer-events: none;
}
</style>
