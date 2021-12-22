<template lang="pug">
.recurring

  //- Repeat every {num} {day,week,month,year}
  .d-flex.align-center
    p.text-no-wrap.mb-6.mr-1 Repeat every
    v-text-field.px-2(
      outlined,
      dense,
      v-model.number="recurData.interval",
      type="number",
      increment="1",
      min="1",
      :rules="rules.interval"
    )
    v-select(
      outlined
      dense
      v-model="recurData.freq"
      :items="freqOptions"
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
        :on-icon="`mdi-alpha-${day.text.charAt(0)}-circle`",
        :off-icon="`mdi-alpha-${day.text.charAt(0)}-circle-outline`",
      )

  //- Days to repeat option
  .d-flex.align-center(
    v-if="showDayRepeatOption"
  )
    v-radio-group(v-model="dayRepeatOption")
      .d-flex.mb-2
        v-radio.mr-4.mr-sm-0(
          value="on-day"
          label="On day"
          :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
        )
        v-select(
          v-if='selectedYearlyRepeat'
          outlined
          dense
          v-model='recurData.bymonth'
          :items='months'
          :disabled="dayRepeatOption != 'on-day'"
        )
        v-select(
          outlined
          dense
          v-model="recurData.bymonthday"
          :items="dates"
          :disabled="dayRepeatOption != 'on-day'"
        )
      .d-flex
        v-radio.mr-4.mr-sm-0(
          value="on-the"
          label="On the"
          :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
        )
        v-select(
          outlined
          dense
          v-model="recurData.bysetpos"
          :items="ordinals"
          :disabled="dayRepeatOption != 'on-the'"
        )
        v-select(
          outlined
          dense
          v-model="recurData.byweekday"
          :items="weekdayOptions"
          item-text='text'
          :disabled="dayRepeatOption != 'on-the'"
        )
        .d-flex(v-if='selectedYearlyRepeat')
          p of
          v-select(
            outlined
            dense
            v-model='recurData.bymonth'
            :items='months'
            :disabled="dayRepeatOption != 'on-the'"
          )


  //- End on selector
  p.text-no-wrap.mb-0 Ends
  v-radio-group(v-model="endsOption")
    .d-flex.mb-2
      v-radio.mr-4.mr-sm-0(
        value="on"
        label="On"
        :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
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
      v-radio.mr-4.mr-sm-0(
        value="after"
        label="After"
        :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
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

  pre {{rrule.toString()}}
  pre {{rrule.toText()}}
  pre {{recurDataSanitized}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import { RRule, RRuleSet, rrulestr } from 'rrule'

import { exists } from '@/util/inputValidation'

const now = new Date()
if (now.getMinutes() != 0) now.setHours(now.getHours() + 1)
now.setSeconds(0, 0)
now.setMinutes(0)
const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const weekFromNowLocal = dayjs(weekFromNow).format('YYYY-MM-DDTHH:mm:ss')

@Component
export default class RecurringDateInput extends Vue {
  
  @Prop({ type: Object }) readonly value: any
  
  rules = {
    repeatEvery: [exists('Repeat required')],
    endsOn: [exists('End date required')],
    endsAfter: [exists('Number of occurences required')],
  }

  dayRepeatOption = 'on-day'
  endsOption = 'after'

  freqOptions = [
    { value: RRule.YEARLY, text: 'years' },
    { value: RRule.MONTHLY, text: 'months' },
    { value: RRule.WEEKLY, text: 'weeks' },
    { value: RRule.DAILY, text: 'days' },
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
    { value: RRule.SU, text: 'sunday', weekday: false },
    { value: RRule.MO, text: 'monday', weekday: true },
    { value: RRule.TU, text: 'tuesday', weekday: true },
    { value: RRule.WE, text: 'wednesday', weekday: true },
    { value: RRule.TH, text: 'thursday', weekday: true },
    { value: RRule.FR, text: 'friday', weekday: true },
    { value: RRule.SA, text: 'saturday', weekday: false },
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

  recurData: any = {
    freq: RRule.DAILY,
    interval: 1,
    count: 1,
    bymonthday: now.getDate(),
    bysetpos: 1,
    byweekday: [RRule.MO, RRule.FR],
    // dtstart: new Date(Date.UTC(2012, 1, 1, 10, 30)),
    // until: new Date(Date.UTC(2012, 12, 31))
  }

  get recurDataSanitized() {
    const recurData = {...this.recurData}

    // Convert until date string into date object
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

  get rrule() {
    return new RRule(this.recurDataSanitized)
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

  // // Build request object
  // const shift = {
  //   ...this.shift,
  //   contractor_ids: this.shift.contractor_ids.map((id: number) => id < 0 ? null : id),
  //   site_location: this.shift.site_locations[0],
  // }
  // // Correct date strings
  // ;(shift.time_begin = new Date(shift.time_begin).toISOString()),
  //   (shift.time_end = new Date(shift.time_end).toISOString()),
  //   (shift.repeat.ends.date = new Date(shift.repeat.ends.date).toISOString())

  // // Delete unwanted fields
  // if (!this.recurring) delete shift.repeat
  // else {
  //   if (shift.repeat.repeatEvery.unit != 'week') delete shift.repeat.weekly
  //   if (shift.repeat.repeatEvery.unit != 'month') delete shift.repeat.monthly

  //   if (this.ends == 'on') delete shift.repeat.ends.occurences
  //   else {
  //     shift.repeat.ends.occurences = +shift.repeat.ends.occurences
  //     delete shift.repeat.ends.date
  //   }
  // }
}
</script>