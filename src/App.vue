<template lang="pug">
v-app
  nav-drawer

  v-app-bar(
    app,
    outlined,
    :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'",
    elevate-on-scroll
  )
    router-link.mb-1.mr-2(
      to="/",
      style="text-decoration: none",
      v-if="$route.meta.landing"
    )
      v-avatar(tile, size="40")
        img(src="@/assets/logo.svg", alt="Worxstr logo")

    breadcrumbs

    v-spacer

    portal-target(name="toolbarActions")

    div(v-if="$route.meta.landing")
      v-btn(v-for="link in landingLinks", text, :to="link.to") {{ link.text }}

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

  transition(name="slide-fade")
    v-bottom-navigation(app, color="indigo", grow, v-if="showBottomNav")
      v-btn(
        v-for="link in primaryNavLinks",
        :key="link.to",
        :value="link.text",
        :to="{ name: link.to }"
      )
        span {{ link.text | capitalize }}
        v-icon {{ link.icon }}

  worxstr-footer(v-if="$route.meta.landing")

  v-snackbar(app, v-model="snackbar.show", :timeout="snackbar.timeout")
    | {{ snackbar.text }}

    template(v-slot:action="{ attrs }", v-if="snackbar.action")
      v-btn(
        color="blue",
        text,
        v-bind="attrs",
        @click="() => { snackbar.action(); snackbar.show = false; }"
      )
        | {{ snackbar.actionText }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Role, User, UserRole } from './definitions/User'

import NavDrawer from '@/layouts/NavDrawer.vue'
import Breadcrumbs from '@/layouts/Breadcrumbs.vue'
import WorxstrFooter from '@/components/WorxstrFooter.vue'

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
    NavDrawer,
    Breadcrumbs,
    WorxstrFooter,
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

  get snackbar() {
    return this.$store.state.snackbar;
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
.v-breadcrumbs__item--disabled {
  color: black !important;
}
.white-text .v-breadcrumbs__item--disabled {
  color: white !important;
}
</style>