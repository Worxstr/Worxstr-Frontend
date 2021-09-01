<template lang="pug">
div

  transfer-funds-dialog(:opened.sync='transferFundsDialog' :action='transferFundsDialog')

  //- Toolbar buttons
  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click='openAddFundsDialog'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Add funds to wallet
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click='openTransferToBankDialog'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank


  v-container.d-flex.flex-column.justify-center
  
    //- Balance display
    div(v-if="loadingBalance && !payments.balance.value")
      v-skeleton-loader.my-4(type="heading")

    .text-center.my-5(v-else)
      .text-h6 Available balance
      .text-h2 {{ payments.balance.value | currency }}


    timecards.mb-5(v-if='userIs(1)')

    transfer-history

</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import Timecards from '@/components/Timecards.vue'
import TransferHistory from '@/components/TransferHistory.vue'
import TransferFundsDialog from './TransferFundsDialog.vue'
import { userIs, UserRole } from '@/definitions/User'

@Component({
  metaInfo: {
    title: 'Payments',
  },
  components: {
    Timecards,
    TransferHistory,
    TransferFundsDialog,
  }
})
export default class Payments extends Vue {
  loadingBalance = false
  breaks = [{}]
  transferFundsDialog: string | null = null

  async mounted() {
    this.loadingBalance = true
    try {
      await this.$store.dispatch('loadBalance')
    } finally {
      this.loadingBalance = false
    }
  }

  get authenticatedUser() {
    return this.$store.state.authenticatedUser
  }

  get payments() {
    return this.$store.state.payments
  }
  
  openAddFundsDialog() {
    this.transferFundsDialog = 'add'
  }

  openTransferToBankDialog() {
    this.transferFundsDialog = 'remove'
  }

  userIs(role: UserRole) {
    return userIs(role, this.authenticatedUser)
  }
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
