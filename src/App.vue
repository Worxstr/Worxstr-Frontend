<template lang="pug">
v-app
  v-navigation-drawer.d-flex.flex-column(
    v-if="$vuetify.breakpoint.mdAndUp",
    app,
    :mini-variant="miniNav",
    mini-variant-width="68",
    permanent
  )
    v-app-bar(flat, :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'")
      a(@click="miniNav = !miniNav", text)
        v-avatar.mb-1(tile, size="40")
          img(src="@/assets/logo.svg", alt="Worxstr logo")

      v-toolbar-title.ml-3.font-weight-medium Worxstr

      v-spacer

      v-btn(icon, @click.stop="miniNav = !miniNav")
        v-icon mdi-chevron-left

    v-divider

    v-list.pt-0(dense)
      v-list-item.py-1(
        v-for="link in primaryNavLinks",
        :key="link.text",
        link,
        :to="{ name: link.to }",
        active-class="primary--text"
      )
        v-list-item-icon
          v-icon {{ link.icon }}

        v-list-item-content
          v-list-item-title {{ link.text | capitalize }}

    template(v-slot:append)
      v-list(dense)
        v-divider

        v-list-item.py-1(
          v-for="link in secondaryNavLinks",
          :key="link.text",
          link,
          active-class="primary--text",
          :to="link.to ? { name: link.to } : null",
          @click="() => (link.click ? link.click() : '')"
        )
          v-list-item-icon
            v-icon {{ link.icon }}

          v-list-item-content
            v-list-item-title {{ link.text | capitalize }}

  v-app-bar(
    app,
    outlined,
    :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'",
    elevate-on-scroll
  )
    router-link(
      to="/",
      style="text-decoration: none",
      v-if="$route.name == 'home'"
    )
      v-avatar(tile, size="40")
        img(src="@/assets/logo.svg", alt="Worxstr logo")

    v-container.pa-0.fill-height
      v-breadcrumbs.py-0.pl-1(:items="breadcrumbs", large)
        template(v-slot:item="{ item }")
          v-breadcrumbs-item(:to="item.to", exact) {{ item.text | capitalize }}

      v-spacer

      portal-target(name="toolbarActions")

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

  worxstr-footer(v-if="$route.meta.showFooter")

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
import { Component, Vue } from "vue-property-decorator";
import WorxstrFooter from "@/components/WorxstrFooter.vue";
import { Role, User, UserRole } from "./definitions/User";
import dayjs from "dayjs";

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
    WorxstrFooter,
  },
})
export default class App extends Vue {
  miniNav = false;

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

  signOut(): void {
    this.$store.dispatch("signOut");
  }

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser;
  }

  get snackbar() {
    return this.$store.state.snackbar;
  }

  get breadcrumbs() {

    /* This generates breadcrumbs for the toolbar dynamically
       The route path is used to generate these.
       If a route path contains a parameter, ie. /jobs/:jobId, then
       the route metadata can be used to map the parameter name to an item
       in the store state. For example, the metadata
       meta: {
         paramMap: {
           jobId: 'jobs',
           prop: 'name'
         }
       }
       will replace the :jobId param with the 'name' property of the job in state.jobs
       that matches the id given.
    */

    const segments = this.$route.path
      .replace('/', '')
      .split('/')

    const matched = this.$route.matched[0].path
      .replace('/', '')
      .split('/')


    return segments.map((pathSegment, i) => {
      let dynamicName
      try {
        // Get param mapping from route metadata
        const paramMap = this.$route.meta.paramMap
        // Extract the param name
        const param = matched[i].replace(':','')
        // Find the item in the store state
        const item = this.$store.state[paramMap[param] || segments[0]].byId[pathSegment]

        dynamicName = item[paramMap.prop || 'name']
      }
      catch (e) {
        dynamicName = pathSegment
      }

      return {
        text: matched[i].includes(':') ? dynamicName : pathSegment,
        to: '/' + segments.slice(0, i + 1).join('/'),
      }
    })
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

  get primaryNavLinks() {
    return this.$router.options.routes
      ?.filter((route) => {
        const meta = route.meta;

        if (!meta) return false;

        const icon = !!meta.icon;
        const restrict = !!meta.restrict;

        const userHasRequiredRole = !!meta.restrict?.some((role: UserRole) =>
          this.authenticatedUser?.roles?.map((r: Role) => r.id).includes(role)
        );

        return (icon && !restrict) || (icon && userHasRequiredRole);
      })
      .map((route) => ({
        text: route.name,
        icon: route.meta.icon,
        to: route.name,
      }));
  }

  get secondaryNavLinks() {
    return this.authenticatedUser
      ? [
        {
          text: "Settings",
          icon: "mdi-cog",
          to: "settings",
        },
        {
          text: "Sign out",
          icon: "mdi-logout-variant",
          click: this.signOut,
          desktopOnly: true,
        },
      ]
      : [
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
      ];
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
.v-breadcrumbs__item--disabled {
  color: black !important;
}
</style>