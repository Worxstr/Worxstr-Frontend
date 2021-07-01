<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      v-if="editedShift",
      @submit.prevent="updateShift",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title {{ create ? 'Creating shift' : 'Editing shift' }}

      v-divider

      v-card-text.pt-0
        v-subheader Contractor shifts

        //- Contractor selector
        v-select(
          autofocus
          v-model="editedShift.contractor_ids",
          :items="employees",
          :item-text="(e) => (e.id > 0 ? `${e.first_name} ${e.last_name}` : `Unassigned ${-e.id}`)",
          :item-value="'id'",
          outlined,
          multiple,
          dense,
          required,
          label="Contractors"
        )
          template(v-slot:append-item)
            v-divider
            v-list-item(ripple, @click="addUnassignedContractor")
              v-list-item-avatar(
                :color="`grey ${$vuetify.theme.dark ? 'darken' : 'lighten'}-3`"
              )
                v-icon mdi-plus
              v-list-item-content
                v-list-item-title Add unassigned

        //- Location fields
        div(v-if="editedShift.contractor_ids.length")
          v-divider
          v-subheader Site locations

          v-expand-transition(
            appear,
            v-for="(contractorId, index) in editedShift.contractor_ids",
            :key="contractorId"
          )
            v-text-field(
              v-model="editedShift.contractor_locations[index]",
              :label="`Location for ${contractorName(contractorId)}`",
              :rules="rules.location",
              outlined,
              dense,
              required
            )

        v-divider

        v-subheader Date and time

        //- Start date
        v-text-field(
          type="datetime-local",
          label="Start",
          dense,
          outlined,
          required,
          v-model="editedShift.time_begin"
        )
        //- End date
        v-text-field(
          type="datetime-local",
          label="End",
          dense,
          outlined,
          required,
          v-model="editedShift.time_end"
        )

        v-divider

        //- Recurrence section
        v-checkbox(label="Recurring", v-model="recurring", hide-details)

        v-expand-transition
          .pt-5(v-show="recurring")
            //- Repeat every {num} {day,week,month,year}
            .d-flex.align-center
              p.text-no-wrap.mb-6.mr-1 Repeat every
              v-text-field.px-2(
                outlined,
                dense,
                v-model.number="editedShift.repeat.repeatEvery.value",
                type="number",
                increment="1",
                min="1",
                :rules="rules.repeatEvery"
              )
              v-select(
                outlined,
                dense,
                v-model="editedShift.repeat.repeatEvery.unit",
                :items="[{ text: 'day' }, { text: 'week' }, { text: 'month' }, { text: 'year' }]",
                :item-text="(i) => `${i.text}${editedShift.repeat.repeatEvery.value == 1 ? '' : 's'}`",
                item-value="text"
              )

            //- Week option
            div(v-if="editedShift.repeat.repeatEvery.unit == 'week'")
              p.text-no-wrap.mb-0 Repeat on
              weekday-selector(v-model="editedShift.repeat.weekly")

            //- Month option
            .d-flex.align-center(
              v-if="editedShift.repeat.repeatEvery.unit == 'month'"
            )
              p.text-no-wrap.mb-6.mr-1 Repeat on
              v-select.px-2(
                outlined,
                dense,
                v-model="editedShift.repeat.monthly",
                :items="[ {\
                  value: 'byDate',\
                  text: `Monthly on day ${(new Date()).getDate()}`\
                }, {\
                  value: 'byDay',\
                  text: `Monthly on ${weekAndDay(new Date())}`\
                }, ]"
              )

            //- End on selector
            p.text-no-wrap.mb-0 Ends
            v-radio-group(v-model="ends")
              .d-flex.mb-2
                v-radio.mr-4.mr-sm-0(
                  value="on",
                  label="On",
                  :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
                )
                v-text-field(
                  v-model="editedShift.repeat.ends.date",
                  outlined,
                  dense,
                  hide-details,
                  type="datetime-local",
                  :disabled="ends == 'after'",
                  :rules="rules.endsOn"
                )
              .d-flex
                v-radio.mr-4.mr-sm-0(
                  value="after",
                  label="After",
                  :style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`"
                )
                v-text-field(
                  v-model.number="editedShift.repeat.ends.occurences",
                  outlined,
                  dense,
                  hide-details,
                  type="number",
                  increment="1",
                  min="1",
                  suffix="occurences",
                  value="1",
                  :disabled="ends == 'on'"
                )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", @click="updateShift", :disabled="!isValid")
          | {{ create ? 'Create' : 'Save' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import dayjs from 'dayjs'
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { User } from "@/definitions/User"
import { Shift } from "@/definitions/Job"

import WeekdaySelector from '@/components/inputs/WeekdaySelector.vue'

// TODO: Move these to reusable import
const exists = (errorMessage: string) => (value: any) => !!value || errorMessage
const timeValidate = (errorMessage: string) => (value: any) =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)

interface UnassignedContractor {
  id: number;
}

const now = new Date()
if (now.getMinutes() != 0) now.setHours(now.getHours() + 1)
now.setSeconds(0, 0)
now.setMinutes(0)
const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const nowLocal = dayjs(now).format('YYYY-MM-DDTHH:mm:ss')
const hourFromNowLocal = dayjs(hourFromNow).format('YYYY-MM-DDTHH:mm:ss')
const weekFromNowLocal = dayjs(weekFromNow).format('YYYY-MM-DDTHH:mm:ss')

@Component({
  components: {
    WeekdaySelector
  }
})
export default class EditShiftDialog extends Vue {

  recurring = false
  ends = 'on'

  editedShift: any = {
    contractor_ids: [],
    contractor_locations: [],
    time_begin: nowLocal,
    time_end: hourFromNowLocal,
    repeat: {
      repeatEvery: {
        value: 1,
        unit: 'week',
      },
      weekly: ['m', 't', 'w', 'tr', 'f'],
      monthly: 'byDate',
      ends: {
        date: weekFromNowLocal,
        occurences: 10
      }
    }
  }
  isValid = false
  loading = false
  rules = {
    location: [exists("Location required")],
    date: [exists("Date required")],
    timeBegin: [exists("Start time required"), timeValidate("Time invalid")],
    timeEnd: [exists("End time required"), timeValidate("Time invalid")],
    repeatEvery: [exists("Repeat required")],
    endsOn: [exists("End date required")],
    endsAfter: [exists("Number of occurences required")],
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean // Creating new shift or editing existing
  @Prop({ default: [] }) readonly contractors!: (User | UnassignedContractor)[]
  @Prop(Object) readonly shift: Shift | undefined

  closeDialog() {
    if (this.create) (this.$refs.form as HTMLFormElement).reset()
    this.$emit("update:opened", false);
  }

  contractorName(contractorId: number) {
    const e: any = this.contractors.find(e => e.id == contractorId)
    if (contractorId > 0) return `${e.first_name} ${e.last_name}`
    return `Unassigned ${-contractorId}`
  }

  weekAndDay(date: Date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      prefixes = ['first', 'second', 'third', 'fourth', 'fifth']

    return prefixes[Math.ceil(date.getDate() / 7 - 1)] + ' ' + days[date.getDay()]
  }

  /* 
    List of selected contractors contains negative IDs to represent unassigned contractors
    Every value has to be unique, so the values cannot be all 'null'. Before
    sending off the request to create the shift, the negative values are converted to nulls
  */
  lastId = -1
  addUnassignedContractor() {
    this.contractors.push({
      id: this.lastId
    })
    this.editedShift.contractor_ids.push(this.lastId)
    this.lastId--
  }

  async updateShift() {
    this.loading = true

    // Build request object
    const shift = {
      ...this.editedShift,
      contractors: this.editedShift.contractor_ids.map((id: number, index: number) => ({
        id: id < 0 ? null : id, // Convert negative (unassigned) contractor ids to nulls
        site_location: this.editedShift.contractor_locations[index]
      }))
    }
    // Correct date strings
    shift.time_begin = (new Date(shift.time_begin)).toISOString(),
      shift.time_end = (new Date(shift.time_end)).toISOString(),
      shift.repeat.ends.date = (new Date(shift.repeat.ends.date)).toISOString()

    // Delete unwanted fields
    delete shift.contractor_ids
    delete shift.contractor_locations
    if (!this.recurring) delete shift.repeat
    else {
      if (shift.repeat.repeatEvery.unit != 'week') delete shift.repeat.weekly
      if (shift.repeat.repeatEvery.unit != 'month') delete shift.repeat.monthly

      if (this.ends == 'on') delete shift.repeat.ends.occurences
      else {
        shift.repeat.ends.occurences = +shift.repeat.ends.occurences
        delete shift.repeat.ends.date
      }
    }

    // TODO: Validate shifts so that end time is after start time
    try {
      if (this.create)
        await this.$store.dispatch("createShift", {
          shift,
          jobId: this.$route.params.jobId,
        })
      else
        await this.$store.dispatch("updateShift", shift)
      this.closeDialog()
    }
    finally {
      this.loading = false
    }
  }
}
</script>