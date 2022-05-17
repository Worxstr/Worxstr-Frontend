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
      
      //- Logotype
      router-link.mb-2.mr-2(
        to="/"
        style="text-decoration: none"
        v-if="$route.meta.landing"
      )
        v-avatar(tile, size="130")
          img(
            :src="require(`@/assets/logos/${logo}.svg`)"
            alt="Worxstr logo"
          )

      //- Breadcrumb nav items
      breadcrumbs

      //- Left portal
      portal-target.d-flex.align-center(name="toolbarTitle")

      v-spacer

      //- Right portal
      portal-target.d-flex.align-center(name="toolbarActions")

      //- Landing page nav items
      div(v-if="$route.meta.landing")
        v-btn(
          v-if='mobileLayout'
          icon 
          @click='menu = true'
        )
          v-icon mdi-menu
        
        div(v-else)
          div
            v-btn(
              v-for="(link, i) in links"
              v-if='!link.hide'
              text
              :to="{name: link.to}"
              @mouseover='openSubmenu(i)'
            ) {{ link.text }}
          
          v-card(style='position: absolute')
            v-card-text
              v-window(v-model='submenu' reverse)
                v-window-item(v-for='(menu, i) in links' :key='i')
                  p content {{i}}

          //- v-menu(
          //-   v-for="(link, i) in links"
          //-   v-if='!link.hide'
          //-   :key='i'
          //-   offset-y
          //-   open-on-hover
          //- )
          //-   template(v-slot:activator='{ on, attrs }')
          //-     v-btn(
          //-       v-bind='attrs'
          //-       v-on='on'
          //-       text
          //-       :to="{name: link.to}"
          //-     ) {{ link.text }}
            
          //-   v-list
          //-     v-list-item
          //-       v-list-item-title Test item 1
          //-     v-list-item
          //-       v-list-item-title Test item 2
          //-     v-list-item
          //-       v-list-item-title Test item 3

    //- Right nav drawer for landing page
    v-navigation-drawer(v-model='menu' app right disable-resize-watcher)
      v-list.mobile-nav-items(nav)
        v-list-item(
          v-for="(link, i) in links"
          :key='i'
          text
          :to="{name: link.to}"
          link
          v-if='!link.hide'
        )
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
  submenu: number | null = null

  openSubmenu(i: number) {
    this.submenu = i
  }
  
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
        to: 'home',
        hide: !this.mobileLayout,
      },
      {
        text: 'About',
        to: 'about',
      },
      {
        text: 'Blog',
        to: 'blog',
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
        to: 'signIn',
        hide: this.authenticated,
      },
      {
        text: 'Sign up',
        to: 'signUp',
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