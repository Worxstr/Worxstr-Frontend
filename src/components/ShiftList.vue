<template lang="pug">
div
  //- :contractors='job.contractors'
  edit-shift-dialog(
    :opened.sync='createShiftDialog'
    :job-id='jobId'
  )
  edit-shift-dialog(
    :editing='true'
    :shift-id.sync='selectedShiftIds[0]'
    :opened.sync='editShiftDialog'
    @saved='clearSelection'
  )
  delete-shift-dialog(
    v-if='selectedShift'
    :opened.sync='deleteShiftDialog'
    :shift-ids.sync='selectedShiftIds'
    @deleted='clearSelection'
  )

  multiselect-list(
    v-model='selectedShiftIds'
    :items='sortedShifts'
    :loading='loading'
    :show-checkboxes='userIsManager'
    item-name='shift'
    :two-line='true'
  )
    template(#title)
      span Upcoming shifts
      v-chip.mx-3.pa-2.font-weight-bold(small) {{ shifts.length }}

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

    template(#item-actions)
      v-btn(
        v-if='selectedShiftIds.length == 1'
        icon
        text
        color='primary'
        :icon='$vuetify.breakpoint.xs'
        @click='editShiftDialog = true'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
        span(v-if='!$vuetify.breakpoint.xs') Edit

      v-btn(
        v-if='selectedShiftIds.length'
        icon
        text
        color='error'
        :icon='$vuetify.breakpoint.xs'
        @click='deleteShiftDialog = true'
        :disabled='!canDeleteSelected'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-delete
        span(v-if='!$vuetify.breakpoint.xs') Delete {{ selectedShiftIds.length == 1 ? '' : (selectedShiftIds.length == shifts.length ? 'all' : selectedShiftIds.length) }}
    
    template(#content='{ item }')
      v-list-item-content
        v-list-item-title
          router-link.alt-style.my-1.font-weight-medium(
            :to="{name: 'shift', params: {jobId: item.job_id, shiftId: item.id}}"
          ) {{ item.site_location }}

        v-list-item-subtitle
          router-link.alt-style.my-1.font-weight-medium(
            v-if='item.contractor_id && userIsManager'
            :to="{name: 'user', params: {userId: item.contractor_id}}"
          )
            | {{ getContractor(item.contractor_id).name }}

          span(v-if='item.contractor_id && userIsManager && item.clock_history.length') &nbsp;-&nbsp;

          span(v-if='item.clock_history.length')
            | {{ item.clock_history.length }} {{ item.clock_history.length == 1 ? 'event' : 'events'}}
        

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
import { ClockAction } from '@/types/Jobs'

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
  @Prop({ type: Number }) jobId?: number

  selectedShift: Shift | {} = {} // TODO: Remove this
  selectedShiftIds: number[] = []
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

  clearSelection() {
    this.selectedShiftIds = []
  }

  // If any selected shifts have a clock history, disable delete button
  get canDeleteSelected() {
    return this.selectedShiftIds
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