<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="600",
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(@submit.prevent="updateTimecard", v-model="form.isValid" v-if="timecard")
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{ timecard | fullName }}'s timecard

      v-divider
          
      v-card-text
        datetime-input(
          outlined
          v-model="form.data.timeIn.time"
          label="Time in"
        )

        .mb-5(v-for="(breakItem, index) in form.data.breaks", :key="index")
          v-row
            v-col
              datetime-input(
                outlined
                required
                hide-details
                v-model="breakItem.start.time"
                :label="`Break ${index + 1} start`"
              )
            v-col
              datetime-input(
                outlined
                required
                hide-details
                v-model="breakItem.end.time"
                :label="`Break ${index + 1} end`"
              )

        datetime-input(
          outlined
          required
          v-model="form.data.timeOut.time"
          label="Time out"
        )

      v-spacer
      
      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", @click="updateTimecard") Save

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

// TODO: Convert this file to typescript
// TODO: Add chronology validation

dayjs.extend(duration)

@Component({
  components: { DatetimeInput },
})
export default class EditTimecardDialog extends Vue {
  
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
  @Prop({ type: Number }) timecardId

  get timecard() {
    return this.$store.getters.timecard(this.timecardId)
  }

  @Watch('timecardId')
  onTimecardIdChanged() {
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
    const events = this.timecard.time_clocks

    this.form.data.timeIn = Object.assign({}, events[0])
    this.form.data.timeOut = Object.assign({}, events[events.length - 1])

    const breakEvents = events.slice(1, events.length - 1),
          breaks = []

    for (let i = 0; i < breakEvents.length; i += 2) {
      breaks.push({
        start: breakEvents[i],
        end: breakEvents[i + 1],
      })
    }
    this.form.data.breaks = breaks
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

  async updateTimecard() {
    const newTimeclockEvents = []

    newTimeclockEvents.push(this.form.data.timeIn)
    this.form.data.breaks.forEach((breakItem) => {
      newTimeclockEvents.push(breakItem.start)
      newTimeclockEvents.push(breakItem.end)
    })
    newTimeclockEvents.push(this.form.data.timeOut)

    this.loading = true

    try {
      await payments.updateTimecard(
        this.$store,
        this.timecard.id,
        newTimeclockEvents,
      )
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
