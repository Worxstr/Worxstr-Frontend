<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column(v-if="editedJob")
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      v-if="editedJob",
      @submit.prevent="updateJob",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title {{ create ? `Creating ${editedJob.name || 'job'}` : `Editing ${editedJob.name}` }}

      v-card-text.py-0
        v-subheader Job details
        v-text-field(
          outlined,
          dense,
          label="Job name",
          v-model="editedJob.name",
          :rules="rules.name",
          required
        )

        vuetify-google-autocomplete#map(
          outlined,
          dense,
          label="Address",
          v-on:placechanged="setPlace",
          :value="editedJob.address ? `${editedJob.address}, ${editedJob.city}, ${editedJob.state} ${editedJob.zip_code}` : ''",
          :rules="rules.address"
        )

        v-subheader Managers
        v-select(
          v-if="managers.organization && managers.organization.length",
          v-model="editedJob.organization_manager_id",
          :items="managers.organization",
          :item-text="(m) => `${m.first_name} ${m.last_name}`",
          :item-value="'id'",
          outlined,
          dense,
          required,
          label="Organizational manager"
        )
        v-select(
          v-if="managers.employee && managers.employee.length",
          v-model="editedJob.employee_manager_id",
          :items="managers.employee",
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

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="green", :disabled="!isValid", type="submit")
          | {{ create ? 'Create' : 'Save' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { User } from '@/definitions/User'
import { Job } from '@/definitions/Job';

// TODO: Move this to reusable import
const exists = (errorMessage: string) => (value: any) => !!value || errorMessage;

@Component
export default class EditJobDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean
  @Prop(Object) readonly job: Job | undefined

  isValid = false
  editedJob: Job | {} = {}
  loading = false
  place: any

  rules = {
    name: [exists("Job name required")],
    address: [exists("Address required")],
    consultantName: [exists("Consultant name required")],
    consultantPhone: [
      exists("Consultant phone required"),
      (value: string) => {
        // https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
        // TODO: Use a library for these rules

        const pattern = /^(()?\d{3}())?(-|\s)?\d{3}(-|\s)?\d{4}$/;
        return pattern.test(value) || "Invalid phone";
      },
    ],
    consultantEmail: [
      exists("Email required"),
      (value: string) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid email";
      },
    ],
  }

  @Watch('opened')
  onOpened(newVal: boolean) {
    if (newVal) this.$store.dispatch('loadManagers');
    if (newVal && this.job)
      this.editedJob = Object.assign({}, this.job);
  }

  get managers(): User[] {
    return this.$store.state.managers
  }

  closeDialog() {
    this.$emit("update:opened", false);
    if (this.create) (this.$refs.form as HTMLFormElement).reset();
  }
  setPlace(address: any, place: string, id: string) {
    if (this.editedJob) {
      this.editedJob.address = address.name
      this.editedJob.city = address.locality
      this.editedJob.state = address.administrative_area_level_1
      this.editedJob.zip_code = address.postal_code
      this.editedJob.country = address.country
      this.editedJob.latitude = address.latitude
      this.editedJob.longitude = address.longitude
    }
    this.place = place
  }
  async updateJob() {
    this.loading = true
    try {
      if (this.create) await this.$store.dispatch("createJob", this.editedJob)
      else await this.$store.dispatch("updateJob", this.editedJob)
      this.closeDialog()
    }
    finally {
      this.loading = false
    }
  }
}
</script>