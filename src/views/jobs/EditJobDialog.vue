<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-form v-if="editedJob" @submit.prevent="updateShift" v-model="isValid">
        <v-toolbar flat>
          <v-toolbar-title> Editing {{ editedJob.name }} </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="py-0">
          <v-subheader>Job details</v-subheader>
          <v-text-field
            outlined
            dense
            label="Name"
            v-model="editedJob.name"
            :rules="rules.name"
            required
          />
          <v-text-field
            outlined
            dense
            label="Address"
            v-model="editedJob.address"
            :rules="rules.address"
            required
          />
          <v-row>
            <v-col
              ><v-text-field
                outlined
                dense
                label="City"
                v-model="editedJob.city"
                :rules="rules.city"
                required
            /></v-col>
            <v-col>
              <v-select
                v-model="editedJob.state"
                :items="states"
                outlined
                dense
                required
                label="State" />
             </v-col>
            <v-col
              ><v-text-field
                outlined
                dense
                label="Zip code"
                v-model="editedJob.zip_code"
                :rules="rules.zipCode"
                required
            /></v-col>
          </v-row>
          <v-subheader>Managers</v-subheader>
          <v-select
            v-model="editedJob.organization_manager_id"
            :items="editedJob.managers.organization_managers"
            :item-text="(m) => `${m.first_name} ${m.last_name}`"
            :item-value="'manager_id'"
            outlined
            dense
            required
            label="Organizational manager"
          />
          <v-select
            v-model="editedJob.employee_manager_id"
            :items="editedJob.managers.employee_managers"
            :item-text="(m) => `${m.first_name} ${m.last_name}`"
            :item-value="'id'"
            outlined
            dense
            required
            label="Employee manager"
          />

          <v-subheader>Consultant info</v-subheader>
          <v-text-field
            outlined
            dense
            label="Name"
            v-model="editedJob.consultant_name"
            :rules="rules.consultantName"
            required
          />
          <v-text-field
            outlined
            dense
            label="Phone"
            type="phone"
            v-model="editedJob.consultant_phone"
            :rules="rules.consultantPhone"
            required
          />
          <v-text-field
            outlined
            dense
            label="Email"
            type="email"
            v-model="editedJob.consultant_email"
            :rules="rules.consultantEmail"
            required
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn text color="green" :disabled="!isValid" type="submit"
            >Save</v-btn
          >
        </v-card-actions>
      </v-form>

      <v-fade-transition>
        <v-overlay v-if="loading" absolute opacity=".2">
          <v-progress-circular indeterminate />
        </v-overlay>
      </v-fade-transition>
    </v-card>
  </v-dialog>
</template>

<script>
const exists = (errorString) => (value) => !!value || errorString;

export default {
  name: "editJobDialog",
  props: {
    opened: Boolean,
    job: Object,
  },
  data: () => ({
    isValid: false,
    editedJob: null,
    loading: false,
    states: [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ],
    rules: {
      name: [exists("Job name required")],
      address: [exists("Address required")],
      city: [exists("City required")],
      zipCode: [
        exists("Zip code required"),
        (value) =>
          /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value) || "Zip code invalid",
      ],
      consultantName: [exists("Consultant name required")],
      consultantPhone: [
        exists("Consultant phone required"),
        (value) => {
          // https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
          // TODO: Use a library for these rules

          const pattern = /^(()?\d{3}())?(-|\s)?\d{3}(-|\s)?\d{4}$/;
          return pattern.test(value) || "Invalid phone";
        },
      ],
      consultantEmail: [
        exists("Email required"),
        (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid email";
        },
      ],
    },
  }),
  watch: {
    opened(newVal, oldVal) {
      if (newVal == true) this.editedJob = Object.assign({}, this.job);
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async updateShift() {
      this.loading = true;
      await this.$store.dispatch("updateJob", this.editedJob);
      this.loading = false;
      this.closeDialog();
    },
  },
};
</script>