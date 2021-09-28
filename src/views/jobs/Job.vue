<template lang="pug">
v-container(v-if="loading")
  v-card.pa-4
    v-skeleton-loader.py-2(type="image, image")
    v-skeleton-loader.py-2(type="sentences, sentences")

  v-skeleton-loader.mt-8.mb-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item"
  )

div(v-else)
  v-container.approvals.mb-16(v-if="job")
    edit-job-dialog(:opened.sync="editJobDialog", :job.sync="job")
    close-job-dialog(:opened.sync="closeJobDialog", :job.sync="job")
    create-shift-dialog(
      :opened.sync='createShiftDialog',
      :contractors='job.contractors'
    )
    edit-shift-dialog(
      :opened.sync="editShiftDialog",
      :shift.sync="selectedShift",
      :contractors="job.contractors"
    )
    delete-shift-dialog(
      v-if="selectedShift",
      :opened.sync="deleteShiftDialog",
      :shift.sync="selectedShift",
      :contractorName="contractorName(selectedShift.contractor_id)"
    )
    qr-code-dialog(
      :opened.sync='qrCodeDialog'
      :code='job.consultant_code'
    )

    portal(to="toolbarActions")
      v-btn(
        v-if="userIsOrgManager",
        text,
        :icon='$vuetify.breakpoint.xs'
        color="primary",
        @click="editJobDialog = true"
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
        span(v-if='!$vuetify.breakpoint.xs') Edit

      v-btn(
        v-if="userIsOrgManager",
        text,
        :icon='$vuetify.breakpoint.xs'
        color="red",
        @click="closeJobDialog = true"
      ) 
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
        span(v-if='!$vuetify.breakpoint.xs') Close

    v-card.mb-3.d-flex.flex-column.soft-shadow(:style='`border-top: 3px solid ${job.color}`')
      
      jobs-map(:jobs='[job]' :show-user-location='true')

      div
        v-card-text
          p {{ job.address }}
            br
            | {{ job.city }}, {{ job.state }} {{ job.zip_code }}, {{ job.country }}

        v-layout.px-5.flex-column.flex-sm-row.justify-space-between
          .flex-grow-1.justify-center
            p.text-subtitle-2.mb-1 Organization manager
            p {{ job.organization_manager | fullName }}

          .flex-grow-1.justify-center
            p.text-subtitle-2.mb-1 Contractor manager
            p {{ job.contractor_manager | fullName }}

          .flex-grow-1.justify-center
            p.text-subtitle-2.mb-1 Consultant
            p {{ job.consultant_name }}

          .flex-grow-1.justify-sm-center.d-flex.flex-row.align-center
            .d-flex.flex-column
              p.text-subtitle-2.mb-1 Consultant code
              p {{ job.consultant_code }}
            .mb-3.ml-3
              v-tooltip(bottom)
                span View QR code
                template(v-slot:activator='{ on, attrs }')
                  v-btn(
                    icon
                    color='primary'
                    v-bind='attrs'
                    v-on='on'
                    @click='openQrCodeDialog'
                  )
                    v-icon mdi-qrcode
              v-tooltip(bottom)
                span Copy to clipboard
                template(v-slot:activator='{ on, attrs }')
                  v-btn(
                    icon
                    color='primary'
                    v-bind='attrs'
                    v-on='on'
                    @click='copyText(job.consultant_code)'
                  )
                    v-icon mdi-content-copy


    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Upcoming shifts
      v-spacer
      v-btn(text, @click="createShiftDialog = true")
        v-icon(left) mdi-clipboard-plus-outline
        span Assign shift

    p.text-body-2.text-center.mt-3(v-if="!job.shifts || !job.shifts.length")
      | There aren't any shifts for this job.

    v-expansion-panels(popout, tile)
      v-expansion-panel(v-for="shift in job.shifts", :key="shift.id")
        v-expansion-panel-header.d-flex
          //- span.text-subtitle-1.flex-grow-0
          p.d-flex.flex-column.mb-0.flex-grow-0.px-2
            span.my-1.font-weight-medium(v-if="shift.contractor_id") {{ (shift.contractor ? shift.contractor : getContractor(shift.contractor_id)) | fullName }}
            span.my-1.font-weight-medium(v-else) Unassigned
            span.my-1 {{ shift.site_location }}

          v-chip.mx-4.px-2.flex-grow-0(
            v-if="shift.active",
            label,
            outlined,
            small,
            color="green"
          ) Active

          v-spacer

          p.d-flex.flex-column.mb-0.flex-grow-0.px-2
            span.my-1.font-weight-medium {{ shift.time_begin | date('MMM D, YYYY') }}
            span.my-1 {{ shift.time_begin | time }} - {{ shift.time_end | time }}

        v-expansion-panel-content
          div(v-if="shift.active")
            clock-events(
              v-if="shift.timeclock_actions && shift.timeclock_actions.length",
              :events="shift.timeclock_actions"
            )

          v-card-actions
            v-spacer
            v-btn(text, @click="openEditShiftDialog(shift)") Edit
            v-btn(text, color="red", @click="openDeleteShiftDialog(shift)") Delete
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component } from 'vue-property-decorator'
import { Clipboard } from '@capacitor/clipboard'

import EditJobDialog from './EditJobDialog.vue'
import CloseJobDialog from './CloseJobDialog.vue'
import CreateShiftDialog from './CreateShiftDialog.vue'
import EditShiftDialog from './EditShiftDialog.vue'
import DeleteShiftDialog from './DeleteShiftDialog.vue'
import QrCodeDialog from './QrCodeDialog.vue'

import JobsMap from '@/components/JobsMap.vue'
import ClockEvents from '@/components/ClockEvents.vue'

import { currentUserIs, UserRole } from '@/definitions/User'
import { Job, Shift } from '@/definitions/Job'

@Component({
  components: {
    EditJobDialog,
    CloseJobDialog,
    CreateShiftDialog,
    EditShiftDialog,
    DeleteShiftDialog,
    QrCodeDialog,
    JobsMap,
    ClockEvents,
  },
})
export default class JobView extends Vue {
  loading = false
  editJobDialog = false
  closeJobDialog = false
  createShiftDialog = false
  editShiftDialog = false
  deleteShiftDialog = false
  qrCodeDialog = false
  selectedShift: Shift | {} = {}
  shifts = []

  metaInfo() {
    return {
      title: this.job?.name || 'Job',
    }
  }

  async mounted() {
    this.loading = true
    try {
      await this.$store.dispatch('loadJob', this.$route.params.jobId)
    } finally {
      this.loading = false
    }
  }

  get job(): Job {
    return this.$store.getters.job(this.$route.params.jobId)
  }

  get userIsOrgManager() {
    return currentUserIs(UserRole.OrganizationManager)
  }

  getContractor(contractorId: number) {
    return this.$store.getters.user(contractorId)
  }

  openEditShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.editShiftDialog = true
  }

  openDeleteShiftDialog(shift: Shift) {
    this.selectedShift = shift
    this.deleteShiftDialog = true
  }

  openQrCodeDialog() {
    this.qrCodeDialog = true
  }

  contractorName(contractorId: number) {
    if (!this.job.contractors) return ''
    const contractor = this.job.contractors.find((e) => e.id == contractorId)
    if (!contractor) return 'Unknown contractor'
    return `${contractor.first_name} ${contractor.last_name}`
  }

  async copyText(text: string) {
    try {
      await Clipboard.write({
        string: text
      })
      this.$store.dispatch('showSnackbar', {
        text: "Copied."
      })
    }
    catch (e) {
      this.$store.dispatch('showSnackbar', {
        text: "Couldn't copy to clipboard."
      })
    }
  }
}
</script>

<style scoped>
.marker {
  background: none;
  border: none;
}
</style>
