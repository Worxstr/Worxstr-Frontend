<template lang="pug">
div
  //- :contractors='job.contractors'
  edit-shift-dialog(
    :opened.sync='createShiftDialog',
    :job-id='selectedShift.job_id'
  )
  edit-shift-dialog(
    :editing='true'
    :shift.sync='selectedShift'
    :opened.sync='editShiftDialog'
    :job-id='selectedShift.job_id'
  )
  delete-shift-dialog(
    v-if="selectedShift",
    :opened.sync="deleteShiftDialog",
    :shift.sync="selectedShift",
    :contractorName="contractorName(selectedShift.contractor_id)"
  )

  multiselect-list(
    :items='sortedShifts'
    :loading='loading'
    :show-checkboxes='userIsManager'
  )
    template(#title) Upcoming shifts

    template(#actions)
      v-btn(
        v-if='userIsManager'
        text
        color='primary'
        @click='createShiftDialog = true'
        :icon='$vuetify.breakpoint.xs'
        data-cy='assign-shift-button'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-clipboard-plus-outline
        span(v-if='!$vuetify.breakpoint.xs') Assign shift
    
    template(#content='{ item }')

      v-list-item-title
        router-link.alt-style.my-1.font-weight-medium(
          :to="{name: 'shift', params: {jobId: item.job_id, shiftId: item.id}}"
        ) {{ item.site_location }}

      v-list-item-subtitle
        router-link.alt-style.my-1.font-weight-medium(
          v-if='item.contractor_id && userIsManager'
          :to="{name: 'user', params: {userId: item.contractor_id}}"
        )
          | {{ getContractor(item.contractor_id) | fullName }}

        span(v-if='item.clock_history.length')
          | &nbsp;- {{ item.clock_history.length }} {{ item.clock_history.length == 1 ? 'event' : 'events'}}
      
    template(#item-actions='{ item }')
      .d-flex(v-if='item')

        v-list-item-action.mr-2(v-if='userIsContractor ? !shiftIsActive(item) : !$vuetify.breakpoint.xs')

          .d-flex.flex-column.align-end
            .text-body-2.font-weight-medium {{ item.time_begin | date('MMM D, YYYY') }}
            .text-body-2 {{ item.time_begin | time }} - {{ item.time_end | time }}

        v-list-item-action.mr-2(v-if='userIsContractor && shiftIsActive(item)')
          clock-buttons(:shift='item')

        v-list-item-action.mx-0
          v-btn(
            icon
            :to="{name: 'shift', params: {jobId: item.job_id, shiftId: item.id}}"
          )
            v-icon mdi-chevron-right

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Shift } from '@/types/Jobs'
import { Managers, currentUserIs, UserRole } from '@/types/Users'
import { ClockAction } from '@/types/Clock'

import MultiselectList from '@/components/MultiselectList.vue'
import ClockButtons from '@/components/ClockButtons.vue'
import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'
import DeleteShiftDialog from '@/views/jobs/DeleteShiftDialog.vue'

@Component({
  components: {
    MultiselectList,
    ClockButtons,
    EditShiftDialog,
    DeleteShiftDialog,
  },
})
export default class ShiftList extends Vue {
  
  @Prop({ default: () => [] }) shifts!: Shift[]
  @Prop({ default: false }) loading!: boolean

  selectedShift: Shift | {} = {}
  createShiftDialog = false
  editShiftDialog = false
  deleteShiftDialog = false

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get userIsContractor() {
    return currentUserIs(UserRole.Contractor)
  }

  get sortedShifts() {
    return this.shifts.sort((a, b) => {
      if (a.time_begin < b.time_begin) return -1
      if (a.time_begin > b.time_begin) return 1
      if (a.time_end < b.time_end) return -1
      if (a.time_end > b.time_end) return 1
      return 0
    })
  }

  shiftIsActive(shift: Shift) {
    const now = new Date()
    const start = new Date(shift.time_begin)
    const end = new Date(shift.time_end)
    const active = now >= start && now <= end

    let clockedIn = false
    if (shift.clock_state !== null) {
      clockedIn = shift.clock_state != ClockAction.ClockOut
    }

    return clockedIn || active // TODO: || isOnSite || jobHasNoRestrictions
  }

  // If any selected shifts have a clock history, disable delete button
  get canDeleteSelected() {
    return this.selectedShifts
      .map(shiftId => this.shifts.find(shift => shift.id === shiftId))
      .every(shift => !shift?.clock_history.length)
  }

  getContractor(contractorId: number) {
    return this.$store.getters.user(contractorId)
  }

  contractorName(contractorId: number) {
    return 'name'
    // if (!this.job.contractors) return ''
    // const contractor = this.job.contractors.find((e) => e.id == contractorId)
    // if (!contractor) return 'Unknown contractor'
    // return `${contractor.first_name} ${contractor.last_name}`
  }

  openEditShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.editShiftDialog = true
  }

  openDeleteShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.deleteShiftDialog = true
  }

}
</script>