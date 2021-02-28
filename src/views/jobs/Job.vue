<template lang="pug">
v-container.approvals(v-if="job")
  edit-job-dialog(:opened.sync="editJobDialog", :job.sync="job")
  close-job-dialog(:opened.sync="closeJobDialog", :job.sync="job")
  edit-shift-dialog(
    create,
    :opened.sync="addShiftDialog",
    :employees="job.employees"
  )
  edit-shift-dialog(
    :opened.sync="editShiftDialog",
    :shift.sync="selectedShift",
    :employees="job.employees"
  )
  delete-shift-dialog(
    v-if="selectedShift",
    :opened.sync="deleteShiftDialog",
    :shift.sync="selectedShift",
    :employeeName="employeeName(selectedShift.employee_id)"
  )

  v-toolbar(flat, color="transparent")
    v-toolbar-title.text-h5.font-weight-medium
      | {{ job.name }}
    v-spacer
    v-btn(v-if="userIsOrgManager" text, @click="editJobDialog = true") Edit
    v-btn(v-if="userIsOrgManager" text, color="red", @click="closeJobDialog = true") Close

  v-card.mb-3.d-flex.flex-column
    GmapMap(v-if="job.latitude && job.longitude" :center="location", :zoom="17", style="height: 40vh")
      GmapMarker(:position="location")

    v-card-text
      p
        | {{ job.address }}
        br
        | {{ job.city }}, {{ job.state }} {{ job.zip_code }}, {{ job.country }}
      div

    v-layout.justify-space-between
      .flex-grow-1.px-5
        p.text-subtitle-2.mb-1 Organizational manager
        p {{ organizationManager.first_name }} {{ organizationManager.last_name }}

      .flex-grow-1.px-5
        p.text-subtitle-2.mb-1 Employee manager
        p {{ employeeManager.first_name }} {{ employeeManager.last_name }}

      .flex-grow-1.px-5
        p.text-subtitle-2.mb-1 Consultant
        p {{ job.consultant_name }}

      .flex-grow-1.px-5
        p.text-subtitle-2.mb-1 Consultant code
        p {{ job.consultant_code }}

  v-toolbar(flat, color="transparent")
    v-toolbar-title.text-h6 Shifts
    v-spacer
    v-btn(text, @click="addShiftDialog = true") Add new shift

  p.text-body-2.text-center.mt-3(v-if="!job.shifts || !job.shifts.length")
    | There aren't any shifts for this job.

  v-expansion-panels(popout, tile)
    v-expansion-panel(v-for="shift in job.shifts", :key="shift.id")
      v-expansion-panel-header.d-flex
        span.text-subtitle-1.flex-grow-0
          | {{ shift.site_location }}

          span(v-if="shift.employee_id")
            |  - {{ employeeName(shift.employee_id) }}

          v-chip.mx-4.px-2(v-if="shift.active" label outlined small color='green') Active

        v-spacer
        
        p.d-flex.flex-column.mb-0.flex-grow-0.px-2
          span.my-1.font-weight-medium {{ shift.time_begin | date('MMM D, YYYY') }}
          span.my-1 {{ shift.time_begin | time }} - {{ shift.time_end | time }}

      v-expansion-panel-content
        v-card-content(v-if="shift.active")
          p Display clock history here
        v-card-actions
          v-spacer
          v-btn(text, @click="openEditShiftDialog(shift)") Edit
          v-btn(text, color="red", @click="openDeleteShiftDialog(shift)") Remove
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import EditJobDialog from "./EditJobDialog";
import CloseJobDialog from "./CloseJobDialog";
import EditShiftDialog from "./EditShiftDialog";
import DeleteShiftDialog from "./DeleteShiftDialog";

import { userIs, ORGANIZATION_MANAGER } from '@/definitions/userRoles'

export default {
  name: "job",
  components: {
    EditJobDialog,
    CloseJobDialog,
    EditShiftDialog,
    DeleteShiftDialog,
  },
  computed: {
    job() {
      return this.$store.getters.job(this.$route.params.jobId);
    },
    employeeManager() {
      return this.$store.getters.manager(this.job.employee_manager_id);
    },
    organizationManager() {
      return this.$store.getters.manager(this.job.organization_manager_id);
    },
    location() {
      return { lat: this.job.latitude, lng: this.job.longitude };
    },
    userIsOrgManager() {
      return this.$store.state.authenticatedUser ? userIs(ORGANIZATION_MANAGER, this.$store.state.authenticatedUser) : false
    },
  },
  mounted() {
    this.$store.dispatch("loadJob", this.$route.params.jobId);
  },
  methods: {
    innerClick() {
      alert("Click!");
    },
    openEditShiftDialog(shift) {
      this.selectedShift = shift;
      this.editShiftDialog = true;
    },
    openDeleteShiftDialog(shift) {
      this.selectedShift = shift;
      this.deleteShiftDialog = true;
    },
    employeeName(employeeId) {
      const employee = this.job.employees.find((e) => e.id == employeeId);
      return `${employee.first_name} ${employee.last_name}`;
    },
    addShift() {
      return;
    },
  },
  data: () => ({
    editJobDialog: false,
    closeJobDialog: false,
    addShiftDialog: false,
    editShiftDialog: false,
    deleteShiftDialog: false,
    selectedShift: null,
    shifts: [],
  }),
};
</script>

<style scoped>
.marker {
  background: none;
  border: none;
}
</style>