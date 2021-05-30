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

      v-card-text
        v-select(
          v-model="editedShift.employee_id",
          :items="employees",
          :item-text="(e) => `${e.first_name} ${e.last_name}`",
          :item-value="'id'",
          :rules="rules.employee",
          outlined,
          dense,
          required,
          label="Employee"
        )
        v-text-field(
          v-model="editedShift.site_location",
          label="Location",
          :rules="rules.location",
          outlined,
          dense,
          required
        )
        date-input(
          required,
          v-model="editedShift.date",
          label="Date",
          :rules="rules.date"
        )
        v-row
          v-col
            time-input(
              required,
              v-model="editedShift.time_begin",
              label="Start time",
              :rules="rules.timeBegin"
            )
          v-col
            time-input(
              required,
              v-model="editedShift.time_end",
              label="End time",
              :rules="rules.timeEnd"
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
import TimeInput from "@/components/inputs/TimeInput.vue"
import DateInput from "@/components/inputs/DateInput.vue"
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { User } from "@/definitions/User"
import { Shift } from "@/definitions/Job"

// TODO: Move these to reusable import
const exists = (errorMessage: string) => (value: any) => !!value || errorMessage
const timeValidate = (errorMessage: string) => (value: any) =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)


@Component({
  components: { TimeInput, DateInput },
})
export default class EditShiftDialog extends Vue {

  editedShift!: Shift
  isValid = false
  loading = false
  rules = {
    employee: [exists("Employee required")],
    location: [exists("Location required")],
    date: [exists("Date required")],
    timeBegin: [exists("Start time required"), timeValidate("Time invalid")],
    timeEnd: [exists("End time required"), timeValidate("Time invalid")],
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean // Creating new shift or editing existing
  @Prop({ default: [] }) readonly employees!: User[]
  @Prop(Object) readonly shift: Shift | undefined

  @Watch('opened')
  onOpened(newVal: boolean, oldVal: boolean) {
    // Set date string without time and assign copy to editedShift
    const date = this.shift ? this.shift.time_begin : undefined
    if (newVal == true) this.editedShift = Object.assign({ date: date }, this.shift)
  }

  closeDialog() {
    this.$emit("update:opened", false);
    if (this.create) (this.$refs.form as HTMLFormElement).reset();
  }

  async updateShift() {
    this.loading = true

    let { date, time_begin, time_end } = this.editedShift

    // TODO: Validate shifts so that end time is after start time

    // Concat the date input with time inputs
    date = date ? new Date(date) : new Date()
    const timeBegin = new Date(time_begin)
    const timeEnd = new Date(time_end)

    timeBegin.setUTCDate(date.getUTCDate())
    timeBegin.setUTCMonth(date.getUTCMonth())
    timeBegin.setUTCFullYear(date.getUTCFullYear())

    timeEnd.setUTCDate(date.getUTCDate())
    timeEnd.setUTCMonth(date.getUTCMonth())
    timeEnd.setUTCFullYear(date.getUTCFullYear())

    time_begin = timeBegin.toISOString()
    time_end = timeEnd.toISOString()

    if (this.create)
      await this.$store.dispatch("createShift", {
        shift: {
          ...this.editedShift,
          date,
          time_begin: timeBegin,
          time_end: timeEnd
        },
        jobId: this.$route.params.jobId,
      })
    else
      await this.$store.dispatch("updateShift", {
        ...this.editedShift,
        date,
        time_begin: timeBegin,
        time_end: timeEnd
      })

    console.log('worked')

    this.loading = false
    this.closeDialog()
  }
}
</script>