<template lang="pug">
v-list

  v-subheader.text-subtitle-1 My profile

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Name
      v-list-item-title {{ me | fullName }}
    v-list-item-action
      v-btn(text, color="primary", @click="signOut") Sign out

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Email
      v-list-item-title {{ me.email }}

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Organization
      v-list-item-title {{ me.organization_info.name }}
    v-list-item-action(v-if='userIsOrganizationManager')
      v-btn(text, color="primary", :to="{name: 'settings/organization'}") Go to settings

  v-list-item(two-line, v-if="me.contractor_info && me.contractor_info.address")
    v-list-item-content
      v-list-item-subtitle.mb-2 Address
      v-list-item-title {{ me.contractor_info.address }}

  v-list-item(two-line)
    v-list-item-content
      v-list-item-subtitle.mb-2 Roles
      v-list-item-title
        roles(:roles="me.roles")

  v-list-item(two-line, v-if="me.contractor_info")
    v-list-item-content
      v-list-item-subtitle.mb-2 Hourly wage
      v-list-item-title
        span(v-if="me.contractor_info.hourly_rate") {{ me.contractor_info.hourly_rate | currency }}
        span(v-else) Not set

  v-list-item(two-line, v-if="me.manager_info")
    v-list-item-content
      v-list-item-subtitle.mb-2 Manager reference number
      v-list-item-title {{ me.manager_info.reference_number }}

    v-list-item-action
      clipboard-copy(:text='me.manager_info.reference_number')

</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import Roles from "@/components/Roles.vue"
import { signOut } from "@/services/auth"
import { currentUserIs, UserRole } from "@/types/Users"
import ClipboardCopy from '@/components/ClipboardCopy.vue'

@Component({
  components: {
    Roles,
    ClipboardCopy
  },
  metaInfo: {
    title: 'Settings - Me'
  }
})
export default class Me extends Vue {
  get me() {
    return this.$store.getters.me
  }

  get userIsOrganizationManager() {
    return currentUserIs(UserRole.OrganizationManager)
  }

  signOut() {
    signOut(this.$store)
  }

}
</script>