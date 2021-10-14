<template lang="pug">
v-container(v-touch='onSwipe')
  v-card.d-flex.soft-shadow(
    rounded
    :class="{'flex-column': $vuetify.breakpoint.smAndDown}"
  )
    v-tabs(
      v-model='tab'
      :vertical="$vuetify.breakpoint.mdAndUp"
      center-active
      :style='$vuetify.breakpoint.mdAndUp && `max-width: 200px`'
    )
      v-tab.justify-start(
        v-for='(route, i) in childRoutes'
        :key='i'
        :to='route.path'
        v-if='shouldShowRoute(route)'
      )
        v-icon(left) {{ route.meta.icon }}
        | {{ route.path | capitalize }}

    v-divider(vertical)

    router-view.flex-grow-1
        
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { currentUserIs } from "@/types/Users"

@Component({
	metaInfo: {
    title: "Settings",
  },
})
export default class Settings extends Vue {

  tab = 'me'
  onSwipe = {
    left: this.prevTab,
    right: this.nextTab,
  }
  nextTab() {
    let index = this.tabs.indexOf(this.tab) - 1
    if (index < 0) index = 0
    this.tab = this.tabs[index]
    this.$router.push({
      name: `settings/${this.tab}`
    })
  }
  prevTab() {
    let index = this.tabs.indexOf(this.tab) + 1
    if (index > this.tabs.length - 1) index = this.tabs.length - 1
    this.tab = this.tabs[index]
    this.$router.push({
      name: `settings/${this.tab}`
    })
  }

  get childRoutes() {
    return this.$router.options.routes?.find(route => route.name === 'settings')?.children
  }

  get tabs() {
    return this.childRoutes?.map(r => r.path) || []
  }

  shouldShowRoute(route: any) {
    if (!route.meta.restrict) return true
    return currentUserIs(...route.meta.restrict)
  }
}


</script>

<style lang="scss">
// Stupid left arrow won't go away even with hide-arrows prop
.v-slide-group__prev {
  display: none !important;
}
</style>