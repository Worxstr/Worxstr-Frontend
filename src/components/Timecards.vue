<template lang="pug">
  div(v-if="loadingTimecards && !(timecards.length)")
    v-skeleton-loader.my-4(type="heading")
    v-skeleton-loader(
      type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
    )

  .d-flex.flex-column.justify-center(v-else)
    .payments.pt-0(v-if='timecards && timecards.length')

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
          :icon='$vuetify.breakpoint.xs'
        )
          v-icon(:left='!$vuetify.breakpoint.xs') mdi-check-all
          span(v-if='!$vuetify.breakpoint.xs') Complete&nbsp;
            | {{ selectedTimecardIds.length != 0 && selectedTimecardIds.length != timecards.length ? selectedTimecardIds.length : 'all'}}

        v-btn(
          text,
          color="error",
          @click="openDenyDialog()"
          :icon='$vuetify.breakpoint.xs'
        )
          v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
          span(v-if='!$vuetify.breakpoint.xs') Deny&nbsp;
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
            //- .text-body-1
            v-card-text.d-flex(v-if="timecard.time_clocks && timecard.time_clocks.length")
              .flex-grow-1
                p {{ timecard.time_clocks[0].time | date }}
                p
                  | {{ timecard.time_clocks[0].time | time }}
                  | -
                  | {{
                  | timecard.time_clocks[timecard.time_clocks.length - 1].time
                  | | time
                  | }}
              .flex-grow-1
                p {{ parseFloat(timecard.time_break) }} minute break

              .flex-grow-1
                p {{ timecard.wage_payment | currency }} earned
                p {{ timecard.fees_payment | currency }} fee


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
import { Component, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import EditTimecardDialog from '@/views/payments/EditTimecardDialog.vue'
import DenyDialog from '@/views/payments/DenyDialog.vue'
import PaymentDialog from '@/views/payments/PaymentDialog.vue'

import { Timecard } from '@/definitions/Payments'

dayjs.extend(relativeTime)

@Component({
  components: {
    EditTimecardDialog,
    PaymentDialog,
    DenyDialog,
  },
})
export default class Timecards extends Vue {
  
    loadingTimecards = false
    selectedTimecardIds: number[] = []
    editTimecardDialog = false
    approveDialog = false
    denyDialog = false
    paymentDialog = false
    
    async mounted() {
      this.loadingTimecards = true
      try {
        await this.$store.dispatch('loadTimecards')
      } finally {
        this.loadingTimecards = false
      }
    }

    @Watch('paymentDialog')
    @Watch('approveDialog')
    @Watch('denyDialog')
    dialogClosed(_oldVal: boolean, newVal: boolean) {
      if (newVal) this.selectedTimecardIds = []
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
        return total + (timecard ? parseFloat(timecard.total_payment) : 0)
      }, 0)

      return Math.round(totalPayment * 100) / 100 <= parseFloat(this.payments.balance.value)
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