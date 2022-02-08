<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="600",
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(@submit.prevent="updatePayment" v-model="form.isValid" v-if="payment")
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{ payment | fullName }}'s payment

      v-divider
          
      v-card-text
        //- datetime-input(
        //-   outlined
        //-   v-model="form.data.timeIn.time"
        //-   label="Time in"
        //-   data-cy='payment-time-in'
        //- )

        .mb-5(v-for="(breakItem, index) in form.data.breaks", :key="index")
          v-row
            v-col
            //-   datetime-input(
            //-     outlined
            //-     required
            //-     hide-details
            //-     v-model="breakItem.start.time"
            //-     :label="`Break ${index + 1} start`"
            //-     :data-cy="`payment-break-${index + 1}-start`"
            //-   )
            //- v-col
            //-   datetime-input(
            //-     outlined
            //-     required
            //-     hide-details
            //-     v-model="breakItem.end.time"
            //-     :label="`Break ${index + 1} end`"
            //-     :data-cy="`payment-break-${index + 1}-end`"
            //-   )

        //- datetime-input(
        //-   v-if='form.data.timeOut'
        //-   outlined
        //-   required
        //-   v-model="form.data.timeOut.time"
        //-   label="Time out"
        //-   data-cy='payment-time-out'
        //- )

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

<script>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import DatetimeInput from '@/components/inputs/DatetimeInput.vue'
import * as payments from '@/services/payments'
import { ClockAction } from '@/types/Clock'

// TODO: Convert this file to typescript
// TODO: Add chronology validation

dayjs.extend(duration)

@Component({
  components: { DatetimeInput },
})
export default class EditPaymentDialog extends Vue {
  
  loading = false
  form = {
    isValid: false,
    data: {
      timeIn: null,
      timeOut: null,
      breaks: [],
    },
  }

  @Prop({ default: false }) opened
  @Prop({ type: Number }) paymentId

  get payment() {
    return this.$store.getters.payment(this.paymentId)
  }

  @Watch('paymentId')
  onPaymentIdChanged() {
    this.calculateFormValues()
  }

  @Watch('opened')
  onOpened(opened) {
    if (opened) this.calculateFormValues()
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  calculateFormValues() {
    return
    // TODO
  //   const events = this.payment.time_clocks
  //     .sort((a, b) => {
  //       return new Date(b.time).getTime() - new Date(a.time).getTime()
  //     })

  //   this.form.data.timeIn = events.find(event => event.action === ClockAction.ClockIn)
  //   this.form.data.timeOut = events.find(event => event.action === ClockAction.ClockOut)

  //   const breakStarts = events.filter(event => event.action === ClockAction.StartBreak)
  //   const breakEnds = events.filter(event => event.action === ClockAction.EndBreak)
  //   /*
  //     We will group the start and end breaks into pairs, eg:
  //     breaks = [{
  //       start: ClockEvent,
  //       end: ClockEvent,
  //     },
  //     ...
  //     ]
  //   */
  //  const breaks = []

  //   if (breakStarts.length != breakEnds.length) return console.error('Malformed data.')

  //   breakStarts.forEach((start, index) => {
  //     breaks.push({
  //       start,
  //       end: breakEnds[index]
  //     })
  //   })
  //   this.form.data.breaks = breaks
  }

  timeDiff(timeIn, timeOut) {
    timeIn = dayjs(timeIn)
    timeOut = dayjs(timeOut)

    const duration = dayjs.duration(timeOut.diff(timeIn)),
      hours = duration.format('H'),
      minutes = duration.format('m')

    return `${hours} hour${hours == 1 ? '' : 's'}, ${minutes} minute${
      minutes == 1 ? '' : 's'
    }`
  }

  async updatePayment() {
    const newTimeclockEvents = []

    newTimeclockEvents.push(this.form.data.timeIn)
    this.form.data.breaks.forEach((breakItem) => {
      newTimeclockEvents.push(breakItem.start)
      newTimeclockEvents.push(breakItem.end)
    })
    newTimeclockEvents.push(this.form.data.timeOut)

    this.loading = true

    try {
      await payments.updatePayment(
        this.$store,
        this.payment.id,
        newTimeclockEvents,
      )
      this.closeDialog()
      this.$emit('saved')
    } finally {
      this.loading = false
    }
  }
}
</script>
