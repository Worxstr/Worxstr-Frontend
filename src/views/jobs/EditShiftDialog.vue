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
        v-toolbar-title.text-h6 Editing shift

      v-divider

      v-card-text
      
        richtext-field.mb-6(
          autofocus
          placeholder='Shift notes'
          v-model='editedShift.notes'
        )

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
          data-cy="shift-site-location"
        )
            
        v-divider

        v-subheader Date and time

        //- Start date
        datetime-input(
          v-model='editedShift.time_begin'
          outlined
          label='Start'
        )
        
        //- End date
        datetime-input(
          v-model="editedShift.time_end"
          outlined
          label='End'
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", @click="updateShift", :disabled="!isValid" data-cy="save-shift-button") Save
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { User } from '@/types/Users'
import { Shift } from '@/types/Jobs'
import { exists } from '@/util/inputValidation'
import { updateShift } from '@/services/jobs'

import DatetimeInput from '@/components/inputs/DatetimeInput.vue'
import WeekdaySelector from '@/components/inputs/WeekdaySelector.vue'
import RichtextField from '@/components/inputs/RichtextField.vue'

type ShiftForm = {
  id: number | null;
  contractor_id: number | null;
  site_location: string;
  time_begin: string;
  time_end: string;
}

@Component({
  components: {
    DatetimeInput,
    WeekdaySelector,
    RichtextField,
  },
})
export default class EditShiftDialog extends Vue {
  recurring = false
  ends = 'on'

  editedShift: ShiftForm = {
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
  @Prop(Object) readonly shift!: Shift

  @Watch('shift')
  onShiftUpdated(shift: Shift) {
    this.editedShift = {...shift}
    this.editedShift.contractor_id = shift.contractor_id
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  contractorName(contractorId: number) {
    const contractor: User | undefined = this.contractors.find((c) => c.id == contractorId)
    if (contractorId > 0) return `${contractor?.first_name} ${contractor?.last_name}`
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
      await updateShift(this.$store, shift)
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
