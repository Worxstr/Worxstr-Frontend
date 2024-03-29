<template lang="pug">
div

  transfer-funds-dialog(:opened.sync='transferFundsDialog' :action='transferFundsDialog')
  edit-payment-dialog(:opened.sync='createInvoiceDialog')
  generate-report-dialog(:opened.sync='generateReportDialog')

  //- Toolbar buttons
  portal(to="toolbarActions")

    v-btn(
      v-if='userIsManager'
      color="primary",
      text
      :icon='$vuetify.breakpoint.smAndDown'
      @click='openAddFundsDialog'
      :disabled='!iAmVerified'
      data-cy='add-funds-button'
    )
      v-icon(:left='!$vuetify.breakpoint.smAndDown') mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.smAndDown') Add funds
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.smAndDown'
      @click='openTransferToBankDialog'
      :disabled='!iAmVerified || balance.value == 0'
      data-cy='transfer-to-bank-button'
    )
      v-icon(:left='!$vuetify.breakpoint.smAndDown') mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.smAndDown') Transfer to bank

    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.smAndDown'
      @click='openInvoiceDialog'
      :disabled='!iAmVerified'
    )
      v-icon(:left='!$vuetify.breakpoint.smAndDown') mdi-receipt-text-plus
      span(v-if='!$vuetify.breakpoint.smAndDown') Create invoice

    v-btn(
      v-if='userIsManager'
      @click='openGenerateReportDialog'
      color='primary'
      text
      :icon='$vuetify.breakpoint.smAndDown'
      data-cy='transfer-to-bank-button'
    )
      v-icon(:left='!$vuetify.breakpoint.smAndDown') mdi-database-export-outline
      span(v-if='!$vuetify.breakpoint.smAndDown') Export data

  v-container.d-flex.flex-column.justify-center.gap-small
    //- Balance display
    div(v-if="loadingBalance && !balance.value")
      v-skeleton-loader.my-4(type="heading")

    .text-center.mt-3(v-else)
      .text-h6 Available balance
      .text-h2 {{ balance.value | currency }}

    .d-flex.flex-column.gap-small(v-if='pendingPayments.length')
      payments-list(
        :payments='pendingPayments'
        :editable='userIsManager'
        title='Pending payments'
        short-title='Pending'
        :loading='loadingPayments'
      )

      .d-flex.justify-center
        v-btn(
          text
          outlined
          color='primary'
          @click='loadMorePending'
          :loading='loadingMorePending'
        ) View more

    .d-flex.flex-column.gap-small(v-if='completedPayments.length')
      payments-list(
        :payments='completedPayments'
        title='Completed payments'
        short-title='Completed'
        :loading='loadingPayments'
      )

      .d-flex.justify-center
        v-btn(
          text
          outlined
          color='primary'
          @click='loadMoreCompleted'
          :loading='loadingMoreCompleted'
        ) View more

</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import PaymentsList from './PaymentsList.vue'
import TransferFundsDialog from './TransferFundsDialog.vue'
import EditPaymentDialog from './EditPaymentDialog.vue'
import GenerateReportDialog from './GenerateReportDialog.vue'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { loadBalance, loadPayments } from '@/services/payments'
import { showToast } from '@/services/app'
import { Payment } from '@/types/Payments'
import dayjs from 'dayjs'

const PAGE_SIZE = 10

@Component({
  metaInfo: {
    title: 'Payments',
  },
  components: {
    PaymentsList,
    TransferFundsDialog,
    EditPaymentDialog,
    GenerateReportDialog,
  }
})
export default class Payments extends Vue {
  loadingBalance = false
  loadingPayments = false
  loadingMorePending = false
  loadingMoreCompleted = false
  breaks = [{}]
  transferFundsDialog: string | null = null
  createInvoiceDialog = false
  generateReportDialog = false

  async mounted() {
    this.loadingPayments = true
    this.loadingBalance = true

    try {
      await this.loadPayments()
      await loadBalance(this.$store)
    }
    finally {
      this.loadingPayments = false
      this.loadingBalance = false
    }
  }

  async loadPayments() {
    await loadPayments(this.$store, 0, PAGE_SIZE, { pending: true })
    await loadPayments(this.$store, 0, PAGE_SIZE, { pending: false })
  }

  async loadMorePending() {
    this.loadingMorePending = true
    const lastPageLoaded = this.$store.state.payments.lastPageLoadedPending
    await loadPayments(this.$store, (lastPageLoaded + 1) ?? 0, PAGE_SIZE, {
      pending: true,
    })
    this.loadingMorePending = false
  }

  async loadMoreCompleted() {
    this.loadingMoreCompleted = true
    const lastPageLoaded = this.$store.state.payments.lastPageLoadedCompleted
    await loadPayments(this.$store, (lastPageLoaded + 1) ?? 0, PAGE_SIZE, {
      pending: false,
    })
    this.loadingMoreCompleted = false
  }

  get me() {
    return this.$store.getters.me
  }

  get balance() {
    return this.$store.state.payments.balance
  }

  get pendingPayments() {
    return this.$store.getters.payments
      .filter((p: Payment) => !p.date_completed)
      .sort((a: Payment, b: Payment) => dayjs(a.date_created).diff(dayjs(b.date_created)))
  }

  get completedPayments() {
    return this.$store.getters.payments
      .filter((p: Payment) => !!p.date_completed)
      .sort((a: Payment, b: Payment) => dayjs(a.date_created).diff(dayjs(b.date_created)))
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

  openGenerateReportDialog() {
    this.generateReportDialog = true
  }
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
