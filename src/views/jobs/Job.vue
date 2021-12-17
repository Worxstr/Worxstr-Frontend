<template lang="pug">
v-container(v-if="loading && !job")
  v-card.soft-shadow.pa-4
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
        color='primary'
        @click="editJobDialog = true"
        data-cy='edit-job-button'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
        span(v-if='!$vuetify.breakpoint.xs') Edit

      v-btn(
        v-if="userIsOrgManager"
        text
        :icon='$vuetify.breakpoint.xs'
        color="error"
        @click="closeJobDialog = true"
        data-cy='close-job-button'
      ) 
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
        span(v-if='!$vuetify.breakpoint.xs') Close

    v-card.mb-3.d-flex.flex-column.flex-lg-row.soft-shadow(
      :style='`border-top: 3px solid ${job.color}`'
    )
      
      jobs-map(
        :jobs='[job]'
        :show-user-location='true'
        :style='$vuetify.breakpoint.lgAndUp && `width: 50%`'
      )

      .flex-grow-1
        v-card-text.d-flex.pb-0.flex-column.flex-sm-row
          //- Address
          .d-flex
            .mt-1.mr-1
              v-tooltip(bottom)
                span Navigate to job
                template(v-slot:activator='{ on, attrs }')
                  v-btn(
                    icon
                    color='primary'
                    v-bind='attrs'
                    v-on='on'
                    :href='navigationUrl' target='_blank'
                  )
                    v-icon mdi-map-search

            a.alt-style(:href='navigationUrl' target='_blank') {{ job.address }}
              br
              | {{ job.city }}, {{ job.state }} {{ job.zip_code }}, {{ job.country }}

          v-spacer

          //- Clock-in code
          .d-flex.flex-row.align-center
              
            .d-flex.flex-column
              p.text-sm-right.text-subtitle-2.mb-1 Clock-in code
              p.text-sm-right(data-cy='clock-in-code') {{ job.consultant_code }}

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

              clipboard-copy(:text='job.consultant_code')

        //- Job notes
        v-card-text(v-if='job.notes')
          p.text-subtitle-2.mb-2 Notes
          v-sheet(outlined rounded)
            v-card-text
              div(v-html='job.notes')

        //- Job info fields
        v-card-text.px-5.flex-column.flex-sm-row.flex-lg-column.justify-space-between(
          v-if='job.organization_manager && job.contractor_manager && job.consultant_name && job.consultant_code'
        )
        
          .flex-grow-1
            p.text-subtitle-2.mb-1 Organization manager
            p
              router-link.alt-style(
                :to="{name: 'user', params: {userId: job.organization_manager.id}}"
              )
                | {{ job.organization_manager | fullName }}

          .flex-grow-1
            p.text-subtitle-2.mb-1 Contractor manager
            p
              router-link.alt-style(
                :to="{name: 'user', params: {userId: job.contractor_manager.id}}"
              )
                | {{ job.contractor_manager | fullName }}

          .flex-grow-1
            p.text-subtitle-2.mb-1 Consultant
            .d-flex.flex-column.gap
              span.mb-0 {{ job.consultant_name }}
              a.mb-0(target='_blank' :href='`mailto:${job.consultant_email}`') {{ job.consultant_email }}
              a(target='_blank' :href='`tel:${job.consultant_phone}`')    {{ job.consultant_phone | phone }}

        v-skeleton-loader(type='list-item-two-line' v-else)

    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Upcoming shifts
      v-spacer
      v-btn(text color='primary' @click="createShiftDialog = true" data-cy="assign-shift-button")
        v-icon(left) mdi-clipboard-plus-outline
        span Assign shift

    p.text-body-2.text-center.mt-3(v-if="!job.shifts || !job.shifts.length")
      | There aren't any shifts for this job.
    
    v-expansion-panels.soft-shadow(v-else tile flat)
      v-expansion-panel(v-for="shift in job.shifts", :key="shift.id")
        v-expansion-panel-header.d-flex
          //- span.text-subtitle-1.flex-grow-0
          p.d-flex.flex-column.mb-0.flex-grow-0.px-2
            router-link.alt-style.my-1.font-weight-medium(
              v-if="shift.contractor_id"
              :to="{name: 'user', params: {userId: shift.contractor_id}}"
            )
              | {{ getContractor(shift.contractor_id) | fullName }}
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
          .d-flex.flex-column.gap-small
            div(v-if='shift.notes')
              p.text-subtitle-1.mb-2 Notes
              v-sheet(outlined rounded)
                v-card-text
                  div(v-html='shift.notes')

            div(v-if='shift.tasks')
              p.text-subtitle-1.mb-2 Tasks
              task-list(:tasks='shift.tasks')

            div(v-if="shift.active")
              p.text-subtitle-1.mb-2 Activity
              clock-events(
                v-if="shift.timeclock_actions && shift.timeclock_actions.length",
                :events="shift.timeclock_actions"
              )

          v-card-actions
            v-spacer
            v-btn(
              text
              @click="openEditShiftDialog(shift)"
              data-cy="edit-shift-button"
            ) Edit

            v-btn(
              text
              color="error"
              @click="openDeleteShiftDialog(shift)"
              data-cy="delete-shift-button"
            ) Delete
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component } from 'vue-property-decorator'

import EditJobDialog from './EditJobDialog.vue'
import CloseJobDialog from './CloseJobDialog.vue'
import CreateShiftDialog from './CreateShiftDialog.vue'
import EditShiftDialog from './EditShiftDialog.vue'
import DeleteShiftDialog from './DeleteShiftDialog.vue'
import QrCodeDialog from './QrCodeDialog.vue'

import JobsMap from '@/components/JobsMap.vue'
import ClockEvents from '@/components/ClockEvents.vue'
import ClipboardCopy from '@/components/ClipboardCopy.vue'
import TaskList from '@/components/TaskList.vue'

import { currentUserIs, UserRole } from '@/types/Users'
import { Job, Shift } from '@/types/Jobs'
import { loadJob } from '@/services/jobs'
import * as geolocation from '@/services/geolocation'

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
    ClipboardCopy,
    TaskList,
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
      await loadJob(this.$store, parseInt(this.$route.params.jobId))
    } finally {
      this.loading = false
    }
    await geolocation.init(this.$store)
  }

  get job(): Job {
    return this.$store.getters.job(parseInt(this.$route.params.jobId))
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

  get userLocation() {
    return this.$store.state.users.userLocation
  }

  get navigationUrl() {
    const position = this.userLocation && `${this.userLocation.lat},${this.userLocation.lng}`
    const address = `${this.job.address}, ${this.job.city}, ${this.job.state} ${this.job.zip_code}`
    return `https://www.google.com/maps/dir/?api=1${position ? `&origin=${position}` : ''}&destination=${address}`
  }

  contractorName(contractorId: number) {
    if (!this.job.contractors) return ''
    const contractor = this.job.contractors.find((e) => e.id == contractorId)
    if (!contractor) return 'Unknown contractor'
    return `${contractor.first_name} ${contractor.last_name}`
  }
}
</script>

<style scoped>
.marker {
  background: none;
  border: none;
}
</style>
