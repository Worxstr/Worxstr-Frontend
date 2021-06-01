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
        v-subheader Info

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
          required,
          hide-details
        )

        v-subheader Date and time

        v-text-field(
          type="datetime-local",
          label="Start",
          dense,
          outlined,
          required,
          v-model="editedShift.time_begin",
          :value="new Date(new Date(new Date().setSeconds(0, 0)).setMinutes(0)).toISOString().replace('Z', '')"
        )
        v-text-field(
          type="datetime-local",
          label="End",
          dense,
          outlined,
          required,
          hide-details,
          v-model="editedShift.time_end",
          :value="new Date(new Date(new Date().setSeconds(0, 0)).setMinutes(0) + 60 * 60 * 1000).toISOString().replace('Z', '')"
        )

        v-checkbox(label="Recurring shift")

        div
          .d-flex.align-center
            p.text-no-wrap.mb-6.mr-1 Repeat every
            v-text-field.px-2(
              outlined,
              dense,
              value="1",
              type="number",
              increment="1",
              min="1"
            )
            v-select(
              outlined,
              dense,
              value="week",
              :items="[{ text: 'day' }, { text: 'week' }, { text: 'month' }, { text: 'year' }]"
            )

          p.text-no-wrap.mb-0 Repeat on
          .d-flex.align-center.pt-1
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-s-circle",
              off-icon="mdi-alpha-s-circle-outline",
              value="sunday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-m-circle",
              off-icon="mdi-alpha-m-circle-outline",
              value="monday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-t-circle",
              off-icon="mdi-alpha-t-circle-outline",
              value="tuesday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-w-circle",
              off-icon="mdi-alpha-w-circle-outline",
              value="wednesday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-t-circle",
              off-icon="mdi-alpha-t-circle-outline",
              value="thursday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-f-circle",
              off-icon="mdi-alpha-f-circle-outline",
              value="friday"
            )
            v-checkbox.mt-0(
              v-model="editedShift.repeat.repeatOn",
              on-icon="mdi-alpha-s-circle",
              off-icon="mdi-alpha-s-circle-outline",
              value="saturday"
            )

          p.text-no-wrap.mb-0 Ends
          v-radio-group(v-model='idk')
            v-radio(value='on')
              template(v-slot:label)
                span.mr-3.mr-sm-0(:style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`") On
                v-text-field(outlined dense hide-details type='datetime-local')
            v-radio(value='after')
              template(v-slot:label)
                span.mr-3.mr-sm-0(:style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`") After
                v-text-field(outlined dense hide-details type='number' increment='1' min='1' suffix='occurences' value='1')

      //- code {{ editedShift }}

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
  editedShift: any = {
    employee_id: null,
    site_location: '',
    repeat: {
      repeatEvery: {
        value: 1,
        unit: 'week',
      },
      repeatOn: [],
      ends: {
        date: '2021-06-01T21:03:00Z'
      }
    }
  }
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