<template lang="pug">

v-app
  v-app-bar(app color='white' elevate-on-scroll)
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
        v-btn(icon @click='signOut')
          v-icon mdi-logout-variant

      div(v-else)
        v-btn(text :to="{ name: 'signIn' }" active-class='primary--text')
          | Sign in
        v-btn(text :to="{ name: 'signUp' }" active-class='primary--text')
          | Sign up

  v-main.grey.lighten-3(
    :style="`padding-bottom: ${$route.meta && $route.meta.fullHeight ? '0px' : ''}`"
  )
    v-container.pa-0.align-start(fluid)
      transition(appear name='slide-y-transition' mode='out-in')
        router-view(:style="`height: calc(100vh - ${$vuetify.breakpoint.mdAndUp ? 65 : (56 + ($route.meta.hideNav ? 56 : 0))}px)`")

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
          @click='snackbar.show = false'
        )
          | Close

</template>

<script>
import Vue from "vue";
import { mapState, mapActions } from "vuex";

export default Vue.extend({
  name: "App",
  mounted() {
    // const storedUser = localStorage.getItem("authenticatedUser");
    // if (storedUser) {
    //   this.$store.commit("SET_AUTHENTICATED_USER", {
    //     user: JSON.parse(storedUser),
    //   });
    // }
    // Refresh user data in case of an update
    this.$store.dispatch("getAuthenticatedUser");
  },
  methods: {
    signOut() {
      this.$store.dispatch("signOut");
    },
  },
  computed: {
    ...mapState(["authenticatedUser", "snackbar"]),
    navLinks() {
      return this.$router.options.routes.filter(r =>
        r.meta &&
        (
          (r.meta.icon && !r.meta.restrict) ||
          (r.meta.icon &&
            r.meta.restrict &&
            this.authenticatedUser &&
            r.meta.restrict.some((role) => this.authenticatedUser.roles.map((r) => r.id).includes(role)
          ))
        )
      )
    }
  },
});
</script>

<style lang="scss">
// .v-bottom-navigation {
//   transform: initial !important;
//   height: 56px !important;
// }
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

// .v-main__wrap {
//   height: 100% !important;
// }
// .v-app-bar {
//   z-index: 1;
// }
</style>