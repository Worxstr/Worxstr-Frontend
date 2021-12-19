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
        v-toolbar-title.text-h6 {{ editing ? 'Editing shift' : 'Assigning new shift' }}

      v-divider

      v-card-text

        v-subheader Date and time

        .d-flex.flex-column.flex-md-row.gap-small
          //- Start date
          datetime-input(
            v-model='editedShift.time_begin'
            outlined
            label='Start'
          )
          //- End date
          datetime-input(
            v-model='editedShift.time_end'
            outlined
            label='End'
          )

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
          autofocus
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


        v-subheader Shift notes

        richtext-field.my-6(placeholder='Shift notes' v-model='editedShift.notes')

        //- pre {{editedShift.tasks}}
        v-subheader Tasks
        task-list-input.mb-4(v-model='editedShift.tasks' editable orderable)
        //- v-divider

        //- Recurrence section
        //- v-checkbox(label='Recurring' v-model='recurring' hide-details)

        //- v-expand-transition
        //-   recurring-date-input.mt-4(v-show='recurring')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(
          text
          color='green'
          @click='updateShift'
          :disabled='!isValid'
          data-cy='create-shift-button'
        ) {{ editing ? 'Save' : 'Assign' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import dayjs from 'dayjs'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { User } from '@/types/Users'
import { Shift } from '@/types/Jobs'
import { createShift, updateShift } from '@/services/jobs'
import { exists } from '@/util/inputValidation'

import DatetimeInput from '@/components/inputs/DatetimeInput.vue'
import RichtextField from '@/components/inputs/RichtextField.vue'
import TaskListInput from '@/components/inputs/TaskListInput.vue'
import RecurringDateInput from '@/components/inputs/RecurringDateInput.vue'

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
const nowLocal = dayjs(now).format('YYYY-MM-DDTHH:mm:ss')
const hourFromNowLocal = dayjs(hourFromNow).format('YYYY-MM-DDTHH:mm:ss')

function initialState() {
  return {
    contractor_ids: [],
    site_locations: [],
    site_location: '',
    time_begin: nowLocal,
    time_end: hourFromNowLocal,
    notes: '',
    tasks: [],
  }
}

@Component({
  components: {
    DatetimeInput,
    RichtextField,
    TaskListInput,
    RecurringDateInput,
  },
})
export default class EditShiftDialog extends Vue {
  recurring = false
  ends = 'on'

  editedShift: any = initialState()
  isValid = false
  loading = false
  rules = {
    location: [exists('Location required')],
    date: [exists('Date required')],
    timeBegin: [exists('Start time required'), timeValidate('Time invalid')],
    timeEnd: [exists('End time required'), timeValidate('Time invalid')],
  }

  @Prop({ type: Object   }) readonly shift?: Shift
  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: []    }) readonly contractors!: (User | UnassignedContractor)[]
  @Prop({ default: false }) readonly editing!: boolean

  @Watch('opened')
  onOpened() {
    if (this.editing && this.shift) {
      this.editedShift = {
        ...this.shift,
      }
    }
    else {
      if (this.contractors.length) this.editedShift.contractor_ids = [this.contractors[0]?.id]
      this.editedShift.time_begin = this.editedShift?.time_begin
      this.editedShift.time_end = this.editedShift?.time_end
    }
  }

  closeDialog() {
    this.editedShift = initialState()
    this.$emit('update:opened', false)
  }

  get contractorsSorted() {
    return this.contractors.sort((a: any, b: any) => {
      return (a.direct === b.direct) ? 0 : (a.direct ? -1 : 1)
    })
  }

  contractorName(contractorId: number) {
    const e: any = this.contractors.find((e) => e.id == contractorId)
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
      if (this.editing) {
        await updateShift(this.$store, this.editedShift)
      }
      else {
        await createShift(
          this.$store,
          this.editedShift,
          parseInt(this.$route.params.jobId),
        )
      }

      this.closeDialog()
    } finally {
      this.loading = false
    }
  } 
}
</script>
