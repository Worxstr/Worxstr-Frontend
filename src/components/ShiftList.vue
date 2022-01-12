<template lang="pug">
div
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

  v-card.soft-shadow(outlined rounded)
    v-list
      v-skeleton-loader(
        v-if='loading && (!shifts.length)'
        v-for='(v, i) in [1,2,3,4,5,6]'
        :key='i'
        type="list-item-two-line"
      )

      v-list-item(
        v-for='(shift, i) in sortedShifts'
        :key='shift.id'
      )
        v-list-item-content
          v-list-item-title
            router-link.alt-style.my-1.font-weight-medium(
              :to="{name: 'shift', params: {jobId: shift.job_id, shiftId: shift.id}}"
            ) {{ shift.site_location }}

          v-list-item-subtitle
            router-link.alt-style.my-1.font-weight-medium(
              v-if='shift.contractor_id && userIsManager'
              :to="{name: 'user', params: {userId: shift.contractor_id}}"
            ) {{ getContractor(shift.contractor_id) | fullName }}
          
            //- span(v-if='!userIsManager') {Job name} &bull; {n} tasks

        v-list-item-action(v-if='userIsManager || i != 0')
          .d-flex.flex-column.align-end
            .text-body-2.font-weight-medium {{ shift.time_begin | date('MMM D, YYYY') }}
            .text-body-2 {{ shift.time_begin | time }} - {{ shift.time_end | time }}

        v-list-item-action(v-if='!userIsManager && shiftIsActive(shift)')
          clock-buttons(:shift='shift')

        v-list-item-action.ml-3(v-if='userIsManager')
          v-btn(
            @click.stop='openEditShiftDialog(shift)'
            icon
            color='primary'
            data-cy='edit-shift-button'
          )
            v-icon mdi-pencil
            
        v-list-item-action(v-if='userIsManager')
          v-btn(
            @click.stop='openDeleteShiftDialog(shift)'
            :disabled='!!shift.clock_history.length'
            icon
            color='error'
            data-cy='delete-shift-button'
          )
            v-icon mdi-delete

        v-list-item-action(:class="{'ml-0': userIsManager}")
          v-btn(
            icon
            :to="{name: 'shift', params: {jobId: shift.job_id, shiftId: shift.id}}"
          )
            v-icon mdi-chevron-right
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Shift } from '@/types/Jobs'
import { Managers, currentUserIs } from '@/types/Users'
import { ClockAction } from '@/types/Clock'

import ClockButtons from '@/components/ClockButtons.vue'
import EditShiftDialog from '@/views/jobs/EditShiftDialog.vue'
import DeleteShiftDialog from '@/views/jobs/DeleteShiftDialog.vue'

@Component({
  components: {
    ClockButtons,
    EditShiftDialog,
    DeleteShiftDialog,
  },
})
export default class ShiftList extends Vue {
  
  @Prop({ default: () => [] }) shifts!: Shift[]
  @Prop({ default: false }) loading!: boolean

  selectedShift: Shift | {} = {}
  editShiftDialog = false
  deleteShiftDialog = false

  get userIsManager() {
    return currentUserIs(...Managers)
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