<template>
  <v-container class="approvals" v-if="job">
    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h5 font-weight-medium">{{
        job.name
      }}</v-toolbar-title>
      <v-spacer />
      <v-btn text @click="editJobDialog = true">Edit</v-btn>
    </v-toolbar>

    <v-card class="mb-3 d-flex flex-column">
      <l-map
        class="align-self-stretch"
        style="height: 400px; z-index: 0"
        :zoom="18"
        :center="location"
        :options="mapOptions"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker :lat-lng="location" :icon="markerIcon">
        </l-marker>
      </l-map>
      <v-card-text>
        <p>
          {{ job.address }}
          <br />
          {{ job.city }}, {{ job.state }} {{ job.zipCode }}
        </p>
        <div></div>
      </v-card-text>

      <v-layout class="justify-space-between">
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Organizational manager</p>
          <p>{{ organizationManagerName(job.organization_manager_id) }}</p>
        </div>
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Employee manager</p>
          <p>{{ employeeManagerName(job.employee_manager_id) }}</p>
        </div>
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Consultant</p>
          <p>
            {{ job.consultant_name }}
          </p>
        </div>
      </v-layout>
    </v-card>

    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h6">Shifts</v-toolbar-title>
      <v-spacer />
      <v-btn text @click="addShift">Add new shift</v-btn>
    </v-toolbar>

    <p
      v-if="!job.shifts || !job.shifts.length"
      class="text-body-2 text-center mt-3"
    >
      There aren't any shifts for this job.
    </p>

    <v-expansion-panels popout tile>
      <v-expansion-panel v-for="shift in job.shifts" :key="shift.id">
        <v-expansion-panel-header class="d-flex">
          <span class="text-subtitle-1 flex-grow-0">
            Shift {{ shift.id }}
          </span>
          <v-spacer />
          <span class="flex-grow-0 px-2">
            {{ shift.time_begin | time }} - {{ shift.time_end | time }}
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card-text class="text-body-1">
            Location: {{ shift.site_location }}
            <br />
            <span v-if="shift.employee_id">
              Employee: {{ employeeName(shift.employee_id) }}
            </span>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="openEditShiftDialog(shift)">Edit</v-btn>
          </v-card-actions>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <edit-job-dialog :opened.sync="editJobDialog" :job.sync="job" />

    <edit-shift-dialog
      :opened.sync="editShiftDialog"
      :shift.sync="selectedShift"
      :employees="job.employees"
    />
  </v-container>
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { latLng, divIcon } from "leaflet";
import EditJobDialog from "./EditJobDialog";
import EditShiftDialog from "./EditShiftDialog";

// import markerIcon from '@/assets/icons/map-marker.svg'

export default {
  name: "job",
  components: { EditJobDialog, EditShiftDialog },
  computed: {
    job() {
      return this.$store.getters.job(this.$route.params.jobId);
    },
    location() {
      return latLng(this.job.latitude, this.job.longitude);
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
    employeeName(employeeId) {
      const employee = this.job.employees.find((e) => e.id == employeeId);
      return `${employee.first_name} ${employee.last_name}`;
    },
    organizationManagerName(organizationManagerId) {
      if (!this.job.managers) return "";
      const m = this.job.managers.organization_managers.find(
        (m) => m.manager_id == organizationManagerId
      );
      return m ? `${m.first_name} ${m.last_name}` : "";
    },
    employeeManagerName(employeeManagerId) {
      if (!this.job.managers) return "";
      const m = this.job.managers.employee_managers.find(
        (m) => m.id == employeeManagerId
      );
      return m ? `${m.first_name} ${m.last_name}` : "";
    },
    addShift() {
      return;
    },
  },
  data: () => ({
    editJobDialog: false,
    editShiftDialog: false,
    selectedShift: null,
    shifts: [],

    // Leaflet data
    markerIcon: divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 34.892337" height="60" width="40">
        <g transform="translate(-814.59595,-274.38623)">
          <g transform="matrix(1.1855854,0,0,1.1855854,-151.17715,-57.3976)">
            <path d="m 817.11249,282.97118 c -1.25816,1.34277 -2.04623,3.29881 -2.01563,5.13867 0.0639,3.84476 1.79693,5.3002 4.56836,10.59179 0.99832,2.32851 2.04027,4.79237 3.03125,8.87305 0.13772,0.60193 0.27203,1.16104 0.33416,1.20948 0.0621,0.0485 0.19644,-0.51262 0.33416,-1.11455 0.99098,-4.08068 2.03293,-6.54258 3.03125,-8.87109 2.77143,-5.29159 4.50444,-6.74704 4.56836,-10.5918 0.0306,-1.83986 -0.75942,-3.79785 -2.01758,-5.14062 -1.43724,-1.53389 -3.60504,-2.66908 -5.91619,-2.71655 -2.31115,-0.0475 -4.4809,1.08773 -5.91814,2.62162 z" style="fill:${'#d10000'};"/>
            <circle r="3.0355" cy="288.25278" cx="823.03064" id="path3049" style="display:inline;fill:${'#610000'};"/>
          </g>
        </g>
      </svg>`,
      iconAnchor: [20, 55],
      className: 'marker'
    }),
    center: latLng(36.2141575, -81.6820535),
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    withPopup: latLng(47.41322, -1.219482),
    withTooltip: latLng(47.41422, -1.250482),
    currentZoom: 11.5,
    currentCenter: latLng(47.41322, -1.219482),
    showParagraph: false,
    mapOptions: {
      zoomSnap: 0.5,
    },
    showMap: true,
  }),
};
</script>

<style scoped>
  .marker {
    background: none;
    border: none;
  }
</style>