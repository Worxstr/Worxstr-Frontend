<template lang="pug">
div

  transfer-funds-dialog(:opened.sync='transferFundsDialog' :action='transferFundsDialog')
  create-invoice-dialog(:opened.sync='createInvoiceDialog')

  //- Toolbar buttons
  portal(to="toolbarActions")

    v-btn(
      v-if='userIsContractor'
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click='openInvoiceDialog'
      :disabled='!iAmVerified'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-receipt
      span(v-if='!$vuetify.breakpoint.xs') Create invoice

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
      :disabled='!iAmVerified || balance.value == 0'
      data-cy='transfer-to-bank-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank


  v-container.d-flex.flex-column.justify-center
    //- Balance display
    div(v-if="loadingBalance && !balance.value")
      v-skeleton-loader.my-4(type="heading")

    .text-center.my-5(v-else)
      .text-h6 Available balance
      .text-h2 {{ balance.value | currency }}

    payments-list.mb-5(
      :payments='pendingPayments'
      :editable='true'
      title='Pending payments'
      :loading='loadingPayments'
    )

    payments-list.mb-5(
      :payments='completedPayments'
      title='Completed payments'
      :loading='loadingPayments'
    )

</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import PaymentsList from '@/views/payments/PaymentsList.vue'
import TransferHistory from '@/components/TransferHistory.vue'
import TransferFundsDialog from './TransferFundsDialog.vue'
import CreateInvoiceDialog from './CreateInvoiceDialog.vue'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { loadBalance, loadPayments } from '@/services/payments'
import { showToast } from '@/services/app'
import { Payment } from '@/types/Payments'

@Component({
  metaInfo: {
    title: 'Payments',
  },
  components: {
    PaymentsList,
    TransferHistory,
    TransferFundsDialog,
    CreateInvoiceDialog,
  }
})
export default class Payments extends Vue {
  loadingPayments = false
  loadingBalance = false
  breaks = [{}]
  transferFundsDialog: string | null = null
  createInvoiceDialog = false

  async mounted() {
    this.loadingPayments = true
    this.loadingBalance = true

    try {
      await loadPayments(this.$store)
      await loadBalance(this.$store)
    }
    finally {
      this.loadingPayments = false
      this.loadingBalance = false
    }
  }

  get me() {
    return this.$store.getters.me
  }

  get balance() {
    return this.$store.state.payments.balance
  }

  get pendingPayments() {
    return this.$store.getters.payments.filter((p: Payment) => !p.date_completed)
  }

  get completedPayments() {
    return this.$store.getters.payments.filter((p: Payment) => !!p.date_completed)
  }

  get userIsContractor() {
    return currentUserIs(UserRole.Contractor)
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

  openInvoiceDialog() {
    this.createInvoiceDialog = true
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
