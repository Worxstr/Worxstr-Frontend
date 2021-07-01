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
      @submit.prevent="createShift",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title Editing shift

      v-divider

      v-card-text

        //- Contractor selector
        v-select(
          v-model="editedShift.contractor_id",
          :items="contractors",
          :item-text="(e) => `${e.first_name} ${e.last_name}`",
          :item-value="'id'",
          outlined,
          dense,
          required,
          label='Contractor'
        )

        //- Location field
        v-text-field(
          v-model="editedShift.site_location",
          label="Site location",
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

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", @click="updateShift", :disabled="!isValid") Save
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { User } from '@/definitions/User'
import { Shift } from '@/definitions/Job'
import { exists } from '@/plugins/inputValidation'

import WeekdaySelector from '@/components/inputs/WeekdaySelector.vue'

@Component({
  components: {
    WeekdaySelector,
  },
})
export default class EditShiftDialog extends Vue {
  recurring = false
  ends = 'on'

  editedShift: any = {
    id: null,
    contractor_id: null,
    site_location: '',
    time_begin: '',
    time_end: '',
  }
  isValid = false
  loading = false
  rules = {
    location: [exists('Location required')],
    date: [exists('Date required')],
    timeBegin: [exists('Start time required')],
    timeEnd: [exists('End time required')],
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: [] }) readonly contractors!: User[]
  @Prop(Object) readonly shift: Shift | undefined

  @Watch('shift')
  onShiftUpdated(shift: Shift) {
    this.editedShift = shift
    this.editedShift.contractor_id = shift.employee_id
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  contractorName(contractorId: number) {
    const e: any = this.contractors.find((e) => e.id == contractorId)
    if (contractorId > 0) return `${e.first_name} ${e.last_name}`
    return `Unassigned ${-contractorId}`
  }

  async updateShift() {
    this.loading = true

    // Build request object
    const shift = {...this.editedShift, id: this.shift?.id }

    // Correct date strings
    shift.time_begin = new Date(shift.time_begin).toISOString()
    shift.time_end = new Date(shift.time_end).toISOString()

    try {
      await this.$store.dispatch('updateShift', shift)
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
