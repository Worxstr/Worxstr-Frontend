<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)
        
    v-form(
      v-if="editedJob",
      @submit.prevent="updateJob",
      ref="form",
      v-model="isValid"
    )
      v-toolbar(flat)
        v-toolbar-title {{ create ? `Creating ${editedJob.name || 'job'}` : `Editing ${editedJob.name}` }}

      v-card-text.py-0
        v-subheader Job details
        v-text-field(
          outlined,
          dense,
          label="Name",
          v-model="editedJob.name",
          :rules="rules.name",
          required
        )
        v-text-field(
          outlined,
          dense,
          label="Address",
          v-model="editedJob.address",
          :rules="rules.address",
          required
        )
        v-row
          v-col
            v-text-field(
              outlined,
              dense,
              label="City",
              v-model="editedJob.city",
              :rules="rules.city",
              required
            )
          v-col
            v-select(
              v-model="editedJob.state",
              :items="states",
              outlined,
              dense,
              required,
              label="State",
              :rules="rules.state"
            )
          v-col
            v-text-field(
              outlined,
              dense,
              label="Zip code",
              v-model="editedJob.zip_code",
              :rules="rules.zipCode",
              required
            )
        v-subheader Managers
        v-select(
          v-if="editedJob.managers",
          v-model="editedJob.organization_manager_id",
          :items="editedJob.managers.organization_managers",
          :item-text="(m) => `${m.first_name} ${m.last_name}`",
          :item-value="'manager_id'",
          outlined,
          dense,
          required,
          label="Organizational manager"
        )
        v-select(
          v-if="editedJob.managers",
          v-model="editedJob.employee_manager_id",
          :items="editedJob.managers.employee_managers",
          :item-text="(m) => `${m.first_name} ${m.last_name}`",
          :item-value="'id'",
          outlined,
          dense,
          required,
          label="Employee manager"
        )
        v-subheader Consultant info
        v-text-field(
          outlined,
          dense,
          label="Name",
          v-model="editedJob.consultant_name",
          :rules="rules.consultantName",
          required
        )
        v-text-field(
          outlined,
          dense,
          label="Phone",
          type="phone",
          v-model="editedJob.consultant_phone",
          :rules="rules.consultantPhone",
          required
        )
        v-text-field(
          outlined,
          dense,
          label="Email",
          type="email",
          v-model="editedJob.consultant_email",
          :rules="rules.consultantEmail",
          required
        )
      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", :disabled="!isValid", type="submit")
          | {{ create ? 'Create' : 'Save' }}

</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

// TODO: Move this to reusable import
const exists = (errorString) => (value) => !!value || errorString;

export default {
  name: "editJobDialog",
  props: {
    opened: Boolean,
    create: Boolean, // Creating new job
    job: Object,
  },
  data: () => ({
    isValid: false,
    editedJob: {},
    loading: false,
    states: [
      "AL",
      "AK",
      "AS",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "DC",
      "FM",
      "FL",
      "GA",
      "GU",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MH",
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
      "MP",
      "OH",
      "OK",
      "OR",
      "PW",
      "PA",
      "PR",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VI",
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
      state: [exists("State required")],
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
      if (newVal == true && this.job)
        this.editedJob = Object.assign({}, this.job);
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      this.$refs.form.reset();
    },
    async updateJob() {
      this.loading = true;
      if (this.create) await this.$store.dispatch("createJob", this.editedJob);
      else await this.$store.dispatch("updateJob", this.editedJob);
      this.loading = false;
      this.closeDialog();
    },
  },
};
</script>