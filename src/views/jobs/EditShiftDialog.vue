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
        v-subheader Employee shifts

        //- Employee selector
        v-select(
          v-model="editedShift.employee_ids",
          :items="employees",
          :item-text="(e) => e.id > 0 ? `${e.first_name} ${e.last_name}` : `Unassigned ${-e.id}`",
          :item-value="'id'",
          outlined,
          multiple
          dense,
          required,
          label="Employees"
        )
          template(v-slot:append-item)
            v-divider
            v-list-item(ripple @click='addUnassignedEmployee')
              v-list-item-avatar(:color="`grey ${$vuetify.theme.dark ? 'darken' : 'lighten'}-3`")
                v-icon mdi-plus
              v-list-item-content
                v-list-item-title Add unassigned
        
        //- Location fields
        div(v-if='editedShift.employee_ids.length')
          v-divider
          v-subheader Site locations
          
          v-expand-transition(appear v-for='employeeId in editedShift.employee_ids' :key='employeeId')
            v-text-field(
              v-model="editedShift.site_location",
              :label="`Location for ${employeeName(employeeId)}`",
              :rules="rules.location",
              outlined,
              dense,
              required,
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
          v-model="editedShift.time_begin",
        )
        //- End date
        v-text-field(
          type="datetime-local",
          label="End",
          dense,
          outlined,
          required,
          hide-details,
          v-model="editedShift.time_end",
        )

        //- Recurrence section
        v-checkbox(label="Recurring shift" v-model='recurring')

        v-expand-transition
          div(v-show='recurring')

            //- Repeat every {num} {day,week,month,year}
            .d-flex.align-center
              p.text-no-wrap.mb-6.mr-1 Repeat every
              v-text-field.px-2(
                outlined,
                dense,
                v-model='editedShift.repeat.repeatEvery.value'
                type="number",
                increment="1",
                min="1"
              )
              v-select(
                outlined,
                dense,
                v-model='editedShift.repeat.repeatEvery.unit'
                :items="[{ text: 'day' }, { text: 'week' }, { text: 'month' }, { text: 'year' }]"
              )

            //- Weekday selector
            p.text-no-wrap.mb-0 Repeat on
              weekday-selector(
                v-if='editedShift.repeat.repeatEvery.unit == "week"'
                v-model='editedShift.repeat.repeatOn'
              )

            //- End on selector
            p.text-no-wrap.mb-0 Ends
            v-radio-group()
              v-radio(value='on')
                template(v-slot:label)
                  span.mr-3.mr-sm-0(:style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`") On
                  v-text-field(outlined dense hide-details type='datetime-local')
              v-radio(value='after')
                template(v-slot:label)
                  span.mr-3.mr-sm-0(:style="`width: ${$vuetify.breakpoint.smAndUp ? '100px' : 'auto'}`") After
                  v-text-field(outlined dense hide-details type='number' increment='1' min='1' suffix='occurences' value='1')

      code {{editedShift}}
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

import WeekdaySelector from '@/components/inputs/WeekdaySelector.vue'

// TODO: Move these to reusable import
const exists = (errorMessage: string) => (value: any) => !!value || errorMessage
const timeValidate = (errorMessage: string) => (value: any) =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)

interface UnassignedEmployee {
  id: number;
}

const now: string | Date = new Date()
      now.setSeconds(0,0)
      now.setMinutes(0)
const nowISO = now.toISOString().replace('Z','')
const hourFromNowISO = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace('Z','')

@Component({
  components: {
    WeekdaySelector
  }
})
export default class EditShiftDialog extends Vue {
  
  recurring = false

  editedShift: any = {
    employee_ids: [],
    site_location: '',
    time_begin: nowISO,
    time_end: hourFromNowISO,
    repeat: {
      repeatEvery: {
        value: 1,
        unit: 'week',
      },
      repeatOn: ['m','t','w','tr','f'],
      ends: {
        date: '2021-06-01T21:03:00Z'
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
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean // Creating new shift or editing existing
  @Prop({ default: [] }) readonly employees!: (User|UnassignedEmployee)[] 
  @Prop(Object) readonly shift: Shift | undefined

  closeDialog() {
    if (this.create) (this.$refs.form as HTMLFormElement).reset()
    this.$emit("update:opened", false);
  }

  employeeName(employeeId: number) {
    const e: any = this.employees.find(e => e.id == employeeId)

    if (employeeId > 0) return `${e.first_name} ${e.last_name}`
    
    return `Unassigned ${-employeeId}`
    
  }
  
  /* 
    List of selected employees contains negative IDs to represent unassigned employees
    Every value has to be unique, so the values cannot be all 'null'. Before
    sending off the request to create the shift, the negative values are converted to nulls
  */
  lastId = -1
  addUnassignedEmployee() {
    this.employees.push({
      id: this.lastId
    })
    this.editedShift.employee_ids.push(this.lastId)
    this.lastId--
  }

  async updateShift() {
    this.loading = true

    // Convert negative (unassigned) employee ids to nulls
    this.editedShift.employee_ids = this.editedShift.employee_ids.map((id: number) => {
      id < 0 ? -id : id
    })

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