<template lang="pug">
v-container.d-flex.flex-column.pt-6.gap-small

  //- edit-payment-dialog(
  //-   :opened.sync="editTimecardDialog",
  //-   :timecardId="selectedTimecardIds[0]"
  //-   @saved='clearSelection'
  //- )
  //- deny-dialog(
  //-   :opened.sync="denyDialog"
  //-   :timecardIds="selectedTimecardIds"
  //-   @denied='clearSelection'
  //- )
  //- complete-payment-dialog(
  //-   :opened.sync="paymentDialog",
  //-   :timecardIds="selectedTimecardIds"
  //-   @completed='clearSelection'
  //- )

  portal(to='toolbarActions')
    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='primary'
      data-cy='edit-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
      span(v-if='!$vuetify.breakpoint.xs') Edit

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='success'
      data-cy='edit-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-check
      span(v-if='!$vuetify.breakpoint.xs') Complete

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='error'
      data-cy='delete-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
      span(v-if='!$vuetify.breakpoint.xs') Deny
  
  div(v-if='payment')
    h3.text-h3(:class="isDebit ? 'green--text' : 'red--text'")
      | {{ isDebit ? '+' : '-' }}{{ payment.amount | currency }}
      
    h6.text-h6
      | {{ isDebit ? 'From' : 'To' }} &nbsp;

      router-link.alt-style(v-if='receiverIsUser' :to="{name: 'user', params: {userId: payment.receiver.id}}")
        | {{ payment.receiver | fullName }}

      span(v-else) payment.receiver.name
    
    .my-2
      v-chip.mr-3(
        v-if='payment.bank_transfer'
        small
        :color='`${statusColor("processed")} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`'
      )
        | {{ 'processed' | capitalize }}

      span.text-body-2(v-if='payment.date_completed')
        | {{ payment.date_completed | date('MMM D, YYYY') }}, {{ payment.date_completed | time }}


  masonry(:cols='{default: 2, 959: 1}' :gutter='30')

    .mb-4.d-flex.flex-column.gap-small(v-if='shift')
      h5.text-h5 Shift details
      v-sheet(outlined rounded)
        v-card-text.pb-1
          .d-flex.flex-column


            h6.text-body-1
              router-link.alt-style(
                :to="{name: 'shift', params: { shiftId: shift.id }}"
              ) {{ shift.site_location }}
              | &nbsp; - &nbsp;
              router-link.alt-style(
                :to="{name: 'job', params: { jobId: shift.job_id }}"
              ) {{ shift.job_id }}

            .text-body-2 {{ shift.time_begin | time }} - {{ shift.time_end | time }}
            .text-body-2 {{ shift.time_begin | date('MMM D, YYYY') }} - {{ shift.time_end | date('MMM D, YYYY') }}

        v-card-actions
          v-spacer
          v-btn(
            text
            color='primary'
            :to="{name: 'shift', params: {shiftId: shift.id}}"
            exact
          ) View shift
          v-btn(
            text
            color='primary'
            :to="{name: 'job', params: {jobId: shift.job_id}}"
            exact
          ) View job

        v-divider

        v-card-text.d-flex
          .d-flex.flex-column
            h6.text-body-1 Worked for {{ clockedTime | duration }}
            span {{ breakTime | duration }} break

          v-spacer

          .text-subtitle-1.mt-2.green--text(v-if='payment && payment.invoice && payment.invoice.timecard')
            | {{ payment.invoice.timecard.total_payment | currency }}          
        
        v-divider

        clock-events(:events='history')

    .mb-4.d-flex.flex-column.gap-small(v-if='payment && payment.invoice')
      h5.text-h5 Invoice
      v-sheet(outlined rounded)
        v-list
          v-list-item(v-if='shift && payment && payment.invoice && payment.invoice.timecard')
            v-list-item-content.primary--text.font-weight-bold.d-flex
              router-link.alt-style(:to="{name: 'shift', params: {shiftId: shift.id}}")
                | Payment for {{ shift.site_location }}
            v-list-item-action.text-subtitle-1 {{ payment.invoice.timecard.total_payment | currency }}

          v-list-item(v-for='item in payment.invoice.items')
            v-list-item-content
              v-list-item-title(:class="{'primary--text': item.bold, 'font-weight-medium': item.bold}") {{ item.description }}
            
            v-list-item-action
              .text-subtitle-1 {{ item.amount | currency }}
          
          v-divider

          v-list-item
            v-list-item-content
              v-list-item-title Subtotal
            
            v-list-item-action
              .text-subtitle-1 {{ payment.amount | currency }}

          v-list-item
            v-list-item-content
              v-list-item-title Fee payment
            
            v-list-item-action
              .text-subtitle-1 {{ payment.fee | currency }}

          v-list-item
            v-list-item-content
              v-list-item-title.font-weight-bold Total
            
            v-list-item-action
              .text-subtitle-1.font-weight-black.green--text {{ payment.total | currency }}

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ClockEvents from '@/components/ClockEvents.vue'
import { loadPayment } from '@/services/payments'
import { loadShift } from '@/services/shifts'
import { loadJob } from '@/services/jobs'
import { isDebit, isUser } from '@/types/Payments'
import { clockedTime, breakTime, ClockEvent } from '@/types/Jobs'

@Component({
  metaInfo: {
    title: 'Payment',
  },
  components: {
    ClockEvents
  }
})
export default class Payment extends Vue {

  loading = false

  async mounted() {
    this.loading = true
    const payment = await loadPayment(this.$store, this.$route.params.paymentId)
    this.loading = false
    
    if (payment?.invoice) {
      const shift = await loadShift(this.$store, payment.invoice.shift_id)
      const job = await loadJob(this.$store, shift.job_id)
    }
  }

  get payment() {
    return this.$store.getters.payment(this.$route.params.paymentId)
  }

  get shift() {
    if (!this.payment?.invoice?.timecard) return null
    return this.$store.getters.shift(this.payment.invoice.timecard.shift_id)
  }

  get clockedTime() {
    if (!this.shift) return null
    return clockedTime(this.shift)
  }
  
  get breakTime() {
    if (!this.shift) return null
    return breakTime(this.shift)
  }

  get isDebit() {
    return isDebit(this.payment)
  }

  get receiverIsUser() {
    return isUser(this.payment.receiver)
  }

  get history() {
    if (!this.shift || !this.shift.clock_history) return []
    return this.shift.clock_history.sort((a: ClockEvent, b: ClockEvent) => {
      return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
    })
  }

  shiftPayment = {
    amount: 102,
    description: 'Front of store',
    bold: true
  }

  // TODO: Duplicated in TransferHistory.vue
  // TODO: DRY
  statusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'amber'
      case 'processed':
        return 'green'
      case 'cancelled':
        return 'deep-orange'
      case 'failed':
        return 'red'
      default:
        return 'primary'
    }
  }
}
</script>