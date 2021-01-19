<template>
  <v-container class="approvals">
    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h5 font-weight-medium">{{
        job.name
      }}</v-toolbar-title>
    </v-toolbar>

    <v-card class="mb-3 d-flex flex-column">
      <l-map
        class="align-self-stretch"
        style="height: 300px"
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
          <p class="text-subtitle-2 mb-1">Organization manager</p>
          <p>
            {{ job.organizationManager.first_name }}
            {{ job.organizationManager.last_name }}
          </p>
        </div>
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Employee manager</p>
          <p>
            {{ job.employeeManager.first_name }}
            {{ job.employeeManager.last_name }}
          </p>
        </div>
        <div class="flex-grow-1 px-5">
          <p class="text-subtitle-2 mb-1">Consultant</p>
          <p>
            {{ job.consultantName }}
          </p>
        </div>
      </v-layout>
    </v-card>

    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h6">Shifts</v-toolbar-title>
    </v-toolbar>

    <v-expansion-panels popout tile>
      <v-expansion-panel v-for="shift in shifts" :key="shift.id">
        <v-expansion-panel-header class="d-flex">
          <span class="text-subtitle-1 flex-grow-0"> {{ shift.name }} </span>
          <v-spacer />
          <span class="flex-grow-0 px-2">
            {{ shift.time_start }} - {{ shift.time_end }}
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card-text class="text-body-1">
            Location: {{ shift.location }}
            <br />
            Employee: {{ shift.employee.first_name }}
            {{ shift.employee.last_name }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="editShiftDialog = true">Edit</v-btn>
          </v-card-actions>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <edit-shift-dialog :opened.sync="editShiftDialog"/>
  </v-container>
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { latLng } from "leaflet";
import EditShiftDialog from "./EditShiftDialog";

export default {
  name: "job",
  components: { EditShiftDialog },
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

    // Temp hardcoded job data
    job: {
      name: "Test Job Number 6",
      employee: {
        first_name: "Employee",
        last_name: "One",
      },
      employeeManager: {
        first_name: "Jackson",
        last_name: "Sippe",
      },
      organizationManager: {
        first_name: "Alex",
        last_name: "Wohlbruck",
      },
      address: "1234 King St",
      city: "Boone",
      state: "NC",
      zipCode: "28607",
      consultantName: "Consultant Number 6",
      consultantPhone: "6666666666",
      consultantEmail: "jackson@worxstr.com",
      generateNewCode: true,
    },
  }),
  mounted() {
    for (let i = 0; i < 5; i++) {
      this.shifts.push({
        id: i,
        name: `Shift ${i + 1}`,
        employee: {
          first_name: "Employee",
          last_name: "One",
        },
        time_start: "9:00 AM",
        time_end: "2:00 PM",
        location: "Front of store",
      });
    }
  },
  methods: {
    innerClick() {
      alert("Click!");
    },
  },
};
</script>