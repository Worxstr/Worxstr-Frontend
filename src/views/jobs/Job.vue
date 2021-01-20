<template>
  <v-container class="approvals">
    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h5 font-weight-medium">{{
        job.name
      }}</v-toolbar-title>
      <v-spacer />
      <v-btn text>Edit</v-btn>
    </v-toolbar>

    <v-card class="mb-3 d-flex flex-column">
      <l-map
        class="align-self-stretch"
        style="height: 400px"
        :zoom="15"
        :center="center"
        :options="mapOptions"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker :lat-lng="withPopup">
          <l-popup>
            <div @click="innerClick">
              I am a popup
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
                Donec finibus semper metus id malesuada.
              </p>
            </div>
          </l-popup>
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
          <p class="text-subtitle-2 mb-1">Organization managers</p>
          <p
            v-for="manager in job.managers.organization_managers"
            :key="manager.id"
          >
            {{ manager.first_name }}
            {{ manager.last_name }}
          </p>
        </div>
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Employee managers</p>
          <p
            v-for="manager in job.managers.employee_managers"
            :key="manager.id"
          >
            {{ manager.first_name }}
            {{ manager.last_name }}
          </p>
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
      <v-spacer/>
      <v-btn text @click="addShift">Add new shift</v-btn>
    </v-toolbar>

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
            Employee: {{ shift.employee_id }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="editShiftDialog = true">Edit</v-btn>
          </v-card-actions>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <edit-shift-dialog :opened.sync="editShiftDialog" />
  </v-container>
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { latLng } from "leaflet";
import EditShiftDialog from "./EditShiftDialog";

export default {
  name: "job",
  components: { EditShiftDialog },
  computed: {
    job() {
      return this.$store.getters.job(this.$route.params.jobId);
    },
  },
  mounted() {
    this.$store.dispatch("loadJob", this.$route.params.jobId);
  },
  methods: {
    innerClick() {
      alert("Click!");
    },
    addShift() {
      return
    }
  },
  data: () => ({
    editShiftDialog: false,
    shifts: [],

    // Leaflet data
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