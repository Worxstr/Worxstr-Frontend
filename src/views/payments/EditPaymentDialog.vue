<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='700'
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      ref='form'
      @submit.prevent='updatePayment'
      v-model='isValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6
          | {{ paymentId ? 'Editing' : (userIsContractor ? 'Requesting' : 'Creating') }} &nbsp;
          span(v-if='payment && payment.receiver.name') {{ payment.receiver.name }}'s payment
          span(v-else) payment

        v-spacer
        .text-h6.font-weight-black.green--text
          | {{ total | currency }}


      div(v-if='userIsManager')
        v-divider
        v-subheader Job & recipient
        v-card-text.pt-0
          .d-flex.flex-column.flex-sm-row.gap-small
            v-select(
              :autofocus='!paymentId'
              label='Attach to job'
              outlined
              dense
              v-model='editedInvoice.job_id'
              :items='jobs'
              item-text='name'
              item-value='id'
              hide-details
              :loading='loadingJobs'
            )
            v-select(
              label='Recipient'
              outlined
              dense
              v-model='editedInvoice.recipient_id'
              :items='contractors'
              item-text='name'
              item-value='id'
              hide-details
              :loading='loadingContractors'
              :rules='rules.recipient'
              :readonly='!!paymentId'
            )

      div(v-if='hasAssociatedTimecard')
        v-divider

        v-subheader Time sheet

        v-card-text.pt-0.d-flex.flex-column

          datetime-input(
            :autofocus='!!paymentId'
            v-model='timeSheet.timeIn.time'
            outlined
            label='Time in'
            :rules='rules.timeIn'
            data-cy='payment-time-in'
          )
          div(v-for='(breakItem, i) in timeSheet.breaks' :key='i')
            .d-flex.gap-small
              datetime-input(
                outlined
                required
                v-model="breakItem.start.time"
                :label="`Break ${i + 1} start`"
                :rules='rules.breakStart(i)'
                :data-cy="`payment-break-${i + 1}-start`"
              )
              datetime-input(
                outlined
                required
                v-model="breakItem.end.time"
                :label="`Break ${i + 1} end`"
                :rules='rules.breakEnd(i)'
                :data-cy="`payment-break-${i + 1}-end`"
              )

          datetime-input(
            v-model='timeSheet.timeOut.time'
            outlined
            required
            label='Time out'
            :rules='rules.timeOut'
            data-cy='payment-time-out'
          )

      div
        v-divider
        v-subheader Invoice
        v-card-text.pt-0
          //- // TODO: Make reorderable work
          invoice-input(
            v-model='editedInvoice.items'
            :fixedLineitems='hasAssociatedTimecard ? [timeSheetPayment] : []'
            :orderable='false'
          )
          richtext-field(
            placeholder='Description'
            v-model='editedInvoice.description'
          )

      v-spacer
      
      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(
          text
          color="primary"
          @click="updatePayment"
          data-cy='save-payment-button'
        ) Save

    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import duration from 'dayjs/plugin/duration'
import DatetimeInput from '@/components/inputs/DatetimeInput.vue'
import InvoiceInput from '@/components/inputs/InvoiceInput.vue'
import RichtextField from '@/components/inputs/RichtextField.vue'
import * as payments from '@/services/payments'
import { ClockAction, ClockEvent, clockedTime } from '@/types/Jobs'
import { Invoice, Payment } from '@/types/Payments'
import { exists } from '@/util/inputValidation'
import { deepCopy } from '@/util/helpers'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { loadWorkforce } from '@/services/users'
import { loadJobs } from '@/services/jobs'
import { createInvoice } from '@/services/payments'

dayjs.extend(isSameOrAfter)

// TODO: Convert this file to typescript
// TODO: Add chronology validation

dayjs.extend(duration)

@Component({
  components: {
    DatetimeInput,
    InvoiceInput,
    RichtextField,
  },
})
export default class EditPaymentDialog extends Vue {
  
  loading = false
  loadingJobs = false
  loadingContractors = false
  isValid = false
  timeSheet: any = {
    timeIn: null,
    timeOut: null,
    breaks: [],
  }
  editedInvoice: any = {
    items: [],
    description: ''
  }
  rules = {
    recipient: [
      exists('Recipient is required'),
    ],
    timeIn: [exists('Time in required')],
    breakStart: (i: number) => [
      exists('Break start required'),

      // Check that break start is after time in
      (value: string) => {
        // Must be after time in
        if (this.timeSheet.timeIn && value) {
          return dayjs(value).isSameOrAfter(this.timeSheet.timeIn.time)
            || 'Must be after time in'
        }
        return true
      },

      // Check that break start is after previous break end (if it exists)
      (value: string) => {
        if (this.timeSheet.breaks[i - 1]) {
          return dayjs(value).isSameOrAfter(this.timeSheet.breaks[i - 1].end.time)
            || `Must be before break ${i} end`
        }
        return true
      },
    ],
    breakEnd: (i: number) => [
      exists('Break end required'),

      // Check that break end is after break start
      (value: string) => {
        if (this.timeSheet.breaks[i]) {
          return dayjs(value).isSameOrAfter(this.timeSheet.breaks[i].start.time)
            || `Must be after break ${i + 1} start`
        }
        return true
      },
    ],
    timeOut: [
      exists('Time out required'),

      // Check that time out is after time in
      (value: string) => {
        if (this.timeSheet.timeIn) {
          return dayjs(value).isSameOrAfter(this.timeSheet.timeIn.time)
            || 'Must be after time in'
        }
        return true
      },

      // Check that time out is after last break end
      (value: string) => {
        if (this.timeSheet.breaks[this.timeSheet.breaks.length - 1]) {
          return dayjs(value).isAfter(
            this.timeSheet.breaks[this.timeSheet.breaks.length - 1].end.time
          )
            || 'Must be after last break end'
        }
        return true
      },
    ],
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ type: Number }) readonly paymentId?: number
  @Prop({ type: Number }) readonly jobId?: number

  get payment() {
    const payment = this.$store.getters.payment(this.paymentId)
    return payment
  }

  get hasAssociatedTimecard() {
    return this.paymentId && !!this.payment?.invoice?.timecard && this.timeSheet
  }

  get calculatedPay() {
    if (!this.hasAssociatedTimecard || !this.timeSheet.timeIn || !this.timeSheet.timeOut) return null

    const rate = parseFloat(this.payment.receiver?.additional_info?.hourly_rate || 0)
    const time = clockedTime([this.timeSheet.timeIn, this.timeSheet.timeOut])
    return rate * time / (60 * 60 * 1000) // Divide after multiplying to avoid rounding errors
  }

  get timeSheetPayment() {
    return {
      description: `Payment for ${this.shift.site_location}`,
      amount: this.calculatedPay || this.payment.amount
    }
  }

  get shift() {
    return this.$store.getters.shift(this.payment?.invoice?.timecard?.shift_id)
  }

  get clockEvents() {
    if (!this.hasAssociatedTimecard) return null

    return this.shift.clock_history
      .filter(
        (event: ClockEvent) => event.timecard_id === this.payment?.invoice?.timecard?.id
      )
      .sort(
        (a: ClockEvent, b: ClockEvent) => dayjs(a.time).diff(dayjs(b.time))
      )
  }

  get total() {
    return this.calculatedPay + this.editedInvoice.items.reduce(
      (total: number, lineitem: any) => total + parseFloat(lineitem.amount), 0
    )
  }

  async loadJobs() {
    this.loadingJobs = true
    await loadJobs(this.$store)
    this.loadingJobs = false
  }

  get jobs() {
    return this.$store.getters.jobs
  }

  async loadContractors() {
    this.loadingContractors = true
    await loadWorkforce(this.$store)
    this.loadingContractors = false
  }

  get contractors() {
    return this.$store.getters.contractors
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get userIsContractor() {
    return currentUserIs(UserRole.Contractor)
  }

  @Watch('payment')
  onPaymentChange(payment: Payment) {
    if (!payment.invoice) return
    this.editedInvoice = deepCopy(payment.invoice)
  }

  @Watch('timeSheet', { deep: true })
  async onTimeSheetChange() {
    await this.$nextTick();
    (this.$refs.form as HTMLFormElement)?.validate()
  }

  @Watch('clockEvents')
  onClockEventsChanged() {
    this.calculateFormValues()
  }

  @Watch('opened')
  async onOpenedChange(val: boolean) {
    if (val) {
      this.calculateFormValues()

      if (this.userIsManager) {
        this.loadJobs()
        this.loadContractors()
      }

      if (this.paymentId) {
        // Editing a payment
        this.editedInvoice = deepCopy(this.payment.invoice)
        this.editedInvoice.recipient_id = this.payment?.receiver?.id
        this.editedInvoice.job_id = this.payment?.invoice?.job_id
      }
      else {
        // Creating a new payment
        this.editedInvoice = {
          description: '',
          items: [{
            description: '',
            amount: 0,
          }]
        }

        if (this.jobId) {
          this.editedInvoice.job_id = this.jobId
        }

        if (this.userIsContractor) {
          this.editedInvoice.recipient_id = this.$store.getters.me.id
        }
      }
    }
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  // Format clock events list into a "time sheet" object, so we can iterate on it in the template
  calculateFormValues() {
    if (!this.hasAssociatedTimecard || !this.clockEvents) return

    // TODO: Make deep copies

    this.timeSheet.timeIn = deepCopy(
      this.clockEvents.find((event: ClockEvent) => event.action === ClockAction.ClockIn)
    )
    this.timeSheet.timeOut = deepCopy(
      this.clockEvents.find((event: ClockEvent) => event.action === ClockAction.ClockOut)
    )

    const breakStarts = this.clockEvents.filter((event: ClockEvent) => event.action === ClockAction.StartBreak)
    const breakEnds = this.clockEvents.filter((event: ClockEvent) => event.action === ClockAction.EndBreak)
    /*
      We will group the start and end breaks into pairs, eg:
      breaks = [{
        start: ClockEvent,
        end: ClockEvent,
      },
      ...
      ]
    */
    const breaks: any = []

    if (breakStarts.length != breakEnds.length) return console.error('Malformed data.')

    breakStarts.forEach((start: any, i: number) => {
      breaks.push({
        start,
        end: breakEnds[i]
      })
    })
    this.timeSheet.breaks = deepCopy(breaks)
  }

  async updatePayment() {

    this.loading = true

    try {
      // Reconstruct the original clock events array format
      if (this.paymentId) {
        // Editing a payment

        if (this.hasAssociatedTimecard) {
          // Payment has a time sheet, create new clock events
          const newTimeclockEvents: ClockEvent[] = []
          newTimeclockEvents.push(this.timeSheet.timeIn)
          this.timeSheet.breaks.forEach((breakItem: { start: ClockEvent; end: ClockEvent }) => {
            newTimeclockEvents.push(breakItem.start)
            newTimeclockEvents.push(breakItem.end)
          })
          newTimeclockEvents.push(this.timeSheet.timeOut)

          await payments.updatePayment(this.$store, this.paymentId, this.editedInvoice, newTimeclockEvents)
        }
        else {
          await payments.updatePayment(this.$store, this.paymentId, this.editedInvoice)
        }
      }
      else {
        // Creating a new payment
        const payment = await createInvoice(this.$store, this.editedInvoice);
        (this.$refs.form as HTMLFormElement)?.reset()

        this.$router.push({
          name: 'payment',
          params: {
            paymentId: payment.id,
          }
        })
      }

      this.closeDialog()
      this.$emit('saved')
    } finally {
      this.loading = false
    }
  }
}
</script>
