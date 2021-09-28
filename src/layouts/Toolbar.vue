<template lang="pug">
  div
    v-app-bar.toolbar(
      app
      outlined
      :elevate-on-scroll='!bottomToolbar'
      :bottom="bottomToolbar"
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'"
      :class="$route.meta.landing ? 'landing' : 'app'"
    )
      v-btn(
        icon
        @click="$emit('toggleDrawer')"
        v-if='$vuetify.breakpoint.smAndDown && !$route.meta.landing'
      )
        v-icon mdi-menu

      router-link.mb-2.mr-2(
        to="/",
        style="text-decoration: none",
        v-if="$route.meta.landing"
      )
        v-avatar(tile, size="130")
          img(
            :src="require(`@/assets/logos/${mini ? 'icon' : $vuetify.theme.dark ? 'logotype-dark' : 'logotype'}.svg`)"
            alt="Worxstr logo"
          )

      breadcrumbs

      v-spacer

      portal-target.d-flex(name="toolbarActions")

      div(v-if="$route.meta.landing")
        v-btn(v-if='$vuetify.breakpoint.xs' icon @click='menu = true')
          v-icon mdi-menu
        div(v-else)
          v-btn(v-for="(link, i) in links" :key='i' text :to="link.to" v-if='!link.mobileOnly') {{ link.text }}

    v-navigation-drawer(v-model='menu' app right disable-resize-watcher)
      v-list.mobile-nav-items(nav)
        v-list-item(v-for="(link, i) in links" :key='i' text :to="link.to" link)
          v-list-item-content
            v-list-item-title {{ link.text }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Breadcrumbs from '@/layouts/Breadcrumbs.vue'

@Component({
  components: {
    Breadcrumbs,
  },
})
export default class Toolbar extends Vue {
  @Prop({ default: false }) drawer!: boolean
  
  get bottomToolbar() {
    return this.$vuetify.breakpoint.smAndDown && !this.$route.meta.landing
  }

  menu = false

  links = [
    {
      text: 'Home',
      to: '/',
      mobileOnly: true,
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
    },
    {
      text: 'Sign in',
      to: 'sign-in',
      mobileOnly: true,
    },
    {
      text: 'Sign up',
      to: 'sign-up',
      mobileOnly: true,
    },
  ]
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