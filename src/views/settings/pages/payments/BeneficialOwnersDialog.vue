<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-toolbar(flat dense)
      v-spacer
      v-btn(icon @click='closeDialog')
        v-icon mdi-close

    v-card-text
      dwolla-beneficial-owners(:customerId='customerId(authenticatedUser.dwolla_customer_url)')

    v-spacer
    
</template>

<script lang="ts">
import { dwollaCustomerIdFromUrl } from '@/util/dwolla'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class BeneficialOwnersDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  
  closeDialog() {
    this.$emit('update:opened', false)
  }

  get authenticatedUser() {
    return this.$store.state.users.authenticatedUser
  }

  customerId(customerUrl: string) {
    return dwollaCustomerIdFromUrl(customerUrl)
  }
}
</script>
