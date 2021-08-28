<template lang="pug">
  div(v-if="loadingPayments && !(timecards.length)")
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

  .d-flex.flex-column.justify-center(v-else)
    div(
      v-if="!timecards || !timecards.length"
    )
      v-icon.text-h2.ma-5 mdi-clock-check-outline
      p.text-body-1 No timecard approvals left!

    .payments.pt-0(v-else)

      edit-timecard-dialog(
        :opened.sync="editTimecardDialog",
        :timecardId="selectedTimecardIds[0]"
      )
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
            :disabled='!hasSufficientBalance()'
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
            v-expansion-panel-header.py-3
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
                  :disabled='!hasSufficientBalance(timecard.id)'
                )
                  v-icon(left) mdi-check
                  span Complete
                v-btn(text, color="red", @click="openDenyDialog(timecard.id)")
                  v-icon(left) mdi-close
                  span Deny

            v-divider(v-if='i != timecards.length - 1')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import EditTimecardDialog from '@/views/payments/EditTimecardDialog.vue'
import DenyDialog from '@/views/payments/DenyDialog.vue'
import PaymentDialog from '@/views/payments/PaymentDialog.vue'

import { Timecard } from '@/definitions/Clock'

dayjs.extend(relativeTime)

@Component({
  components: {
    EditTimecardDialog,
    PaymentDialog,
    DenyDialog,
  },
})
export default class Timecards extends Vue {
  
    loadingPayments = false
    selectedTimecardIds: number[] = []
    editTimecardDialog = false
    approveDialog = false
    denyDialog = false
    paymentDialog = false

    
    async mounted() {
      this.loadingPayments = true
      try {
        await this.$store.dispatch('loadTimecards')
      } finally {
        this.loadingPayments = false
      }
    }

    get payments() {
      return this.$store.state.payments
    }

    get timecards() {
      return this.$store.getters.timecards
    }

    get partiallySelected() {
      return (
        this.selectedTimecardIds.length != 0 &&
        this.selectedTimecardIds.length != this.timecards.length
      )
    }

    hasSufficientBalance(timecardId: number) {

      let timecardIds = []

      if (timecardId) timecardIds = [timecardId]   
      else if (!this.selectedTimecardIds.length) timecardIds = this.timecards.map((t: Timecard) => t.id)
      else timecardIds = this.selectedTimecardIds

      const timecards = this.$store.getters.timecardsByIds(timecardIds)

      const totalPayment = timecards.reduce((total: number, timecard: Timecard) => {
        return total + parseFloat(timecard.total_payment)
      }, 0)

      return Math.round(totalPayment * 100) / 100 <= this.payments.wallet.balance
    }

    timeDiff(timeIn: string, timeOut: string) {
      const _in = dayjs(timeIn)
      const _out = dayjs(timeOut)

      return _out.from(_in, true)
    }

    toggleAll() {
      if (this.selectedTimecardIds.length != this.timecards.length) {
        this.selectAll()
      } else {
        this.deselectAll()
      }
    }

    selectAll() {
      this.selectedTimecardIds = this.timecards.map((t: Timecard) => t.id)
    }

    deselectAll() {
      this.selectedTimecardIds = []
    }

    openEditTimecardDialog(timecardId: number) {
      this.selectedTimecardIds = [timecardId]
      this.editTimecardDialog = true
    }

    openDenyDialog(timecardId: number) {
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.denyDialog = true
    }

    openPaymentDialog(timecardId: number) {
      // this.selectTimecards()
      if (timecardId) this.selectedTimecardIds = [timecardId]
      else if (!this.selectedTimecardIds.length) this.selectAll()
      this.paymentDialog = true
    }
}
</script>