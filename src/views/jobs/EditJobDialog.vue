<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="700",
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
        v-toolbar-title.text-h6 {{ create ? `Creating ${editedJob.name || 'job'}` : `Editing ${editedJob.name}` }}
      
      v-divider

      v-card-text.py-0
        v-subheader Job details
        v-text-field(
          autofocus
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

        div(v-if='showMap')
          .d-flex.align-center
            .d-flex.align-center
              p.mr-4.mb-3 Job color
              v-menu(offset-y content-class='color-picker')
                template(v-slot:activator='{ on, attrs }')
                  .mb-3(v-bind='attrs' v-on='on')
                    v-badge.soft-shadow(:color="editedJob.color || '#4285f4'" bordered)
                    
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
            jobs-map(:jobs='[editedJob]')

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
          v-if="managers.contractor && managers.contractor.length",
          v-model="editedJob.contractor_manager_id",
          :items="managers.contractor",
          :item-text="(m) => `${m.first_name} ${m.last_name}`",
          :item-value="'id'",
          outlined,
          dense,
          required,
          label="Contractor manager"
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
        phone-input(
          v-model='editedJob.consultant_phone'
          outlined
          :required='true'
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
import colors from 'vuetify/lib/util/colors'
import { User } from '@/definitions/User'
import { Job } from '@/definitions/Job';
import { exists, phoneRules, emailRules } from '@/plugins/inputValidation'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import JobsMap from '@/components/JobsMap.vue'

@Component({
  components: {
    PhoneInput,
    JobsMap,
  }
})
export default class EditJobDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) readonly create!: boolean
  @Prop(Object) readonly job: Job | undefined

  editedJob: any = {
    color: colors.red.base,
    address: null,
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

  @Watch('opened')
  onOpened(newVal: boolean) {
    if (newVal) {
      if (this.create) (this.$refs.form as HTMLFormElement).reset()
      this.$store.dispatch('loadManagers')
    }

    if (newVal && this.job)
      this.editedJob = Object.assign({}, this.job);
  }

  get showMap() {
    return !!this.editedJob?.address
  }

  get managers(): User[] {
    return this.$store.state.managers
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

<style lang="scss">
.color-picker {
  &.v-menu__content {
    min-width: unset !important;
  }
}
</style>