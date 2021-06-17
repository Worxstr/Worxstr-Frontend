<template lang="pug">
v-app
  nav-drawer(v-if="showNavDrawer")

  app-bar

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

import AppBar from '@/layouts/AppBar.vue'
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
    AppBar,
    NavDrawer,
    BottomNav,
    WorxstrFooter,
    MessageSnackbar,
  },
})
export default class App extends Vue {

  async mounted() {
    this.initDarkMode();
    this.promptSSN();
  }

  promptSSN() {
    // If SSN isn't set, need_info flag will be true. Prompt user to enter SSN
    const user = this.$store.state.authenticatedUser;
    if (user.employee_info && user.employee_info.need_info) {
      this.$store.dispatch("showSnackbar", {
        text: `You haven't set your Social Security number.`,
        action: () => {
          this.$router.push({
            name: "settings",
            params: {
              openSSNDialog: "true",
            },
          });
        },
        actionText: "Set SSN",
      });
    }
  }

  initDarkMode() {
    const userPrefDarkMode = window.localStorage.getItem("darkMode");
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (userPrefDarkMode == "System default") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      darkMediaQuery.addEventListener("change", (e) => {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      });

      if (darkMediaQuery.matches) {
        setTimeout(() => (this.$vuetify.theme.dark = true), 0);
      }
    } else {
      this.$vuetify.theme.dark = userPrefDarkMode == "Dark";
    }
  }

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser;
  }

  get showNavDrawer() {
    return !this.$route.meta.landing && this.$vuetify.breakpoint.mdAndUp
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

  landingLinks = [
    {
      text: "Pricing",
      to: "pricing",
    },
    {
      text: "About",
      to: "about",
    },
    {
      text: "Contact us",
      to: "contact",
    },
  ]
}
</script>