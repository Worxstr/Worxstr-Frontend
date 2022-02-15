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
        .text-h6.font-weight-black.green--text(v-if='invoice.items.length')
          | {{ total | currency }}

      v-divider
      v-subheader Time sheet

      v-card-text(v-if='timeSheet')
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
        invoice-input(
          v-model='invoice.items'
          :lineitems='[{description: `Payment for ${shift.site_location}`, amount: payment.amount,}]'
          :orderable='true'
        )
        richtext-field(
          placeholder='Invoice description'
          v-model='invoice.description'
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
import { ClockAction, ClockEvent } from '@/types/Jobs'

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
  invoice = {
    items: [],
    description: ''
  }
  timeSheet: any = {
    timeIn: null,
    timeOut: null,
    breaks: [],
  }

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Number }) paymentId!: number

  get payment() {
    return this.$store.getters.payment(this.paymentId)
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
    return this.invoice.items.reduce((total: number, lineitem: any) => total + lineitem.amount, 0)
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
    this.timeSheet.breaks = {...breaks}
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
    // const newTimeclockEvents = []

    // newTimeclockEvents.push(this.form.data.timeIn)
    // this.form.data.breaks.forEach((breakItem) => {
    //   newTimeclockEvents.push(breakItem.start)
    //   newTimeclockEvents.push(breakItem.end)
    // })
    // newTimeclockEvents.push(this.form.data.timeOut)

    // this.loading = true

    // try {
    //   await payments.updatePayment(
    //     this.$store,
    //     this.payment.id,
    //     newTimeclockEvents,
    //     // invoice
    //   )
    //   this.closeDialog()
    //   this.$emit('saved')
    // } finally {
    //   this.loading = false
    // }
  }
}
</script>
