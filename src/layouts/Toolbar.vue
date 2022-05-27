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
        v-if='mobileLayout && !$route.meta.landing'
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
        
        .d-flex(v-else)
          div(
            v-for="(link, i) in links"
            v-if='!link.hide'
            :key='i'
          )
            v-menu(
              v-if='link.submenu'
              offset-y
              open-on-hover
            )
              template(v-slot:activator='{ on, attrs }')
                v-btn(
                  v-bind='attrs'
                  v-on='on'
                  text
                )
                  | {{ link.label }}
                  v-icon(right) mdi-chevron-down
              
              v-list
                div(v-if='link.submenu === "cms"')
                  div(v-if='cmsMenuItems && cmsMenuItems[link.label]')
                    v-list-item(
                      v-if='cmsMenuItems[link.label]'
                      v-for='(sublink, j) in cmsMenuItems[link.label].submenus'
                      :key='j'
                      :to="sublink.to"
                    )
                      v-list-item-title {{ sublink.label }}
                    
                div(v-else)
                  v-list-item(
                    v-for='(sublink, j) in link.submenu'
                    :key='j'
                    :to="sublink.to"
                  )
                    v-list-item-title {{ sublink.label }}

            v-btn(
              v-else
              text
              :to="{name: link.to}"
            ) {{ link.label }}
          
          v-btn.ml-2(
            v-if='!authenticated'
            color='primary'
            elevation='0'
            :to="{ name: 'signUp' }"
          ) Start now

    //- Right nav drawer for landing page
    v-navigation-drawer(v-model='menu' app right disable-resize-watcher)
      v-list.mobile-nav-items(nav)
        div(
          v-for="(link, i) in links"
          :key='i'
          v-if='!link.hide'
        )
          v-list-group(v-if='link.submenu')
            template(v-slot:activator)
              v-list-item-title {{ link.label }}
              
            div(v-if='cmsMenuItems && cmsMenuItems[link.label]')
              v-list-item(
                v-if='link.submenu === "cms"'
                link
                v-for='(sublink, j) in cmsMenuItems[link.label].submenus'
                :key='j'
                :to="{name: sublink.to}"
              )
                v-list-item-title {{ sublink.label }}
              
              v-list-item(
                v-else
                link
                v-for='(sublink, j) in link.submenu'
                :key='j'
                :to="{name: sublink.to}"
              )
                v-list-item-title {{ sublink.label }}
                

          v-list-item(
            link
            v-else
            :to="{name: link.to}"
          )
            v-list-item-content
              v-list-item-title {{ link.label }}

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Breadcrumbs from '@/layouts/Breadcrumbs.vue'
import { Capacitor } from '@capacitor/core'
import { getMenuItems } from '@/services/cms'

@Component({
  components: {
    Breadcrumbs,
  },
})
export default class Toolbar extends Vue {
  @Prop({ default: false }) drawer!: boolean
  
  menu = false
  cmsMenuItems: any = {}

  async mounted() {
    const menuItems = await getMenuItems()
    menuItems.forEach(item => {
      this.cmsMenuItems[item.attributes.label] = item.attributes
      this.$forceUpdate()
    })
  }
  
  get bottomToolbar() {
    return this.mobileLayout && !this.$route.meta?.landing
  }

  get logo() {
    const mini = this.$store.state.app.preferences.miniNav
    const logotype = (this.$vuetify.theme.dark ? 'logotype-dark' : 'logotype')
    return (mini && !this.$route.meta?.landing) ? 'icon' : logotype
  }

  get mediumLayout() {
    return this.$vuetify.breakpoint.mdAndDown
  }

  get mobileLayout() {
    return this.$vuetify.breakpoint.smAndDown
  }

  get authenticated() {
    return !!this.$store.getters.me
  }

  get links() {
    return [
      {
        label: 'Home',
        to: 'home',
        hide: !this.mobileLayout,
      },
      {
        label: 'About',
        to: 'about',
      },
      {
        label: 'Features',
        submenu: 'cms',
      },
      {
        label: 'Industries',
        submenu: 'cms',
      },
      {
        label: 'Resources',
        submenu: 'cms',
      },
      {
        label: 'Pricing',
        to: 'pricing',
        hide: Capacitor.isNativePlatform(),
      },
      // {
      //   label: 'Contact us',
      //   to: 'contact',
      // },
      // {
      //   label: 'Submenu hardcoded',
      //   submenu: [
      //     {
      //       label: 'Pricing',
      //       to: 'pricing',
      //     }
      //   ]
      // },
      // {
      //   label: "Support",
      //   to: "support",
      // },
      {
        label: 'Sign in',
        to: 'signIn',
        hide: this.authenticated,
      },
      {
        label: 'Sign up',
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
  z-index: 7 !important;
  &.app {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
.mobile-nav-items {
  padding-top: max(env(safe-area-inset-top), 10px) !important;
}

.v-list-group__header {
  margin-bottom: 0 !important;
}
</style>