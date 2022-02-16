<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='700'
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      v-if='payment'
      @submit.prevent='updatePayment'
      v-model='isValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{ payment.receiver | fullName }}'s payment
        v-spacer
        .text-h6.font-weight-black.green--text
          | {{ total | currency }}

      v-divider
      v-subheader Time sheet

      v-card-text(v-if='timeSheet && timeSheet.timeIn && timeSheet.timeOut')
        datetime-input(
          v-model='timeSheet.timeIn.time'
          outlined
          label='Time in'
          data-cy='payment-time-in'
        )
        .mb-5(v-for='(breakItem, i) in timeSheet.breaks' :key='i')
          v-row
            v-col
              datetime-input(
                outlined
                required
                hide-details
                v-model="breakItem.start.time"
                :label="`Break ${i + 1} start`"
                :data-cy="`payment-break-${i + 1}-start`"
              )
            v-col
              datetime-input(
                outlined
                required
                hide-details
                v-model="breakItem.end.time"
                :label="`Break ${i + 1} end`"
                :data-cy="`payment-break-${i + 1}-end`"
              )

        datetime-input(
          v-model='timeSheet.timeOut.time'
          outlined
          required
          label='Time out'
          data-cy='payment-time-out'
        )

      v-divider
      v-subheader Invoice details

      v-card-text
        //- // TODO: Make reorderable work
        invoice-input(
          v-model='editedInvoice.items'
          :fixedLineitems='[timeSheetPayment]'
          :orderable='false'
        )
        richtext-field(
          placeholder='Invoice description'
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import DatetimeInput from '@/components/inputs/DatetimeInput.vue'
import InvoiceInput from '@/components/inputs/InvoiceInput.vue'
import RichtextField from '@/components/inputs/RichtextField.vue'
import * as payments from '@/services/payments'
import { ClockAction, ClockEvent, clockedTime } from '@/types/Jobs'
import { Invoice } from '@/types/Payments'

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

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Number }) paymentId!: number

  get payment() {
    const payment = this.$store.getters.payment(this.paymentId)
    this.editedInvoice = payment.invoice
    console.log(this.editedInvoice)
    return payment
  }

  get calculatedPay() {
    const rate = parseFloat(this.payment.receiver.additional_info.hourly_rate)
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
    return this.$store.getters.shift(this.payment.invoice?.timecard?.shift_id)
  }

  get clockEvents() {
    return this.shift.clock_history
      .filter(
        (event: ClockEvent) => event.timecard_id === this.payment.invoice?.timecard?.id
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

  @Watch('clockEvents')
  onClockEventsChanged() {
    this.calculateFormValues()
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    if (opened) this.calculateFormValues()
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  // Format clock events list into a "time sheet" object, so we can iterate on it in the template
  calculateFormValues() {
    this.timeSheet.timeIn = {
      ...this.clockEvents.find((event: ClockEvent) => event.action === ClockAction.ClockIn)
    }
    this.timeSheet.timeOut = {
      ...this.clockEvents.find((event: ClockEvent) => event.action === ClockAction.ClockOut)
    }

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
    this.timeSheet.breaks = [...breaks]
  }

  timeDiff(timeIn: any, timeOut: any) {
    timeIn = dayjs(timeIn)
    timeOut = dayjs(timeOut)

    const duration = dayjs.duration(timeOut.diff(timeIn)),
      hours = duration.format('H'),
      minutes = duration.format('m')

    return `${hours} hour${hours == '1' ? '' : 's'}, ${minutes} minute${
      minutes == '1' ? '' : 's'
    }`
  }

  async updatePayment() {

    // Reconstruct the original clock events array format
    const newTimeclockEvents: ClockEvent[] = []
    newTimeclockEvents.push(this.timeSheet.timeIn)
    this.timeSheet.breaks.forEach((breakItem: { start: ClockEvent; end: ClockEvent }) => {
      newTimeclockEvents.push(breakItem.start)
      newTimeclockEvents.push(breakItem.end)
    })
    newTimeclockEvents.push(this.timeSheet.timeOut)

    this.loading = true

    try {
      await payments.updatePayment(
        this.$store,
        this.payment.id,
        newTimeclockEvents,
        this.editedInvoice,
      )
      this.closeDialog()
      this.$emit('saved')
    } finally {
      this.loading = false
    }
  }
}
</script>
