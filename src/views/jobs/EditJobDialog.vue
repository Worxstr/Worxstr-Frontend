<template lang="pug">
v-dialog(
  v-model="opened"
  :fullscreen="$vuetify.breakpoint.smAndDown"
  max-width="700"
  persistent
)
  v-card.d-flex.flex-column(v-if="editedJob")
    v-fade-transition
      v-overlay(v-if="loading" absolute opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      v-if="editedJob"
      @submit.prevent='updateJob'
      ref='form'
      v-model='isValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 {{ create ? `Creating ${editedJob.name || 'job'}` : `Editing ${editedJob.name}` }}
      
      v-divider

      v-card-text.py-0
        v-subheader Job details
        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            autofocus
            outlined
            dense
            label="Job name"
            v-model="editedJob.name"
            :rules="rules.name"
            required
            data-cy='job-name'
          )

          vuetify-google-autocomplete#map(
            outlined
            dense
            label='Job address'
            v-on:placechanged='setPlace'
            :value="editedJob.address ? `${editedJob.address}, ${editedJob.city}, ${editedJob.state} ${editedJob.zip_code}` : ''"
            :rules="rules.address"
            data-cy='job-address'
          )
        richtext-field(placeholder='Job notes' v-model='editedJob.notes')

        v-subheader Managers
        .d-flex.flex-column.flex-sm-row
          v-select.mr-sm-4(
            v-if="managers.organization && managers.organization.length"
            v-model="editedJob.organization_manager_id"
            :items="managers.organization"
            :item-text="(m) => `${m.first_name} ${m.last_name}`"
            :item-value="'id'"
            outlined
            dense
            required
            label="Organizational manager"
            data-cy='job-org-manager'
          )
          v-select(
            v-if="managers.contractor && managers.contractor.length"
            v-model="editedJob.contractor_manager_id"
            :items="managers.contractor"
            :item-text="(m) => `${m.first_name} ${m.last_name}`"
            :item-value="'id'"
            outlined
            dense
            required
            label="Contractor manager"
            data-cy='job-contractor-manager'
          )
        v-subheader Consultant info
        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            outlined
            dense
            label="Name",
            v-model="editedJob.consultant_name"
            :rules="rules.consultantName"
            data-cy='job-consultant-name'
            required
          )
          phone-input(
            v-model='editedJob.consultant_phone'
            data-cy='job-consultant-phone'
            outlined
            :required='true'
          )
        v-text-field(
          outlined
          dense
          label="Email"
          type="email"
          v-model="editedJob.consultant_email"
          :rules="rules.consultantEmail"
          data-cy='job-consultant-email'
          required
        )

        v-subheader Clock-in restrictions

        v-checkbox(
          v-model='editedJob.restrict_by_code'
          label='Restrict by code'
          hide-details
        )
        v-checkbox(
          v-model='editedJob.restrict_by_location'
          label='Restrict by location'
          hide-details
        )
        //- // TODO: Add option for requiring background location permission
        v-checkbox(
          v-model='editedJob.restrict_by_time'
          label='Restrict by time'
        )
        v-text-field(
          v-show='editedJob.restrict_by_time'
          v-model.number="editedJob.restrict_by_time_window"
          outlined
          dense
          label="Time window"
          type='number'
          min='1'
          data-cy='job-restrict-by-time-start'
          suffix='minutes'
        )

        div(v-if='showMap')
          .d-flex.align-center
            .d-flex.align-center
              p.mr-4.mb-3 Job color
              v-menu(offset-y content-class='color-picker')
                template(v-slot:activator='{ on, attrs }')
                  .mb-3(v-bind='attrs' v-on='on')
                    v-badge.soft-shadow(:color="editedJob.color || defaultJobColor" bordered)
                    
                v-color-picker(
                  v-model='editedJob.color'
                  show-swatches
                  hide-canvas
                  hide-sliders
                  hide-inputs
                  swatches-max-height='350'
                )

            .mx-4
            
            v-slider.mt-3(
              v-model='editedJob.radius'
              label='Radius'
              min='75'
              max='1000'
            )
            p.mt-1 {{ editedJob.radius | distance }}

          v-card.soft-shadow
            g-map(:jobs='[editedJob]')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(
          text
          color="green"
          :disabled="!isValid"
          type="submit"
          data-cy='save-job-button'
        )
          | {{ create ? 'Create' : 'Save' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import colors from 'vuetify/lib/util/colors'
import { User } from '@/types/Users'
import { Job } from '@/types/Jobs';
import { exists, phoneRules, emailRules } from '@/util/inputValidation'
import RichtextField from '@/components/inputs/RichtextField.vue'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import GMap from '@/components/GMap.vue'
import { loadManagers } from '@/services/users'
import { createJob, updateJob } from '@/services/jobs'
import { hashColor } from '@/util/helpers'

@Component({
  components: {
    RichtextField,
    PhoneInput,
    GMap,
  }
})
export default class EditJobDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean
  @Prop(Object) readonly job: Job | undefined

  editedJob: any = {
    color: hashColor(Date.now()),
    address: null,
    notes: '',
  } // TODO: add type
  isValid = false
  loading = false
  place: any

  rules = {
    name: [exists("Job name required")],
    address: [exists("Address required")],
    consultantName: [exists("Consultant name required")],
    consultantPhone: phoneRules,
    consultantEmail: emailRules,
  }

  async mounted() {
    await loadManagers(this.$store)
  }

  @Watch('opened')
  onOpened(newVal: boolean) {
    if (newVal) {
      if (this.create) (this.$refs.form as HTMLFormElement)?.reset()
    }

    if (newVal && this.job)
      this.editedJob = Object.assign({}, this.job);
  }

  get showMap() {
    return !!this.editedJob?.address
  }

  get managers(): User[] {
    return this.$store.state.users.managers
  }

  closeDialog() {
    this.$emit("update:opened", false)
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
      if (this.create) await createJob(this.$store, this.editedJob)
      else await updateJob(this.$store, this.editedJob)
      this.closeDialog()
    }
    finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.color-picker {
  &.v-menu__content {
    min-width: unset !important;
  }
}
</style>