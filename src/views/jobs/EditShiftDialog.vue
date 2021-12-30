<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='700'
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if='loading' absolute opacity='.2')
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent='updateShift'
      ref='form'
      v-model='isValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{ editing ? 'Editing shift' : (`Assigning new shift${editedShift.contractor_ids.length>1 ? 's' : ''}`) }}

      v-divider

      v-card-text

        div(v-if='!jobId')
          v-subheader Job selection

          v-select(
            v-model='selectedJob'
            :items='jobs'
            item-text='name'
            item-value='id'
            outlined
            dense
            required
            label='Job'
            autofocus
            @change='onSelectedJob'
          )

        v-subheader Date and time

        recurring-date-input.my-4(v-model='recurData' :recurrable='!editing' :time='time')

        v-divider.mb-4

        v-subheader Contractors and locations

        //- Contractor selector

        //- Single selection for editing
        v-select(
          v-if='editing'
          v-model='editedShift.contractor_id'
          :items='contractors'
          :item-text="(e) => (e.id > 0 ? `${e.first_name} ${e.last_name}` : `Unassigned ${-e.id}`)"
          item-value='id'
          outlined
          dense
          required
          label='Contractor'
          data-cy='shift-contractor'
        )
        //- Multi selection for creating
        v-select(
          v-else
          v-model='editedShift.contractor_ids'
          :items='contractors'
          :item-text="(e) => (e.id > 0 ? `${e.first_name} ${e.last_name}` : `Unassigned ${-e.id}`)"
          item-value='id'
          outlined
          dense
          required
          multiple
          label='Contractors'
          data-cy='shift-contractors'
          :loading='loadingJob'
        )
          template(v-slot:item='{ active, item, attrs, on }')
            v-list-item(v-on='on' v-bind='attrs' #default='{ active }')
              v-list-item-action
                v-checkbox(:input-value='active')
              v-list-item-content
                v-list-item-title
                  v-row(no-gutters align='center')
                    span(v-if='item.id > 0') {{ item | fullName }}
                    span(v-else) Unassigned {{ -item.id }}
                    v-spacer
                    v-chip(small v-if='!item.direct && item.id > 0') {{ !item.direct && 'Indirect' }}

          //- template(v-slot:append-item)
          //-   v-divider
          //-   v-list-item(ripple, @click="addUnassignedContractor")
          //-     v-list-item-avatar(
          //-       :color="`grey ${$vuetify.theme.dark ? 'darken' : 'lighten'}-3`"
          //-     )
          //-       v-icon mdi-plus
          //-     v-list-item-content
          //-       v-list-item-title Add unassigned

        //- Location fields

        //- Single field for editing
        v-text-field(
          v-if='editing'
          v-model='editedShift.site_location'
          :rules='rules.location'
          label='Site location'
          :placeholder='randomSiteLocation()'
          outlined
          dense
          required
          data-cy='shift-site-location'
        )

        //- Multiple fields for creating
        div(v-else-if="editedShift.contractor_ids && editedShift.contractor_ids.length")

          v-expand-transition(
            appear,
            v-for="(contractorId, index) in editedShift.contractor_ids",
            :key="contractorId"
          )
            v-text-field(
              v-model="editedShift.site_locations[index]",
              :label="`Site location for ${contractorName(contractorId)}`"
              :placeholder='randomSiteLocation()'
              :rules="rules.location"
              outlined
              dense
              required
              :data-cy="`shift-site-location-${index}`"
            )

        v-divider.mb-4

        v-subheader Shift notes

        richtext-field.my-6(placeholder='Shift notes' v-model='editedShift.notes')

        //- pre {{editedShift.tasks}}
        v-subheader Tasks
        task-list-input.mb-4(v-model='editedShift.tasks' editable :orderable='!editing')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(
          text
          color='green'
          @click='updateShift'
          :disabled='!isValid'
          data-cy='save-shift-button'
        ) {{ editing ? 'Save' : 'Assign' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import dayjs from 'dayjs'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { User } from '@/types/Users'
import { Job, Shift } from '@/types/Jobs'
import { createShift, updateShift } from '@/services/shifts'
import { loadJob } from '@/services/jobs'
import { exists } from '@/util/inputValidation'

import RichtextField from '@/components/inputs/RichtextField.vue'
import TaskListInput from '@/components/inputs/TaskListInput.vue'
import RecurringDateInput from '@/components/inputs/RecurringDateInput.vue'
import DatetimeInput from '@/components/inputs/DatetimeInput.vue'

const timeValidate = (errorMessage: string) => (value: any) =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)

interface UnassignedContractor {
  id: number
}

@Component({
  components: {
    RichtextField,
    TaskListInput,
    RecurringDateInput,
    DatetimeInput,
  },
})
export default class EditShiftDialog extends Vue {

  @Prop({ type: Object   }) readonly shift?: Shift
  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly editing!: boolean
  // @Prop({ default: []    }) readonly contractors!: (User | UnassignedContractor)[]
  // If no jobId specified, then we add a job selector to the dialog
  @Prop({ type: Number    }) readonly jobId!: number
  @Prop({ type: Object }) readonly time?: {
    start: Date
    end: Date
  }

  initialState() {
    return {
      contractor_ids: [],
      site_locations: [],
      site_location: '',
      time_begin: '',
      time_end: '',
      notes: '',
      tasks: [],
    }
  }

  ends = 'on'
  editedShift: any = this.initialState()
  selectedJob: Job | null = null
  recurData: any = {}
  isValid = false
  loading = false
  loadingJob = false
  rules = {
    location: [exists('Location required')],
    date: [exists('Date required')],
    timeBegin: [exists('Start time required'), timeValidate('Time invalid')],
    timeEnd: [exists('End time required'), timeValidate('Time invalid')],
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    if (!opened) return

    this.editedShift = this.initialState()

    // Editing existing shift, fill data
    if (this.editing && this.shift) {
      this.editedShift = {
        ...this.shift,
      }
    }
    // Creating new shift, prefill fields
    else {
      if (this.contractors.length) this.editedShift.contractor_ids = [this.contractors[0]?.id]
    }

    if (!this.jobId) {
      // Pick first job for selector
      this.selectedJob = this.jobs[0].id ?? null
      this.onSelectedJob(this.selectedJob)
    }
  }

  async onSelectedJob(jobId: number) {
    if (!jobId) return

    this.loadingJob = true
    // Query job to get the contractors data
    // TODO: Make route for only the contractors of a job
    try {
      await loadJob(this.$store, jobId)
      // When the job loads, for some reason the selected job gets cleared.
      // For now, just set it again. This method gets called again on change but there are no params passed, so no infinite loop.
      this.selectedJob = jobId
    }
    finally {
      this.loadingJob = false
    }
  }

  closeDialog() {
    this.editedShift = this.initialState()
    this.$emit('update:opened', false)
  }

  get jobs() {
    return this.$store.getters.jobs
  }

  get contractors() {
    const jobId = this.jobId ?? this.selectedJob
    return this.$store.getters.job(jobId)?.contractors ?? []

    // TODO: Sort
    // return this.contractors.sort((a: any, b: any) => {
    //   return (a.direct === b.direct) ? 0 : (a.direct ? -1 : 1)
    // })
  }

  contractorName(contractorId: number) {
    const e: any = this.contractors.find((e: User) => e.id == contractorId)
    if (contractorId > 0) return `${e.first_name} ${e.last_name}`
    return `Unassigned ${-contractorId}`
  }

  randomSiteLocation() {
    const examples = ['Front of store', 'Back of store', 'Outside', 'Front desk', 'Kitchen', 'Main site', 'West wing', 'East wing']
    return 'Ex. ' +  examples[Math.floor(Math.random() * examples.length)]
  }

  /*
    List of selected contractors contains negative IDs to represent unassigned contractors
    Every value has to be unique, so the values cannot be all 'null'. Before
    sending off the request to create the shift, the negative values are converted to nulls
  */
  lastId = -1
  addUnassignedContractor() {
    this.contractors.push({
      id: this.lastId,
    })
    this.editedShift.contractor_ids.push(this.lastId)
    this.lastId--
  }

  async updateShift() {
    this.loading = true

    // TODO: Validate shifts so that end time is after start time
    try {
      const editedShift = {
        ...this.editedShift,
        ...this.recurData
      }

      if (this.editing) {
        await updateShift(this.$store, editedShift)
      }
      else {
        await createShift(
          this.$store,
          editedShift,
          this.jobId ?? this.selectedJob?.id,
        )
      }

      this.closeDialog()
    } finally {
      this.loading = false
    }
  } 
}
</script>
