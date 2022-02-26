<template lang="pug">
v-container.d-flex.flex-column.pt-6.gap-small

  edit-payment-dialog(
    :opened.sync='editPaymentDialog'
    :paymentId='parseInt($route.params.paymentId)'
  )
  deny-payments-dialog(
    :opened.sync='denyPaymentsDialog'
    :paymentIds="[parseInt($route.params.paymentId)]"
    @denied='goBack'
  )
  complete-payments-dialog(
    :opened.sync='completePaymentsDialog'
    :paymentIds='[parseInt($route.params.paymentId)]'
    @completed='goBack'
  )

  portal(to='toolbarActions' v-if='payment && !payment.date_completed && userIsManager')
    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='primary'
      @click='editPaymentDialog = true'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
      span(v-if='!$vuetify.breakpoint.xs') Edit

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='success'
      @click='completePaymentsDialog = true'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-check
      span(v-if='!$vuetify.breakpoint.xs') Complete

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='error'
      @click='denyPaymentsDialog = true'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
      span(v-if='!$vuetify.breakpoint.xs') Deny
  
  div(v-if='payment')
    h3.text-h3(:class="{'green--text': isDebit}")
      | {{ isDebit ? '+' : '-' }}{{ payment.amount | currency }}
      
    h6.text-h6
      | {{ isDebit ? 'From' : 'To' }} &nbsp;

      router-link.alt-style(v-if='receiverIsUser' :to="{name: 'user', params: {userId: payment.receiver.id}}")
        | {{ (isDebit ? payment.sender : payment.receiver) | userOrOrgName }}

      span(v-else) {{ (isDebit ? payment.sender : payment.receiver) | userOrOrgName }}
    
    .my-2.d-flex.align-center
      v-chip.mr-3(
        v-if='payment.bank_transfer'
        small
        :color='`${statusColor(payment.bank_transfer.status)} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`'
      )
        | {{ payment.bank_transfer.status | capitalize }}

      .d-flex.flex-column.text-caption
        span
          | Created {{ payment.date_created | date('MMM D, YYYY') }}, {{ payment.date_created | time }}

        span(v-if='payment.date_completed')
          | Completed {{ payment.date_completed | date('MMM D, YYYY') }}, {{ payment.date_completed | time }}


  masonry(:cols='{default: 2, 959: 1}' :gutter='20')

    .mb-4.d-flex.flex-column.gap-small(v-if='payment && payment.invoice')
      h5.text-h5 Invoice
      v-sheet(outlined rounded)

        div(v-if='payment.invoice && payment.invoice.description')
          v-card-text
            h6.text-h6.mb-3 Description
            div(v-html='payment.invoice.description')

          v-divider

        v-list
          v-list-item(v-if='shift && payment && payment.invoice && payment.invoice.timecard')
            v-list-item-content.primary--text.font-weight-bold.d-flex
              router-link.alt-style(:to="{name: 'shift', params: {shiftId: shift.id, jobId: shift.job_id}}")
                | Payment for {{ shift.site_location }}
            v-list-item-action.text-subtitle-1 {{ payment.invoice.timecard.wage_payment | currency }}

          v-list-item(v-for='item in payment.invoice.items')
            v-list-item-content
              v-list-item-title(:class="{'primary--text': item.bold, 'font-weight-medium': item.bold}") {{ item.description }}
            
            v-list-item-action
              .text-subtitle-1 {{ item.amount | currency }}
          
          v-divider

          v-list-item(v-if='userIsManager')
            v-list-item-content
              v-list-item-title Subtotal
            
            v-list-item-action
              .text-subtitle-1 {{ payment.amount | currency }}

          v-list-item(v-if='userIsManager')
            v-list-item-content
              v-list-item-title Fee payment
            
            v-list-item-action
              .text-subtitle-1 {{ payment.fee | currency }}

          v-list-item
            v-list-item-content
              v-list-item-title.font-weight-bold Total
            
            v-list-item-action
              .text-h6.font-weight-black.green--text {{ (userIsManager ? payment.total : payment.amount) | currency }}

    .mb-4.d-flex.flex-column.gap-small(v-if='shift && shift.id')
      h5.text-h5 Shift details
      v-sheet(outlined rounded)
        v-card-text.pb-1
          .d-flex.flex-column
            h6.text-body-1
              router-link.alt-style(
                :to="{name: 'shift', params: { shiftId: shift.id }}"
              ) {{ shift.site_location }}

            .text-body-2 {{ shift.time_begin | time }} - {{ shift.time_end | time }}
            .text-body-2 {{ shift.time_begin | date('MMM D, YYYY') }} - {{ shift.time_end | date('MMM D, YYYY') }}

        v-card-actions
          v-spacer
          v-btn(
            text
            color='primary'
            :to="{name: 'shift', params: {shiftId: shift.id, jobId: shift.job_id}}"
            exact
          ) View shift

        v-divider

        v-card-text.d-flex.align-center
          .d-flex.flex-column
            h6.text-body-1 Billed for {{ clockedTime | duration }} at {{ payment.receiver.additional_info.hourly_rate | currency }}/hour
            .d-flex.flex-column(v-if='breakTime')
              span Worked {{ workTime | duration }}
              span {{ breakTime | duration }} break

          v-spacer

          .text-h6.green--text(v-if='payment && payment.invoice && payment.invoice.timecard')
            | {{ payment.invoice.timecard.wage_payment | currency }}          
        
        v-divider

        clock-events(:events='history')

        
    .mb-4.d-flex.flex-column.gap-small(v-if='job && job.id')
      h5.text-h5 Job details
      v-sheet(outlined rounded)
        job-preview(:job='job')

        
    .mb-4.d-flex.flex-column.gap-small(v-if='payment && payment.receiver')
      h5.text-h5 Recipient
      v-sheet(outlined rounded)
        user-preview(:user='payment.receiver')

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ClockEvents from '@/components/ClockEvents.vue'
import GMap from '@/components/GMap.vue'
import JobPreview from '@/components/JobPreview.vue'
import UserPreview from '@/components/UserPreview.vue'
import { loadPayment } from '@/services/payments'
import { loadShift } from '@/services/shifts'
import { loadJob } from '@/services/jobs'
import { isDebit, isUser, statusColor } from '@/types/Payments'
import { clockedTime, breakTime, workTime, ClockEvent } from '@/types/Jobs'
import EditPaymentDialog from './EditPaymentDialog.vue'
import CompletePaymentsDialog from './CompletePaymentsDialog.vue'
import DenyPaymentsDialog from './DenyPaymentsDialog.vue'
import { currentUserIs, Managers } from '@/types/Users'

@Component({
  metaInfo: {
    title: 'Payment',
  },
  components: {
    ClockEvents,
    GMap,
    JobPreview,
    UserPreview,
    EditPaymentDialog,
    CompletePaymentsDialog,
    DenyPaymentsDialog,
  }
})
export default class Payment extends Vue {

  loading = false
  editPaymentDialog = false
  completePaymentsDialog = false
  denyPaymentsDialog = false

  async mounted() {
    this.loading = true
    const payment = await loadPayment(this.$store, this.$route.params.paymentId)
    this.loading = false
    
    if (payment?.invoice?.timecard?.shift_id) {
      const shift = await loadShift(this.$store, payment.invoice.timecard.shift_id)
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

  get job() {
    if (!this.shift) return null
    return this.$store.getters.job(this.shift.job_id)
  }

  get history() {
    if (!this.shift || !this.shift.clock_history) return []
    return this.shift.clock_history
      .sort((a: ClockEvent, b: ClockEvent) => {
        return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
      })
      .filter((event: ClockEvent) => {
        return event.timecard_id === this.payment?.invoice?.timecard.id
      })
  }

  get workTime() {
    if (!this.shift) return null
    return workTime(this.history)
  }

  get clockedTime() {
    if (!this.shift) return null
    return clockedTime(this.history)
  }
  
  get breakTime() {
    if (!this.shift) return null
    return breakTime(this.history)
  }

  get isDebit() {
    return isDebit(this.payment)
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get receiverIsUser() {
    return isUser(this.payment.receiver)
  }

  goBack() {
    this.$router.push({ name: 'payments' })
  }

  statusColor(status: string) {
    return statusColor(status)
  }
}
</script>