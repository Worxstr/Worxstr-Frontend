<template lang="pug">

v-app
  v-app-bar(app :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'" elevate-on-scroll)
    v-container.py-0.fill-height
      router-link(to='/' style='text-decoration: none')
        v-avatar.mr-10(tile size='50')
          img(src='@/assets/logo.svg')

      .d-flex.flex-row(v-if='\
        authenticatedUser &&\
        authenticatedUser.roles &&\
        !$vuetify.breakpoint.smAndDown\
      ')
        v-btn(v-for='route in navLinks'
        :key='route.name'
        text
        :to='{ name: route.name }'
        active-class='primary--text')
          | {{ route.name }}

      v-spacer

      div(v-if='authenticatedUser')
        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon :to="{ name: 'settings' }" v-bind="attrs" v-on="on")
              v-icon mdi-cog
          span Settings

        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon @click='signOut' v-bind="attrs" v-on="on")
              v-icon mdi-logout-variant
          span Sign out

      div(v-else)
        v-btn(text :to="{ name: 'signIn' }" active-class='primary--text')
          | Sign in
        v-btn(text :to="{ name: 'signUp' }" active-class='primary--text')
          | Sign up

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
      :input-value="\
        authenticatedUser &&\
        authenticatedUser.roles &&\
        $vuetify.breakpoint.smAndDown &&\
        $route.name != 'conversation'\
        "
    )
        
      v-btn(
        v-for='route in navLinks'
        :key='route.name'
        :value='route.name'
        :to='{ name: route.name }'
      )
        span {{ route.name | capitalize }}
        v-icon {{ route.meta.icon }}

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

export default Vue.extend({
  name: "App",
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
      const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      darkMediaQuery.addEventListener("change", (e) => {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      });

      if (darkMediaQuery.matches) {
        setTimeout(() => (this.$vuetify.theme.dark = true), 0);
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
    navLinks() {
      return this.$router.options.routes.filter(
        (r) =>
          r.meta &&
          ((r.meta.icon && !r.meta.restrict) ||
            (r.meta.icon &&
              r.meta.restrict &&
              this.authenticatedUser &&
              r.meta.restrict.some((role) =>
                this.authenticatedUser.roles.map((r) => r.id).includes(role)
              )))
      );
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