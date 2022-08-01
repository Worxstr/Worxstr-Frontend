<template lang="pug">
v-dialog(
  v-model="opened"
  :fullscreen="$vuetify.breakpoint.smAndDown"
  max-width="700"
  persistent
)
  v-card.d-flex.flex-column(v-if="editedJob" ref='container')
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
        v-toolbar-title.text-h6 {{ !jobId ? `Creating ${editedJob.name || 'job'}` : `Editing ${editedJob.name}` }}
      
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
            label="Admin"
            data-cy='job-admin'
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
            label="Supervisor"
            data-cy='job-supervisor'
          )
        v-subheader Client info (optional)
        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            outlined
            dense
            label='Name'
            v-model='editedJob.consultant_name'
            data-cy='job-consultant-name'
          )
          phone-input(
            v-model='editedJob.consultant_phone'
            data-cy='job-consultant-phone'
            outlined
          )
        v-text-field(
          outlined
          dense
          label='Email'
          type='email'
          v-model='editedJob.consultant_email'
          :rules='rules.consultantEmail'
          data-cy='job-consultant-email'
        )

        v-subheader Presence verification restrictions

        v-checkbox.mt-0(
          v-model='editedJob.restrict_by_code'
          hide-details
        )
          template(v-slot:label)
            div
              .text-body-1 Verify by code
              .text-caption.font-italic The contractor must clock by scanning or typing in the clock-in code.

        //- // TODO: Add option for requiring background location permission
        v-checkbox(
          v-model='editedJob.restrict_by_location'
          hide-details
        )
          template(v-slot:label)
            div
              .text-body-1 Verify by location
              .text-caption.font-italic The contractor must clock in when they are on the job site.

        v-checkbox(
          v-model='editedJob.restrict_by_time'
        )
          template(v-slot:label)
            div
              .text-body-1 Verify by time
              .text-caption.font-italic The contractor must clock in when the shift is active.

        v-slide-y-transition
          div(v-show='editedJob.restrict_by_time')
            v-text-field(
              v-model.number="editedJob.restrict_by_time_window"
              pattern='[0-9]*'
              outlined
              dense
              label="Time window"
              type='number'
              min='1'
              data-cy='job-restrict-by-time-start'
              suffix='minutes'
              hide-details
              :rules='rules.restrictByTimeWindow'
            )
            .text-caption.mt-1.font-italic(style='opacity: .7') The amount of time before a shift starts that the contractor can clock in.

        v-slide-y-transition
          .mt-4(v-if='showMap')
            v-subheader Location, radius, and color

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
                min='20'
                max='1000'
              )
              v-text-field.mb-2(
                v-model.number="editedJob.radius"
                outlined
                dense
                type='number'
                min='20'
                max='1000'
                hide-details
                suffix='meters'
                style='max-width: 132px'
              )

            v-card.soft-shadow
              g-map(:jobs='[editedJob]' jobsDraggable @jobMoved='updateJobLocation')

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
          | {{ jobId ? 'Save' : 'Create' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { User } from '@/types/Users'
import { Job } from '@/types/Jobs';
import { exists, phoneRulesOptional, emailRulesOptional } from '@/util/inputValidation'
import RichtextField from '@/components/inputs/RichtextField.vue'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import GMap from '@/components/GMap.vue'
import { loadManagers } from '@/services/users'
import { createJob, updateJob } from '@/services/jobs'
import { hashColor } from '@/util/helpers'

function emptyJob() {
  return {
    color: hashColor(Date.now()),
    address: null,
    radius: 100,
    notes: '',
    restrict_by_code: true,
    restrict_by_location: true,
    restrict_by_time: true,
    restrict_by_time_window: 0,
  } // TODO: add type
}

@Component({
  components: {
    RichtextField,
    PhoneInput,
    GMap,
  }
})
export default class EditJobDialog extends Vue {

  @Prop({ type: Number }) readonly jobId?: number
  @Prop({ default: false }) readonly opened!: boolean

  editedJob: any = emptyJob()
  isValid = false
  loading = false
  place: any

  rules = {
    name: [exists("Job name required")],
    address: [exists("Address required")],
    consultantPhone: phoneRulesOptional,
    consultantEmail: emailRulesOptional,
    restrictByTimeWindow: [
      exists("Time window required"),
      (value: string) => !isNaN(parseInt(value)) || 'Time window must be a number',
      (value: string) => parseInt(value) >= 0 || 'Time window is invalid',
    ],
  }

  async mounted() {
    await loadManagers(this.$store)
  }

  @Watch('opened')
  onOpened(newVal: boolean) {
    if (newVal) {
      if (this.jobId) {
        this.editedJob = this.$store.getters.job(this.jobId)
      }
      else {
        this.resetForm()
        this.editedJob = emptyJob()
      }
    }
  }

  resetForm() {
    (this.$refs.form as HTMLFormElement)?.reset();
    setTimeout(() => {
      (this.$refs.container as any).$el.parentElement.scrollTop = 0;
    }, 1)
    // Reload google maps search field
  }

  get showMap() {
    return !!this.editedJob?.address
  }

  get managers(): User[] {
    return this.$store.state.users.managers
  }

  updateJobLocation({ job, index, position }: {
    job: Job
    index: number
    position: { latitude: number; longitude: number }
  }) {
    this.editedJob.latitude = position.latitude
    this.editedJob.longitude = position.longitude
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
      if (this.jobId)
        await updateJob(this.$store, this.editedJob)
      else
        await createJob(this.$store, this.editedJob)

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