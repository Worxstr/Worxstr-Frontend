<template lang="pug">
  div
    v-app-bar.toolbar(
      app
      outlined
      :elevate-on-scroll='!bottomToolbar'
      :bottom="bottomToolbar"
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'"
      :class="$route.meta.landing ? 'landing' : 'app'"
      v-touch='{up: () => { $emit("toggleDrawer") }}'
    )
      v-btn(
        icon
        @click="$emit('toggleDrawer')"
        v-if='mediumLayout && !$route.meta.landing'
      )
        v-icon mdi-menu
      
      router-link.mb-2.mr-2(
        to="/",
        style="text-decoration: none",
        v-if="$route.meta.landing"
      )
        v-avatar(tile, size="130")
          img(
            :src="require(`@/assets/logos/${logo}.svg`)"
            alt="Worxstr logo"
          )

      breadcrumbs

      portal-target.d-flex.align-center(name="toolbarTitle")

      v-spacer

      portal-target.d-flex.align-center(name="toolbarActions")

      div(v-if="$route.meta.landing")
        v-btn(v-if='mobileLayout' icon @click='menu = true')
          v-icon mdi-menu
        div(v-else)
          v-btn(v-for="(link, i) in links" :key='i' text :to="link.to" v-if='!link.hide') {{ link.text }}

    v-navigation-drawer(v-model='menu' app right disable-resize-watcher)
      v-list.mobile-nav-items(nav)
        v-list-item(v-for="(link, i) in links" :key='i' text :to="link.to" link v-if='!link.hide')
          v-list-item-content
            v-list-item-title {{ link.text }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Breadcrumbs from '@/layouts/Breadcrumbs.vue'
import { Capacitor } from '@capacitor/core'

@Component({
  components: {
    Breadcrumbs,
  },
})
export default class Toolbar extends Vue {
  @Prop({ default: false }) drawer!: boolean
  
  menu = false
  
  get bottomToolbar() {
    return this.mediumLayout && !this.$route.meta?.landing
  }

  get logo() {
    const mini = this.$store.state.app.preferences.miniNav
    const logotype = (this.$vuetify.theme.dark ? 'logotype-dark' : 'logotype')
    return (mini && !this.$route.meta?.landing) ? 'icon' : logotype
  }

  get mediumLayout() {
    return this.$vuetify.breakpoint.smAndDown
  }

  get mobileLayout() {
    return this.$vuetify.breakpoint.xs
  }

  get authenticated() {
    return !!this.$store.getters.me
  }

  get links() {
    return [
      {
        text: 'Home',
        to: '/',
        hide: !this.mobileLayout,
      },
      {
        text: 'About',
        to: 'about',
      },
      {
        text: 'Contact us',
        to: 'contact',
      },
      // {
      //   text: "Support",
      //   to: "support",
      // },
      {
        text: 'Pricing',
        to: 'pricing',
        hide: Capacitor.isNativePlatform(),
      },
      {
        text: 'Sign in',
        to: 'sign-in',
        hide: this.authenticated,
      },
      {
        text: 'Sign up',
        to: 'sign-up',
        hide: !this.mobileLayout || this.authenticated,
      },
    ]
  }
}
</script>

<style lang='scss'>
.toolbar {
  height: auto !important;
  &.app {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
.mobile-nav-items {
  padding-top: max(env(safe-area-inset-top), 10px) !important;
}
</style>