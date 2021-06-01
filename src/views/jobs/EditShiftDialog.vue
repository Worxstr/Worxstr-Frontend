<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="600",
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
          hide-details
        )

        v-subheader Date and time
        
        v-row
          v-col
            v-text-field(
              type="datetime-local",
              label="Start"
              dense,
              outlined,
              required
              hide-details
              v-model='editedShift.time_begin'
              :value='new Date(new Date(new Date().setSeconds(0,0)).setMinutes(0)).toISOString().replace("Z","")'
            )
          v-col
            v-text-field(
              type="datetime-local",
              label="End"
              dense,
              outlined,
              required
              hide-details
              v-model='editedShift.time_end'
              :value='new Date(new Date(new Date().setSeconds(0,0)).setMinutes(0) + 60 * 60 * 1000).toISOString().replace("Z","")'
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
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { User } from "@/definitions/User"
import { Shift } from "@/definitions/Job"

// TODO: Move these to reusable import
const exists = (errorMessage: string) => (value: any) => !!value || errorMessage
const timeValidate = (errorMessage: string) => (value: any) =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)


@Component
export default class EditShiftDialog extends Vue {

  editedShift: any = {}
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

  closeDialog() {
    this.$emit("update:opened", false);
    if (this.create) (this.$refs.form as HTMLFormElement).reset();
  }

  async updateShift() {
    this.loading = true

    // TODO: Validate shifts so that end time is after start time

    try {
      const shift = {
        ...this.editedShift,
        time_begin: (new Date(this.editedShift.time_begin)).toISOString(),
        time_end: (new Date(this.editedShift.time_end)).toISOString()
      }
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