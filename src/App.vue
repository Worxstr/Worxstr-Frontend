<template lang="pug">
v-app
  v-system-bar(app :height='safeAreaTop' color='rgba(0,0,0,.35)')

  toolbar(@toggleDrawer="drawer = !drawer" v-if='showHeader')
  
  nav-drawer(v-if="showNavDrawer", v-model="drawer")

  v-main(
    :class="{ white: !$vuetify.theme.dark, 'lighten-3': !$vuetify.theme.dark }"
  )
    v-container.pa-0.align-start(fluid :style="`height: ${pageHeight}`")
      transition(
        appear,
        name="fade-transition",
        mode="out-in",
        :duration="{ enter: 150, leave: 50 }"
      )
        router-view#router-view(:style="`height: ${pageHeight}`")

  worxstr-footer(v-if="showFooter")

  message-snackbar
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User } from './definitions/User'

import Toolbar from '@/layouts/Toolbar.vue'
import NavDrawer from '@/layouts/NavDrawer.vue'
import WorxstrFooter from '@/layouts/Footer.vue'
import MessageSnackbar from '@/layouts/MessageSnackbar.vue'

@Component({
  metaInfo: {
    titleTemplate: "%s | Worxstr",
    meta: [
      { charset: "utf-8" },
      {
        name: "description",
        content: "The adaptive solution to wide-scale temp labor management.",
      },
    ],
  },
  components: {
    Toolbar,
    NavDrawer,
    WorxstrFooter,
    MessageSnackbar,
  },
})
export default class App extends Vue {

  drawer = false

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser;
  }

  get showNavDrawer() {
    return !this.$route.meta.landing && !this.$route.meta.noSkeleton
  }

  get showHeader() {
    return !this.$route.meta.noSkeleton
  }

  get showFooter() {
    return this.$route.meta.landing
  }

  get headerHeight() {
    return this.$vuetify.breakpoint.mdAndUp ? 64 : 56;
  }
  footerHeight = 56;

  get pageHeight() {
    // Normal view
    if (!this.$route.meta.fullHeight || this.$route.meta.noSkeleton) return "100%";
    // Full height, bottom nav hidden
    else return `calc(100vh - ${this.headerHeight}px)`;
  }

  get safeAreaTop() {
    return getComputedStyle(document.documentElement).getPropertyValue("--sat")
  }
}
</script>
