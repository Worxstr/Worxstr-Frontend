<template lang="pug">
div

  transfer-funds-dialog(:opened.sync='transferFundsDialog' :action='transferFundsDialog')

  //- Toolbar buttons
  portal(to="toolbarActions")
    v-btn(
      v-if='userIsManager'
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click='openAddFundsDialog'
      :disabled='!iAmVerified'
      data-cy='add-funds-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Add funds to wallet
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click='openTransferToBankDialog'
      :disabled='!iAmVerified || payments.balance.value == 0'
      data-cy='transfer-to-bank-button'
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

    timecards.mb-5(v-if='userIsManager')

    transfer-history

</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import Timecards from '@/components/Timecards.vue'
import TransferHistory from '@/components/TransferHistory.vue'
import TransferFundsDialog from './TransferFundsDialog.vue'
import { currentUserIs, Managers } from '@/types/Users'
import { loadBalance } from '@/services/payments'
import { showToast } from '@/services/app'

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
      await loadBalance(this.$store)
    } finally {
      this.loadingBalance = false
    }
  }

  get me() {
    return this.$store.getters.me
  }

  get payments() {
    return this.$store.state.payments
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

  userHasFundingSource() {
    if (this.$store.getters.fundingSources.length === 0) {
      showToast(this.$store, {
        text: "You haven't added any funding sources.",
        action: {
          text: 'Add funding source',
          action: () => this.$router.push({
            name: 'settings/payments',
            params: {
              addFundingSource: 'true'
            }
          })
        }
      })
      return false
    }
    return true
  }
  
  openAddFundsDialog() {
    if (this.userHasFundingSource())
      this.transferFundsDialog = 'add'
  }

  openTransferToBankDialog() {
    if (this.userHasFundingSource())
      this.transferFundsDialog = 'remove'
  }
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
