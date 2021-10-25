<template lang="pug">
v-list
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
      v-tooltip(bottom)
        span Copy to clipboard
        template(v-slot:activator='{ on, attrs }')
          v-btn(
            icon
            color='primary'
            v-bind='attrs'
            v-on='on'
            @click='copyText(me.manager_info.reference_number)'
          )
            v-icon mdi-content-copy
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import Roles from "@/components/Roles.vue"
import { Clipboard } from '@capacitor/clipboard'
import { signOut } from "@/services/auth"
import { showToast } from '@/services/app'
import { currentUserIs, UserRole } from "@/types/Users"

@Component({
  components: {
    Roles,
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

  async copyText(text: string) {
    try {
      await Clipboard.write({
        string: text
      })
      showToast(this.$store, {
        text: "Copied."
      })
    }
    catch (e) {
      showToast(this.$store, {
        text: "Couldn't copy to clipboard."
      })
    }
  }
}
</script>