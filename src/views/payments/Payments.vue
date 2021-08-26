<template lang="pug">
div

  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(left) mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Withdraw funds
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
    )
      v-icon(left) mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank




  v-container.d-flex.flex-column.justify-center.text-center(
    fluid
  )
    div(v-if="loadingWallet")
      v-skeleton-loader.my-4(type="heading")

    .my-5(v-else)
      .text-h6 Available balance
      .text-h2 {{ payments.wallet.balance | currency }}




  v-container(
    fluid
    v-if="loadingPayments && !(timecards.length)"
  )
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

  div(v-else)
    v-container.d-flex.flex-column.justify-center(
      fluid
      fill-height,
      v-if="!timecards || !timecards.length"
    )
      v-icon.text-h2.ma-5 mdi-clock-check-outline
      p.text-body-1 No timecard approvals left!

    v-container.payments.pt-0(fluid v-else)
      //- edit-timecard-dialog(
      //-   :opened.sync="editTimecardDialog",
      //-   :timecard="selectedTimecardIds[0]"
      //- )
      deny-dialog(
        :opened.sync="denyDialog"
        :timecardIds="selectedTimecardIds"
      )
      payment-dialog(
        :opened.sync="paymentDialog",
        :timecardIds="selectedTimecardIds"
      )

      .mb-5(v-if="timecards.length")
        v-toolbar.no-padding(flat, color="transparent")
        
          v-checkbox.ml-6(
            hide-details
            @change='toggleAll'
            :indeterminate='partiallySelected'
            :value='selectedTimecardIds.length == timecards.length'
          )

          v-toolbar-title.px-4.text-h6
            span Pending payments
            v-chip.mx-3.pa-2.font-weight-bold(small) {{ timecards.length }}

          v-spacer

          v-btn(
            text,
            color="success",
            @click="openPaymentDialog()"
            :disabled='!hasSufficientBalance'
          )
            v-icon(:left='$vuetify.breakpoint.smAndUp') mdi-check-all
            span(v-if='$vuetify.breakpoint.smAndUp') Complete&nbsp;
              | {{ selectedTimecardIds.length != 0 && selectedTimecardIds.length != timecards.length ? selectedTimecardIds.length : 'all'}}

          v-btn(
            text,
            color="error",
            @click="openDenyDialog()"
          )
            v-icon(:left='$vuetify.breakpoint.smAndUp') mdi-close
            span(v-if='$vuetify.breakpoint.smAndUp') Deny&nbsp;
              | {{ selectedTimecardIds.length != 0 && selectedTimecardIds.length != timecards.length ? selectedTimecardIds.length : 'all'}}

        v-expansion-panels(accordion flat).soft-shadow
          v-expansion-panel(
            v-for="(timecard, i) in timecards",
            :key="timecard.id"
          )
            v-expansion-panel-header
              v-checkbox.mt-0.mb-1.mr-3(
                v-model='selectedTimecardIds'
                :value="timecard.id"
                hide-details
                style='flex: none'
              )
              
              span.py-1.font-weight-medium.flex-grow-0 {{ timecard | fullName }}
              
              v-spacer

              span.flex-grow-0.px-2(
                v-if="timecard.time_clocks && timecard.time_clocks.length"
              )
                | {{
                |   timeDiff(
                |     timecard.time_clocks[0].time,
                |     timecard.time_clocks[timecard.time_clocks.length - 1].time
                |   )
                | }}
              span.flex-grow-0.px-2.font-weight-bold {{ timecard.total_payment | currency }}

            v-expansion-panel-content
              v-card-text.text-body-1
                p(v-if="timecard.time_clocks && timecard.time_clocks.length")
                  | {{ timecard.time_clocks[0].time | time }}
                  | -
                  | {{
                  | timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | | time
                  | }}
                p {{ timecard.time_break }} minute break
                p {{ timecard.total_payment | currency }} earned

              v-card-actions
                v-spacer
                v-btn(text, @click="openEditTimecardDialog(timecard.id)") Edit
                v-btn(
                  text,
                  color="green",
                  @click="openPaymentDialog(timecard.id)"
                  :disabled='timecard.total_payment > payments.wallet.balance'
                )
                  v-icon(left) mdi-check
                  span Complete
                v-btn(text, color="red", @click="openDenyDialog(timecard.id)")
                  v-icon(left) mdi-close
                  span Deny

            v-divider(v-if='i != timecards.length - 1')
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

import EditTimecardDialog from './EditTimecardDialog'
import DenyDialog from './DenyDialog.vue'
import PaymentDialog from './PaymentDialog.vue'

export default {
  name: 'payments',
  metaInfo: {
    title: 'Payments',
  },
  components: {
    EditTimecardDialog,
    PaymentDialog,
    DenyDialog,
  },
  data: () => ({
    loadingPayments: false,
    loadingWallet: false,
    selectedTimecardIds: [],
    editTimecardDialog: false,
    approveDialog: false,
    denyDialog: false,
    paymentDialog: false,
    breaks: [{}],
  }),
  computed: {
    ...mapState(['authenticatedUser', 'payments']),
    ...mapGetters(['timecards']),
    partiallySelected() {
      return (
        this.selectedTimecardIds.length != 0 &&
        this.selectedTimecardIds.length != this.timecards.length
      )
    },
    hasSufficientBalance() {
      const total = this.timecards.reduce((total, current) => {
        return total + parseFloat(current.total_payment)
      }, 0)

      return Math.round(total * 100) / 100 <= this.payments.wallet.balance
    },
  },
  async mounted() {
    this.loadingWallet = true
    this.loadingPayments = true
    try {
      await this.$store.dispatch('loadWallet')
    } finally {
      this.loadingWallet = false
    }
    try {
      await this.$store.dispatch('loadPayments')
    } finally {
      this.loadingPayments = false
    }
  },
  methods: {
    ...mapActions(['signOut']),
    timeDiff(timeIn, timeOut) {
      timeIn = dayjs(timeIn)
      timeOut = dayjs(timeOut)

      return timeOut.from(timeIn, true)
    },
    toggleAll() {
      if (this.selectedTimecardIds.length != this.timecards.length) {
        this.selectAll()
      } else {
        this.deselectAll()
      }
    },
    selectAll() {
      this.selectedTimecardIds = this.timecards.map((timecard) => timecard.id)
    },
    deselectAll() {
      this.selectedTimecardIds = []
    },
    openEditTimecardDialog(timecardId) {
      this.selectedTimecardIds = [timecardId]
      this.editTimecardDialog = true
    },
    openDenyDialog(timecardId) {
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.denyDialog = true
    },
    openPaymentDialog(timecardId) {
      // this.selectTimecards()
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.paymentDialog = true
    },
  },
}
</script>

<style lang="scss">
.no-padding .v-toolbar__content {
  padding: 0 !important;
}
</style>
