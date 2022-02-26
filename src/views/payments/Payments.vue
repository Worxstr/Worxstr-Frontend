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
      span(v-if='!$vuetify.breakpoint.xs') Add funds
    
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
  
    v-menu(offset-y)
      template(v-slot:activator='{ on, attrs }')
        v-btn(
          v-if='userIsManager'
          color='primary'
          text
          :icon='$vuetify.breakpoint.xs'
          data-cy='transfer-to-bank-button'
          v-on='on'
          v-bind='attrs'
        )
          v-icon(:left='!$vuetify.breakpoint.xs') mdi-database-export-outline
          span(v-if='!$vuetify.breakpoint.xs') Export data
      v-list
        v-subheader Export data as:
        v-list-item(
          two-line
          v-for='(format, i) in exportFormats'
          :key='i'
          @click="exportPayments(format.name)"
          :disabled='format.disabled'
        )
          v-list-item-icon.mr-3.mb-0.pt-1
            v-icon {{ format.icon }}

          v-list-item-content
            v-list-item-title .{{format.name}}
            v-list-item-subtitle {{format.description}}


  v-container.d-flex.flex-column.justify-center.gap-small
    //- Balance display
    div(v-if="loadingBalance && !balance.value")
      v-skeleton-loader.my-4(type="heading")

    .text-center(v-else)
      .text-h6 Available balance
      .text-h2 {{ balance.value | currency }}

    payments-list(
      v-if='pendingPayments.length'
      :payments='pendingPayments'
      :editable='userIsManager'
      title='Pending payments'
      :loading='loadingPayments'
    )

    payments-list(
      v-if='completedPayments.length'
      :payments='completedPayments'
      title='Completed payments'
      :loading='loadingPayments'
    )

    .d-flex.justify-center
      v-btn(
        text
        outlined
        color='primary'
        @click='loadMore'
        :loading='loadingMore'
      ) View more

</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import PaymentsList from '@/views/payments/PaymentsList.vue'
import TransferHistory from '@/components/TransferHistory.vue'
import TransferFundsDialog from './TransferFundsDialog.vue'
import CreateInvoiceDialog from './CreateInvoiceDialog.vue'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { loadBalance, loadPayments, exportPayments } from '@/services/payments'
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
  loadingMore = false
  loadingBalance = false
  breaks = [{}]
  transferFundsDialog: string | null = null
  createInvoiceDialog = false

  exportFormats: any = [
    {
      name: 'csv',
      icon: 'mdi-file-delimited-outline',
      description: 'Comma-separated values',
      disabled: false
    },
    {
      name: 'json',
      icon: 'mdi-code-json',
      description: 'Javascript object notation',
      disabled: false
    },
    {
      name: 'xlsx',
      icon: 'mdi-microsoft-office',
      description: 'Excel spreadsheet',
      disabled: true
    },
    {
      name: 'pdf',
      icon: 'mdi-file-pdf-box',
      description: 'Adobe PDF',
      disabled: true
    },
  ]

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
    await loadPayments(this.$store)
  }

  async loadMore() {
    this.loadingMore = true
    const lastPageLoaded = this.$store.state.payments.lastPageLoaded
    await loadPayments(this.$store, (lastPageLoaded + 1) ?? 0)
    this.loadingMore = false
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

  async exportPayments(format: 'csv' | 'json' | 'xlsx' | 'pdf') {
    await exportPayments(format)
  }
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
