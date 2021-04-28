<template lang="pug">

v-app
  v-app-bar(app :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'" elevate-on-scroll)
    v-container.py-0.fill-height
      router-link(to='/' style='text-decoration: none')
        v-avatar.mr-10(tile size='50')
          img(src='@/assets/logo.svg' alt="Worxstr logo")

      .d-flex.flex-row(v-if='!$vuetify.breakpoint.smAndDown')
        v-btn(v-for='link in primaryNavLinks'
        :key='link.text'
        text
        :to='{ name: link.to }'
        active-class='primary--text')
          | {{ link.text }}

      v-spacer

      div(v-for="link in secondaryNavLinks")

        //- Icon button
        v-tooltip(v-if="link.icon" bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(
              icon
              v-bind="attrs"
              v-on="on"
              :to="link.to ? { name: link.to } : null"
              @click="() => link.click ? link.click() : ''"
            )
              v-icon {{ link.icon }}
          
          span {{ link.text }}

        //- Text button
        v-btn(
          v-else
          text
          :to="{ name: link.to }"
          active-class="primary--text"
        )
          | {{ link.text }}
      

  v-main(
    :class="{'grey': !$vuetify.theme.dark, 'lighten-3': !$vuetify.theme.dark}"
    :style="`padding-bottom: ${$route.meta && $route.meta.fullHeight ? '0px' : ''}`"
  )
    v-container.pa-0.align-start(fluid)
      transition(appear name='slide-y-transition' mode='out-in')
        router-view(:style='`height: ${pageHeight}`')

  transition(name='slide-fade')
    v-bottom-navigation(
      app
      color='indigo'
      grow
      v-if="\
        authenticatedUser &&\
        authenticatedUser.roles &&\
        $vuetify.breakpoint.smAndDown &&\
        $route.name != 'conversation'&&\
        $route.name != 'home'"
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

<script>
import Vue from "vue";
import { mapState } from "vuex";
import WorxstrFooter from "@/components/WorxstrFooter";

export default Vue.extend({
  name: "App",
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
  async mounted() {
    // const storedUser = localStorage.getItem("authenticatedUser");
    // if (storedUser) {
    //   this.$store.commit("SET_AUTHENTICATED_USER", {
    //     user: JSON.parse(storedUser),
    //   });
    // }
    // Refresh user data in case of an update
    this.initDarkMode();
    await this.$store.dispatch("getAuthenticatedUser");

    // If SSN isn't set, need_info flag will be true. Prompt user to enter SSN
    const user = this.$store.state.authenticatedUser;
    if (user.employee_info && user.employee_info.need_info) {
      this.$store.dispatch("showSnackbar", {
        text: "You haven't set your Social Security number.",
        action: () => {
          this.$router.push({
            name: "settings",
            params: {
              openSSNDialog: true,
            },
          });
        },
        actionText: "Set SSN",
      });
    }
  },
  methods: {
    signOut() {
      this.$store.dispatch("signOut");
    },
    initDarkMode() {
      const userPrefDarkMode = window.localStorage.getItem("darkMode");
      const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      if (userPrefDarkMode == "System default") {
        darkMediaQuery.addEventListener("change", (e) => {
          this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        });

        if (darkMediaQuery.matches) {
          setTimeout(() => (this.$vuetify.theme.dark = true), 0);
        }
      } else {
        this.$vuetify.theme.dark = userPrefDarkMode == "Dark";
      }
    },
  },
  computed: {
    ...mapState(["authenticatedUser", "snackbar"]),
    pageHeight() {
      if (!this.$route.meta.fullHeight) return "100%";
      else if (this.$vuetify.breakpoint.mdAndUp) return "calc(100vh - 65px)";
      else return "calc(100vh - 56px)";
    },
    primaryNavLinks() {
      return this.$router.options.routes
        .filter(
          (r) =>
            r.meta &&
            ((r.meta.icon && !r.meta.restrict) ||
              (r.meta.icon &&
                r.meta.restrict &&
                this.authenticatedUser &&
                r.meta.restrict.some((role) =>
                  this.authenticatedUser.roles.map((r) => r.id).includes(role)
                )))
        )
        .map((route) => ({
          text: route.name,
          icon: route.meta.icon,
          to: route.name,
        }));
    },
    secondaryNavLinks() {
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
            },
          ]
        : [
            {
              text: "About",
              to: "about",
            },
            {
              text: "Contact us",
              to: "contact",
            },
          ];
    },
  },
});
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