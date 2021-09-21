<template lang="pug">
v-list
  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Name
      v-list-item-title {{ authenticatedUser | fullName }}
    v-list-item-action
      v-btn(text, color="primary", @click="signOut") Sign out

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Organization
      v-list-item-title {{ authenticatedUser.organization_info.name }}

  v-list-item(two-line, v-if="authenticatedUser.contractor_info")
    v-list-item-content
      v-list-item-subtitle.mb-2 Address
      v-list-item-title {{ authenticatedUser.contractor_info.address }}

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Roles
      v-list-item-title
        roles(:roles="authenticatedUser.roles")

  v-list-item(two-line, v-if="authenticatedUser.contractor_info")
    v-list-item-content
      v-list-item-subtitle.mb-2 Hourly wage
      v-list-item-title
        span(v-if="authenticatedUser.contractor_info.hourly_rate") {{ authenticatedUser.contractor_info.hourly_rate | currency }}
        span(v-else) Not set

  v-list-item(two-line, v-if="authenticatedUser.manager_info")
    v-list-item-content
      v-list-item-subtitle.mb-2 Manager reference number
      v-list-item-title {{ authenticatedUser.manager_info.reference_number }}
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import Roles from "@/components/Roles.vue"

@Component({
  components: {
    Roles,
  },
  metaInfo: {
    title: 'Settings - Me'
  }
})
export default class Me extends Vue {
  get authenticatedUser() {
    return this.$store.state.authenticatedUser
  }

  signOut() {
    this.$store.dispatch("signOut")
  }
}
</script>