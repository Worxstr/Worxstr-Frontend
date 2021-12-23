<template lang="pug">
.recurring-date-input

  .d-flex.flex-column.flex-md-row.gap-small
    //- Start date
    datetime-input(
      v-model='recurData.dtstart'
      outlined
      label='Start'
      hide-details
    )
    //- End date
    datetime-input(
      v-model='end'
      outlined
      label='End'
      hide-details
    )

  //- Recurrence section
  v-checkbox(label='Recurring' v-model='recurring')

  v-expand-transition
    .d-flex.flex-column.gap-medium(v-if='recurring')

      //- Repeat every {num} {day,week,month,year}
      .d-flex.align-center
        span.text-no-wrap.mr-1 Repeat every
        v-text-field.px-2(
          outlined
          dense
          v-model.number="recurData.interval"
          type="number"
          increment="1"
          min="1"
          :rules="rules.interval"
          hide-details
        )
        v-select(
          outlined
          dense
          v-model="recurData.freq"
          :items="freqOptions"
          :item-text="(e) => recurData.interval == 1 ? e.text : `${e.text}s`"
          hide-details
        )

      //- Week option
      div(v-if="showWeekdays")
        p.text-no-wrap.mb-0 Repeat on
        .d-flex.align-center.pt-1
          v-checkbox.mt-0(
            v-for='(day, i) in weekdays'
            :key='i'
            v-model='recurData.byweekday'
            :value='day.value'
            :on-icon="`mdi-alpha-${day.text.charAt(0).toLowerCase()}-circle`",
            :off-icon="`mdi-alpha-${day.text.charAt(0).toLowerCase()}-circle-outline`",
          )

      //- Days to repeat option
      div(v-if='showDayRepeatOption')
        v-radio-group(v-model='dayRepeatOption' hide-details)
          .d-flex.gap-small.mb-4
            v-radio.mr-4.mb-0(
              value='on-day'
              label='On day'
            )
            v-select(
              v-if='selectedYearlyRepeat'
              outlined
              dense
              v-model='recurData.bymonth'
              :items='months'
              :disabled="dayRepeatOption != 'on-day'"
              hide-details
            )
            v-select(
              outlined
              dense
              v-model="recurData.bymonthday"
              :items="dates"
              :disabled="dayRepeatOption != 'on-day'"
              hide-details
            )
          .d-flex.flex-column.flex-sm-row.gap-small
            .d-flex.gap-small
              v-radio.mr-4.mb-0(
                value="on-the"
                label="On the"
              )
              v-select(
                outlined
                dense
                v-model="recurData.bysetpos"
                :items="ordinals"
                :disabled="dayRepeatOption != 'on-the'"
                hide-details
              )
              v-select(
                outlined
                dense
                v-model="recurData.byweekday"
                :items="weekdayOptions"
                item-text='text'
                :disabled="dayRepeatOption != 'on-the'"
                hide-details
              )
            .d-flex.align-center.gap-small(v-if='selectedYearlyRepeat')
              span of
              v-select(
                outlined
                dense
                v-model='recurData.bymonth'
                :items='months'
                :disabled="dayRepeatOption != 'on-the'"
                hide-details
              )

      //- End on selector
      div
        span.text-no-wrap.mb-0 Ends
        v-radio-group(v-model="endsOption")
          .d-flex.mb-2
            v-radio.mr-4.mb-0(
              value="on"
              label="On"
              style='width: 70px'
            )
            v-text-field(
              v-model="recurData.until"
              outlined
              dense
              hide-details
              type="date"
              :disabled="endsOption == 'after'"
              :rules="rules.endsOn"
            )
          .d-flex
            v-radio.mr-4.mb-0(
              value="after"
              label="After"
              style='width: 70px'
            )
            v-text-field(
              v-model.number="recurData.count"
              outlined
              dense
              hide-details
              type="number"
              increment="1"
              min="1"
              suffix="occurences"
              value="1"
              :disabled="endsOption == 'on'"
            )

</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import { RRule } from 'rrule'

import { exists } from '@/util/inputValidation'

import DatetimeInput from '@/components/inputs/DatetimeInput.vue'

const now = new Date()
if (now.getMinutes() != 0) now.setHours(now.getHours() + 1)
now.setSeconds(0, 0)
now.setMinutes(0)
const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
const nowFormatted = dayjs(now).format('YYYY-MM-DDTHH:mm:ssZ')
const hourFromNowFormatted = dayjs(hourFromNow).utc().format('YYYY-MM-DDTHH:mm:ssZ')
const monthFromNowFormatted = dayjs(monthFromNow).utc().format('YYYY-MM-DD')

@Component({
  components: {
    DatetimeInput,
  },
})
export default class RecurringDateInput extends Vue {
  
  @Prop({ type: Object }) readonly value: any

  @Watch('rrule')
  onrruleChanged() {
    this.updateValue()
  }

  @Watch('end')
  endDateChanged() {
    this.updateValue()
  }

  mounted() {
    this.updateValue()
  }

  updateValue() {
    this.$emit('input', {
      rrule: this.rrule.toString(),
      duration: this.duration,
    })
  }

  rules = {
    repeatEvery: [exists('Repeat required')],
    endsOn: [exists('End date required')],
    endsAfter: [exists('Number of occurences required')],
  }

  recurring = false
  dayRepeatOption = 'on-day'
  endsOption = 'on'

  freqOptions = [
    { value: RRule.YEARLY, text: 'year' },
    { value: RRule.MONTHLY, text: 'month' },
    { value: RRule.WEEKLY, text: 'week' },
    { value: RRule.DAILY, text: 'day' },
  ]
  months = [
    { value: 1, text: 'January' },
    { value: 2, text: 'February' },
    { value: 3, text: 'March' },
    { value: 4, text: 'April' },
    { value: 5, text: 'May' },
    { value: 6, text: 'June' },
    { value: 7, text: 'July' },
    { value: 8, text: 'August' },
    { value: 9, text: 'September' },
    { value: 10, text: 'October' },
    { value: 11, text: 'November' },
    { value: 12, text: 'December' },
  ]
  weekdays = [
    { value: RRule.SU, text: 'Sunday', weekday: false },
    { value: RRule.MO, text: 'Monday', weekday: true },
    { value: RRule.TU, text: 'Tuesday', weekday: true },
    { value: RRule.WE, text: 'Wednesday', weekday: true },
    { value: RRule.TH, text: 'Thursday', weekday: true },
    { value: RRule.FR, text: 'Friday', weekday: true },
    { value: RRule.SA, text: 'Saturday', weekday: false },
  ]
  weekdayOptions = [
    { // Every day
      value: this.weekdays.map((day: any) => day.value),
      text: 'day',
    },
    { // Weekdays
      value: this.weekdays.filter((day: any) => day.weekday).map((day: any) => day.value),
      text: 'weekday',
    },
    { // Weekends
      value: this.weekdays.filter((day: any) => !day.weekday).map((day: any) => day.value),
      text: 'weekend day',
    },
    // Map individual days
    ...this.weekdays.map((day: any) => ({
        value: [day.value],
        text: day.text,
    })),
  ]
  dates = Array.from({ length: 31 }, (v, i) => i + 1)
  ordinals = [
    { value: 1, text: 'first' },
    { value: 2, text: 'second' },
    { value: 3, text: 'third' },
    { value: 4, text: 'fourth' },
    { value: 5, text: 'fifth' },
    { value: -1, text: 'last' },
  ]

  // Default form data
  recurData: any = {
    dtstart: now,
    freq: RRule.DAILY,
    interval: 1,
    count: 10,
    bymonthday: now.getDate(),
    bysetpos: 1,
    bymonth: 1,
    byweekday: this.weekdayOptions[1].value,
    until: monthFromNowFormatted,
  }
  end = hourFromNowFormatted

  // Process form data and output clean object
  get recurDataSanitized() {
    
    const recurData = {...this.recurData}

    if (!this.recurring) return {
      dtstart: recurData.dtstart,
      freq: RRule.DAILY,
      count: 1,
    }

    // Convert date strings into date objects
    if (recurData.dtstart) {
      recurData.dtstart = new Date(recurData.dtstart)
    }
    if (recurData.until) {
      recurData.until = new Date(recurData.until)
    }

    // Delete properties that aren't selected
    
    if (recurData.freq !== RRule.YEARLY) {
      delete recurData.bymonth
    }
    if (recurData.freq === RRule.MONTHLY || recurData.freq === RRule.YEARLY) {
      if (this.dayRepeatOption === 'on-day') {
        delete recurData.bysetpos
        delete recurData.byweekday
      }
      if (this.dayRepeatOption === 'on-the') {
        delete recurData.bymonthday
      }
    }
    else {
      delete recurData.bymonthday
      delete recurData.bysetpos
      
      if (recurData.freq !== RRule.WEEKLY) {
        delete recurData.byweekday
      }
    }

    if (this.endsOption === 'on') {
      delete recurData.count
    }
    if (this.endsOption === 'after') {
      delete recurData.until
    }

    return recurData
  }

  // Compute rrule object
  get rrule() {
    return new RRule(this.recurDataSanitized)
  }

  // Compute duration of event in seconds
  get duration() {
    return ((new Date(this.end)).getTime() - (new Date(this.recurData.dtstart)).getTime()) / 1000
  }

  get showWeekdays() {
    return this.recurData.freq == RRule.WEEKLY
  }

  get showDayRepeatOption() {
    return this.recurData.freq == RRule.MONTHLY || this.recurData.freq == RRule.YEARLY
  }

  get selectedYearlyRepeat() {
    return this.recurData.freq == RRule.YEARLY
  }

}
</script>

<style lang="scss">
.recurring-date-input {
  .v-radio label {
    white-space: nowrap;
  }
}
</style>