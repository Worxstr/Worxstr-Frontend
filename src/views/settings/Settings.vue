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
      v-tab.justify-start(to='/settings/me')
        v-icon(left) mdi-account
        | Me

      v-tab.justify-start(to='/settings/payments')
        v-icon(left) mdi-cash-multiple
        | Payments

      v-tab.justify-start(to='/settings/security')
        v-icon(left) mdi-lock
        | Security

      v-tab.justify-start(to='/settings/preferences')
        v-icon(left) mdi-palette
        | Preferences

    v-divider(vertical)

    router-view.flex-grow-1
        
</template>

<script>
import { Vue, Component } from "vue-property-decorator"

@Component({
	metaInfo: {
    title: "Settings",
  },
})
export default class Settings extends Vue {
}
</script>

<style lang="scss">
// Stupid left arrow won't go away even with hide-arrows prop
.v-slide-group__prev {
  display: none !important;
}
</style>