<template lang="pug">
v-container.pb-16
  v-card.d-flex(
    rounded
    :class="{'flex-column': $vuetify.breakpoint.smAndDown}"
  )
    v-tabs.py-2(
      :vertical="$vuetify.breakpoint.mdAndUp"
      center-active
      :style='$vuetify.breakpoint.mdAndUp && `max-width: 200px`'
    )
      v-tab.justify-start(
        v-for='route in childRoutes'
        :to='route.path'
        :key='route.path'
        v-if='shouldShowRoute(route)'
      )
        v-icon(left) {{ route.meta.icon }}
        | {{ route.path | capitalize }}

    v-divider(vertical)

    router-view.flex-grow-1
        
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { currentUserIs } from "@/definitions/User"

@Component({
	metaInfo: {
    title: "Settings",
  },
})
export default class Settings extends Vue {

  get childRoutes() {
    return this.$router.options.routes?.find(route => route.name === 'settings')?.children
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