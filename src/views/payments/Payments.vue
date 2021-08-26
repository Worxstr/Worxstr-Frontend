<template lang="pug">
div

  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click="openCreateJobDialog",
    )
      v-icon(left) mdi-cash-plus
      span(v-if='!$vuetify.breakpoint.xs') Withdraw funds
    
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click="openCreateJobDialog",
    )
      v-icon(left) mdi-bank-transfer-in
      span(v-if='!$vuetify.breakpoint.xs') Transfer to bank

  v-container.d-flex.flex-column.justify-center.text-center(
    fluid
  )
    div(v-if="loadingWallet")
      v-skeleton-loader.my-4(type="heading")

    div(v-else)
      .text-h6 Available balance
      .text-h2.ma-5 {{ payments.wallet.balance | currency }}

  v-container(
    fluid
    v-if="loadingPayments && !(approvedTimecards.length || unapprovedTimecards.length)"
  )
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

    v-skeleton-loader.mt-8.mb-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )
  div(v-else)
    v-container.d-flex.flex-column.justify-center(
      fluid
      fill-height,
      v-if="!approvedTimecards.length && !unapprovedTimecards.length"
    )
      v-icon.text-h2.ma-5 mdi-clock-check-outline
      p.text-body-1 No timecard approvals left!

    v-container.payments.pt-0(fluid v-else)
      edit-timecard-dialog(
        :opened.sync="editTimecardDialog",
        :timecard="selectedTimecards[0]"
      )
      approve-dialog(
        :opened.sync="approveDialog",
        :timecards="selectedTimecards"
      )
      deny-dialog(:opened.sync="denyDialog", :timecard="selectedTimecards[0]")
      payment-dialog(
        :opened.sync="paymentDialog",
        :timecards="selectedTimecards"
      )

      .mb-5(v-if="approvedTimecards.length")
        v-toolbar.no-padding(flat, color="transparent")
          v-toolbar-title.px-4.text-h6
            span Pending
            v-chip.mx-3.pa-2.font-weight-bold(small) {{ approvedTimecards.length }}
          v-spacer
          v-btn(text, @click="openPaymentDialog(approvedTimecards)")
            v-icon(left) mdi-bank-check
            span Complete payments

        v-expansion-panels(accordion flat).soft-shadow
          v-expansion-panel(
            v-for="timecard in approvedTimecards",
            :key="timecard.id"
          )
            v-expansion-panel-header.d-flex
              span.py-1.font-weight-medium.flex-grow-0
                | {{ timecard | fullName }}
              v-spacer
              span.flex-grow-0.px-2.font-weight-bold {{ timecard.total_payment | currency }}
              span.flex-grow-0.px-2(
                v-if="timecard.time_clocks && timecard.time_clocks.length"
              )
                | {{ timecard.time_clocks[0].time | time }}
                | -
                | {{ timecard.time_clocks[timecard.time_clocks.length - 1].time | time }}

            v-expansion-panel-content
              v-card-text.text-body-1
                p(v-if="timecard.time_clocks && timecard.time_clocks.length")
                  | Worked for
                  | {{
                  | timeDiff(
                  | timecard.time_clocks[0].time,
                  | timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | )
                  | }}
                p {{ timecard.time_break }} minute break
                p {{ timecard.total_payment | currency }} earned
            v-divider

      .mb-5(v-if="unapprovedTimecards.length")
        v-toolbar.no-padding(flat, color="transparent")
          v-toolbar-title.px-4.text-h6
            span Unapproved
            v-chip.mx-3.pa-2.font-weight-bold(small) {{ unapprovedTimecards.length }}

          v-spacer
          v-btn(
            text,
            color="green",
            @click="openApproveDialog(unapprovedTimecards)"
          )
            v-icon(left) mdi-check-all
            span Approve all

        v-expansion-panels(accordion flat).soft-shadow
          v-expansion-panel(
            v-for="timecard in unapprovedTimecards",
            :key="timecard.id"
          )
            v-expansion-panel-header
              span.py-1.font-weight-medium.flex-grow-0 {{ timecard | fullName }}
              v-spacer
              span.flex-grow-0.px-2.font-weight-bold {{ timecard.total_payment | currency }}
              span.flex-grow-0.px-2(
                v-if="timecard.time_clocks && timecard.time_clocks.length"
              )
                | {{ timecard.time_clocks[0].time | time }}
                | -
                | {{
                | timecard.time_clocks[timecard.time_clocks.length - 1].time
                | | time
                | }}

            v-expansion-panel-content
              v-card-text.text-body-1
                p(v-if="timecard.time_clocks && timecard.time_clocks.length")
                  | Worked for
                  | {{
                  | timeDiff(
                  | timecard.time_clocks[0].time,
                  | timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | )
                  | }}
                p {{ timecard.time_break }} minute break
                p {{ timecard.total_payment | currency }} earned

              v-card-actions
                v-spacer
                v-btn(text, @click="openEditTimecardDialog(timecard)") Edit
                v-btn(
                  text,
                  color="green",
                  @click="openApproveDialog([timecard])"
                )
                  v-icon(left) mdi-check
                  span Approve
                v-btn(text, color="red", @click="openDenyDialog(timecard)")
                  v-icon(left) mdi-close
                  span Deny
            v-divider
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import EditTimecardDialog from './EditTimecardDialog'
import ApproveDialog from './ApproveDialog'
import DenyDialog from './DenyDialog.vue'
import PaymentDialog from './PaymentDialog.vue'

dayjs.extend(duration)

export default {
  name: 'payments',
  metaInfo: {
    title: 'Payments',
  },
  components: {
    EditTimecardDialog,
    ApproveDialog,
    PaymentDialog,
    DenyDialog,
  },
  data: () => ({
    loadingPayments: false,
    loadingWallet: false,
    selectedTimecards: [],
    editTimecardDialog: false,
    approveDialog: false,
    denyDialog: false,
    paymentDialog: false,
    breaks: [{}],
  }),
  computed: {
    ...mapState(['authenticatedUser', 'payments']),
    ...mapGetters(['approvedTimecards', 'unapprovedTimecards']),
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

      const duration = dayjs.duration(timeOut.diff(timeIn)),
        hours = duration.format('H'),
        minutes = duration.format('m')

      return `${hours} hour${hours == 1 ? '' : 's'}, ${minutes} minute${
        minutes == 1 ? '' : 's'
      }`
    },
    openEditTimecardDialog(timecard) {
      this.selectedTimecards = [timecard]
      this.editTimecardDialog = true
    },
    openApproveDialog(timecards) {
      this.selectedTimecards = timecards
      this.approveDialog = true
    },
    openDenyDialog(timecard) {
      this.selectedTimecards = [timecard]
      this.denyDialog = true
    },
    openPaymentDialog(timecards) {
      this.selectedTimecards = timecards
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
