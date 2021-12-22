<template lang="pug">
.recurring
  //- pre {{recurData}}
  //- pre {{rrule.toString()}}
  pre {{rrule.toText()}}

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
  div(v-if="isWeekly")
    p.text-no-wrap.mb-0 Repeat on
    .d-flex.align-center.pt-1
      v-checkbox.mt-0(
        v-for='(day, i) in byweekdayOptions'
        :key='i'
        v-model='recurData.byweekday'
        :value='day.value'
        :on-icon="`mdi-alpha-${day.initial}-circle`",
        :off-icon="`mdi-alpha-${day.initial}-circle-outline`",
      )

  //- //- Month option
  //- .d-flex.align-center(
  //-   v-if="recurData.repeatEvery.unit == 'month'"
  //- )
  //-   p.text-no-wrap.mb-6.mr-1 Repeat on
  //-   v-select.px-2(
  //-     outlined,
  //-     dense,
  //-     v-model="recurData.monthly",
  //-     :items="[ {\
  //-       value: 'byDate',\
  //-       text: `Monthly on day ${(new Date()).getDate()}`\
  //-     }, {\
  //-       value: 'byDay',\
  //-       text: `Monthly on ${weekAndDay(new Date())}`\
  //-     }, ]"
  //-   )

  //- //- End on selector
  //- p.text-no-wrap.mb-0 Ends
  //- v-radio-group(v-model="ends")
  //-   .d-flex.mb-2
  //-     v-radio.mr-4.mr-sm-0(
  //-       value="on",
  //-       label="On",
  //-       :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
  //-     )
  //-     v-text-field(
  //-       v-model="recurData.ends.date",
  //-       outlined,
  //-       dense,
  //-       hide-details,
  //-       type="datetime-local",
  //-       :disabled="ends == 'after'",
  //-       :rules="rules.endsOn"
  //-     )
  //-   .d-flex
  //-     v-radio.mr-4.mr-sm-0(
  //-       value="after",
  //-       label="After",
  //-       :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
  //-     )
  //-     v-text-field(
  //-       v-model.number="recurData.ends.occurences",
  //-       outlined,
  //-       dense,
  //-       hide-details,
  //-       type="number",
  //-       increment="1",
  //-       min="1",
  //-       suffix="occurences",
  //-       value="1",
  //-       :disabled="ends == 'on'"
  //-     )
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

  recurData: any = {
    freq: RRule.WEEKLY,
    interval: 5,
    byweekday: [RRule.MO, RRule.FR],
    dtstart: new Date(Date.UTC(2012, 1, 1, 10, 30)),
    until: new Date(Date.UTC(2012, 12, 31))
  }

  get rrule() {
    return new RRule(this.recurData)
  }

  freqOptions = [
    { value: RRule.YEARLY, text: 'years' },
    { value: RRule.MONTHLY, text: 'months' },
    { value: RRule.WEEKLY, text: 'weeks' },
    { value: RRule.DAILY, text: 'days' },
  ]

  byweekdayOptions = [
    { value: RRule.SU, initial: 's' },
    { value: RRule.MO, initial: 'm' },
    { value: RRule.TU, initial: 't' },
    { value: RRule.WE, initial: 'w' },
    { value: RRule.TH, initial: 't' },
    { value: RRule.FR, initial: 'f' },
    { value: RRule.SA, initial: 's' },
  ]

  get isWeekly() {
    return this.recurData.freq == RRule.WEEKLY
  }

  weekAndDay(date: Date) {
    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      prefixes = ['first', 'second', 'third', 'fourth', 'fifth']

    return (
      prefixes[Math.ceil(date.getDate() / 7 - 1)] + ' ' + days[date.getDay()]
    )
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