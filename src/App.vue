<template lang="pug">
v-app.d-flex.flex-column.fill-height
  v-app-bar.flex-grow-0(color='white' elevate-on-scroll='' scroll-target='#scroll-target')
    v-container.py-0.fill-height
      router-link(to='/' style='text-decoration: none')
        v-avatar.mr-10(color='grey darken-1' size='32')
          span.white--text W

      .d-flex.flex-row(v-if='\
      authenticatedUser &&\
      authenticatedUser.roles &&\
      !$vuetify.breakpoint.smAndDown\
      ')
        v-btn(v-for='route in $router.options.routes.filter(\
          r =>\
          r.meta &&\
          (\
            (r.meta.icon && !r.meta.restrict) ||\
            (r.meta.icon &&\
            r.meta.restrict &&\
            r.meta.restrict.some((role) =>\
            authenticatedUser.roles.map((r) => r.id).includes(role)\
            ))\
          )\
        )'
        :key='route.name'
        text=''
        :to='{ name: route.name }'
        active-class='primary--text')
          | {{ route.name }}

      v-spacer

      div(v-if='authenticatedUser')
        v-menu(v-model='menu' :close-on-content-click='false' bottom='' left='')
          template(v-slot:activator='{ on, attrs }')
            v-btn(icon='')
              v-icon(v-bind='attrs' v-on='on') mdi-bell-outline

          v-card
            v-list(two-line='')
              v-list-item-group
                template(v-for='(item, index) in notifs')
                  v-list-item(:key='item.title')
                    template(v-slot:default='')
                      v-list-item-content
                        v-list-item-title(v-text='item.title')
                        v-list-item-subtitle.text--primary(v-text='item.headline')
                        v-list-item-subtitle(v-text='item.subtitle')
                      v-list-item-action
                        v-list-item-action-text(v-text='item.action')
                        v-icon(color='yellow darken-3')  mdi-star 
                  v-divider(v-if='index < notifs.length - 1' :key='index')

        v-btn(icon='' @click='signOut')
          v-icon mdi-logout-variant

      div(v-else='')
        v-btn(text='' :to="{ name: 'signIn' }" active-class='primary--text')
          | Sign in
        v-btn(text='' :to="{ name: 'signUp' }" active-class='primary--text')
          | Sign up

  v-main#scroll-target.grey.lighten-3.d-flex.flex-column.fill-height
    v-container.pa-0.fill-height.align-start(fluid='')
      transition(appear='' name='slide-y-transition' mode='out-in')
        router-view

  transition(name='slide-fade')
    v-bottom-navigation(v-model='value' :input-value='active' v-if="\
    $vuetify.breakpoint.smAndDown &&\
    authenticatedUser &&\
    authenticatedUser.roles &&\
    $route.name != 'home' &&\
    $route.name != 'conversation'\
    " color='indigo' grow='')
      v-btn(v-for='route in $router.options.routes.filter(\
      (r) =>\
      r.meta &&\
      ((r.meta.icon && !r.meta.restrict) ||\
      (r.meta.icon &&\
      r.meta.restrict &&\
      r.meta.restrict.some((role) =>\
      authenticatedUser.roles.map((r) => r.id).includes(role)\
      )))\
      )'
      :key='route.name'
      :value='route.name'
      :to='{ name: route.name }'
    )
        span {{ route.name | capitalize }}
        v-icon {{ route.meta.icon }}

  v-snackbar(app='' v-model='snackbar.show' :timeout='snackbar.timeout')
    | {{ snackbar.text }}
    template(v-slot:action='{ attrs }' v-if='snackbar.action')
      v-btn(color='blue' text='' v-bind='attrs' @click='snackbar.show = false')
        | Close

</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions } from "vuex";

export default Vue.extend({
  name: "App",
  mounted() {
    const storedUser = localStorage.getItem("authenticatedUser");
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
  },
  data: () => ({
    links: [
      {
        icon: "mdi-clock-outline",
        label: "clock",
      },
      {
        icon: "mdi-calendar-check",
        label: "availability",
      },
      {
        icon: "mdi-calendar-multiselect",
        label: "schedule",
      },
      {
        icon: "mdi-message-text-outline",
        label: "messages",
      },
    ],
    menu: false,
    notifs: [
      {
        action: "15 min",
        headline: "Brunch this weekend?",
        subtitle: `I'll be in your neighborhood doing errands this weekend.`,
        title: "Ali Connors",
      },
      {
        action: "2 hr",
        headline: "Summer BBQ",
        subtitle: `Wish I could come, but I'm out of town this weekend.`,
        title: "me, Scrott, Jennifer",
      },
      {
        action: "6 hr",
        headline: "Oui oui",
        subtitle: "Do you have Paris recommendations? Have you ever been?",
        title: "Sandra Adams",
      },
      {
        action: "12 hr",
        headline: "Birthday gift",
        subtitle:
          "Have any ideas about what we should get Heidi for her birthday?",
        title: "Trevor Hansen",
      },
      {
        action: "18hr",
        headline: "Recipe to try",
        subtitle:
          "We should eat this: Grate, Squash, Corn, and tomatillo Tacos.",
        title: "Britta Holt",
      },
    ],
  }),
});
</script>

<style lang="scss">
.v-bottom-navigation {
  transform: initial !important;
  height: 56px !important;
}
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

main {
  flex: 1 !important;
  overflow: auto;
}
.v-main__wrap {
  height: 100% !important;
}
.v-app-bar {
  z-index: 1;
}
</style>