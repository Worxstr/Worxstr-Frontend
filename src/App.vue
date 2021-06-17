<template lang="pug">
v-app
  nav-drawer(v-if="showNavDrawer" v-model='drawer')

  toolbar(@toggleDrawer='drawer = !drawer')

  v-main(
    :class="{ grey: !$vuetify.theme.dark, 'lighten-3': !$vuetify.theme.dark }",
    :style="`padding-bottom: ${bottomPadding}px`"
  )
    v-container.pa-0.align-start(fluid)
      transition(
        appear,
        name="fade-transition",
        mode="out-in",
        :duration="{ enter: 150, leave: 50 }"
      )
        router-view#router-view(:style="`height: ${pageHeight}`")

  bottom-nav(:show="showBottomNav")

  worxstr-footer(v-if="showFooter")

  message-snackbar
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User } from './definitions/User'

import Toolbar from '@/layouts/Toolbar.vue'
import NavDrawer from '@/layouts/NavDrawer.vue'
import BottomNav from '@/layouts/BottomNav.vue'
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
    BottomNav,
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
    return !this.$route.meta.landing
  }

  get showBottomNav() {
    return (
      this.authenticatedUser &&
      this.authenticatedUser.roles &&
      this.$vuetify.breakpoint.smAndDown &&
      this.$route.name != "conversation" &&
      this.$route.name != "home"
    );
  }

  get showFooter() {
    return this.$route.meta.landing
  }

  get bottomPadding() {
    return this.showBottomNav ? this.footerHeight : 0;
  }

  get headerHeight() {
    return this.$vuetify.breakpoint.mdAndUp ? 64 : 56;
  }
  footerHeight = 56;

  get pageHeight() {
    // Normal view
    if (!this.$route.meta.fullHeight) return "100%";
    // Full height, bottom nav visible
    else if (this.showBottomNav)
      return `calc(100vh - (${this.headerHeight}px + ${this.footerHeight}px))`;
    // Full height, bottom nav hidden
    else return `calc(100vh - ${this.headerHeight}px)`;
  }
}
</script>