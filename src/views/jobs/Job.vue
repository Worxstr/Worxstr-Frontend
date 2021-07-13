<template lang="pug">
v-container(v-if="loading")
  v-card.pa-4
    v-skeleton-loader.py-2(type="image, image")
    v-skeleton-loader.py-2(type="sentences, sentences")

  v-skeleton-loader.mt-8.mb-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item"
  )

div(v-else)
  v-container.approvals.mb-50(v-if="job")
    edit-job-dialog(:opened.sync="editJobDialog", :job.sync="job")
    close-job-dialog(:opened.sync="closeJobDialog", :job.sync="job")
    edit-shift-dialog(
      :create="true",
      :opened.sync="addShiftDialog",
      :contractors="job.employees"
    )
    edit-shift-dialog(
      :opened.sync="editShiftDialog",
      :shift.sync="selectedShift",
      :contractors="job.employees"
    )
    delete-shift-dialog(
      v-if="selectedShift",
      :opened.sync="deleteShiftDialog",
      :shift.sync="selectedShift",
      :contractorName="contractorName(selectedShift.contractor_id)"
    )

    portal(to="toolbarActions")
      v-btn(
        v-if="userIsOrgManager",
        text,
        color="primary",
        @click="editJobDialog = true"
      ) Edit
      v-btn(
        v-if="userIsOrgManager",
        text,
        color="red",
        @click="closeJobDialog = true"
      ) Close

    v-card.mb-3.d-flex.flex-column
      GmapMap(
        v-if="job.latitude && job.longitude",
        :center="location",
        :zoom="17",
        style="height: 40vh"
      )
        GmapMarker(:position="location")

      v-card-text
        p
          | {{ job.address }}
          br
          | {{ job.city }}, {{ job.state }} {{ job.zip_code }}, {{ job.country }}
        div

      v-layout.flex-column.flex-sm-row.justify-space-between
        .flex-grow-1.px-5
          p.text-subtitle-2.mb-1 Organization manager
          p {{ job.organization_manager | fullName }}

        .flex-grow-1.px-5
          p.text-subtitle-2.mb-1 Contractor manager
          p {{ job.employee_manager | fullName }}

        .flex-grow-1.px-5
          p.text-subtitle-2.mb-1 Consultant
          p {{ job.consultant_name }}

        .flex-grow-1.px-5
          p.text-subtitle-2.mb-1 Consultant code
          p {{ job.consultant_code }}

    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Upcoming shifts
      v-spacer
      v-btn(text, @click="addShiftDialog = true")
        v-icon(left) mdi-plus
        span Add shift

    p.text-body-2.text-center.mt-3(v-if="!job.shifts || !job.shifts.length")
      | There aren't any shifts for this job.

    v-expansion-panels(popout, tile)
      v-expansion-panel(v-for="shift in job.shifts", :key="shift.id")
        v-expansion-panel-header.d-flex
          //- span.text-subtitle-1.flex-grow-0
          p.d-flex.flex-column.mb-0.flex-grow-0.px-2
            span.my-1.font-weight-medium(v-if="shift.contractor_id") {{ shift.contractor | fullName }}
            span.my-1 {{ shift.site_location }}

          v-chip.mx-4.px-2.flex-grow-0(
            v-if="shift.active",
            label,
            outlined,
            small,
            color="green"
          ) Active

          v-spacer

          p.d-flex.flex-column.mb-0.flex-grow-0.px-2
            span.my-1.font-weight-medium {{ shift.time_begin | date('MMM D, YYYY') }}
            span.my-1 {{ shift.time_begin | time }} - {{ shift.time_end | time }}

        v-expansion-panel-content
          div(v-if="shift.active")
            clock-events(
              v-if="shift.timeclock_actions && shift.timeclock_actions.length",
              :events="shift.timeclock_actions"
            )

          v-card-actions
            v-spacer
            v-btn(text, @click="openEditShiftDialog(shift)") Edit
            v-btn(text, color="red", @click="openDeleteShiftDialog(shift)") Remove
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component } from "vue-property-decorator"

import EditJobDialog from "./EditJobDialog.vue"
import CloseJobDialog from "./CloseJobDialog.vue"
import EditShiftDialog from "./EditShiftDialog.vue"
import DeleteShiftDialog from "./DeleteShiftDialog.vue"

import ClockEvents from "@/components/ClockEvents.vue"

import { userIs, UserRole } from "@/definitions/User"
import { Job, Shift } from "@/definitions/Job"

@Component({
  components: {
    EditJobDialog,
    CloseJobDialog,
    EditShiftDialog,
    DeleteShiftDialog,
    ClockEvents,
  }
})
export default class JobView extends Vue {

  loading = false
  editJobDialog = false
  closeJobDialog = false
  addShiftDialog = false
  editShiftDialog = false
  deleteShiftDialog = false
  selectedShift: Shift | {} = {}
  shifts = []

  metaInfo() {
    return {
      title: this.job?.name || 'Job'
    }
  }

  async mounted() {
    this.loading = true
    try {
      await this.$store.dispatch("loadJob", this.$route.params.jobId)
    }
    finally {
      this.loading = false
    }
  }

  get job(): Job {
    return this.$store.getters.job(this.$route.params.jobId)
  }

  get location() {
    return { lat: this.job.latitude, lng: this.job.longitude }
  }

  get userIsOrgManager() {
    return this.$store.state.authenticatedUser
      ? userIs(UserRole.OrganizationManager, this.$store.state.authenticatedUser)
      : false
  }

  openEditShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.editShiftDialog = true
  }

  openDeleteShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.deleteShiftDialog = true
  }

  contractorName(contractorId: number) {
    if (!this.job.employees) return ''
    const contractor = this.job.employees.find((e) => e.id == contractorId)
    if (!contractor) return 'Unknown contractor'
    return `${contractor.first_name} ${contractor.last_name}`
  }
}
</script>

<style scoped>
.marker {
  background: none;
  border: none;
}
</style>