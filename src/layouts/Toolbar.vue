<template lang="pug">
  v-app-bar(
    app,
    outlined,
    :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'",
    :elevate-on-scroll='$vuetify.breakpoint.mdAndUp'
    :bottom="$vuetify.breakpoint.smAndDown && !$route.meta.landing"
  )
    v-btn(icon @click="$emit('toggleDrawer')" v-if='$vuetify.breakpoint.smAndDown && !$route.meta.landing') 
      v-icon mdi-menu

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
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Breadcrumbs from '@/layouts/Breadcrumbs.vue'

@Component({
  components: {
    Breadcrumbs
  }
})
export default class Toolbar extends Vue {

  @Prop({ default: false }) drawer!: boolean

  landingLinks = [
    {
      text: "About",
      to: "about",
    },
    {
      text: "Contact us",
      to: "contact",
    },
    {
      text: "Pricing",
      to: "pricing",
    },
  ]
}
</script>