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
    edit-job-dialog(:opened.sync="editJobDialog" :job-id="job.id")
    close-job-dialog(:opened.sync="closeJobDialog" :job-id="job.id")
    qr-code-dialog(
      :opened.sync='qrCodeDialog'
      :code='job.consultant_code'
    )
    create-invoice-dialog(:opened.sync='createInvoiceDialog' :job-id="job.id")

    portal(to="toolbarActions")
      v-btn(
        color="primary",
        text
        :icon='$vuetify.breakpoint.xs'
        @click='createInvoiceDialog = true'
        :disabled='!iAmVerified'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-receipt
        span(v-if='!$vuetify.breakpoint.xs') Create invoice

      v-btn(
        v-if="userIsOrgManager",
        text,
        :icon='$vuetify.breakpoint.xs'
        color='primary'
        @click="editJobDialog = true"
        :disabled='!job.id'
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
        :disabled='!job.id'
        data-cy='close-job-button'
      )
        v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
        span(v-if='!$vuetify.breakpoint.xs') Close

    v-card.mb-3.d-flex.flex-column.flex-lg-row.soft-shadow(
      outlined
      :style='`border-top: 3px solid ${job.color}`'
    )
      
      g-map(
        :jobs='[job]'
        :users='job.contractors'
        :show-device-location='true'
        :style='$vuetify.breakpoint.lgAndUp && `width: 50%`'
      )

      .flex-grow-1
        v-card-text.d-flex.pb-0.flex-column.flex-sm-row.gap-small
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
          .d-flex.flex-row.align-center(v-if='userIsManager && job.restrict_by_code')
              
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

              v-progress-circular.mx-2(indeterminate size='21' color='primary' v-if='refreshingClockInCode')
              v-tooltip(v-else-if='userIsManager' bottom)
                span Refresh code
                template(v-slot:activator='{ on, attrs }')
                  v-btn(
                    icon
                    color='primary'
                    v-bind='attrs'
                    v-on='on'
                    @click='refreshClockInCode'
                  )
                    v-icon mdi-refresh

        //- Job notes
        v-card-text(v-if='job.notes')
          p.text-subtitle-2.mb-2 Notes
          v-sheet(outlined rounded)
            v-card-text
              div(v-html='job.notes')

        v-card-text(v-if='job.restrict_by_code || job.restrict_by_time || job.restrict_by_location')
          p.text-subtitle-2.mb-2 Presence verification restrictions
          .d-flex.gap-xs
            v-chip(small label v-if='job.restrict_by_code') Clock-in code
            v-chip(small label v-if='job.restrict_by_location') Location
            v-chip(small label v-if='job.restrict_by_time') Time
              .text-xs.font-weight-bold.ml-1 ({{ job.restrict_by_time_window }} min window)

        //- Job info fields
        v-card-text.px-5.flex-column.flex-sm-row.flex-lg-column.justify-space-between
        
          .flex-grow-1(v-if='job.organization_manager')
            p.text-subtitle-2.mb-1 Organization manager
            p
              router-link.alt-style(
                :to="{name: 'user', params: {userId: job.organization_manager.id}}"
              )
                | {{ job.organization_manager.name }}

          .flex-grow-1(v-if='job.contractor_manager')
            p.text-subtitle-2.mb-1 Contractor manager
            p
              router-link.alt-style(
                :to="{name: 'user', params: {userId: job.contractor_manager.id}}"
              )
                | {{ job.contractor_manager.name }}

          .flex-grow-1(v-if='job.consultant_name && job.consultant_email && job.consultant_phone')
            p.text-subtitle-2.mb-1 Consultant
            .d-flex.flex-column.gap
              span.mb-0 {{ job.consultant_name }}
              a.mb-0(target='_blank' :href='`mailto:${job.consultant_email}`') {{ job.consultant_email }}
              a(target='_blank' :href='`tel:${job.consultant_phone}`')    {{ job.consultant_phone | phone }}
    
    shift-list(:shifts='job.shifts' :loading='loading' :job-id='job.id')

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component } from 'vue-property-decorator'

import EditJobDialog from './EditJobDialog.vue'
import CloseJobDialog from './CloseJobDialog.vue'
import EditShiftDialog from './EditShiftDialog.vue'
import QrCodeDialog from './QrCodeDialog.vue'
import CreateInvoiceDialog from '@/views/payments/CreateInvoiceDialog.vue'

import GMap from '@/components/GMap.vue'
import ClockEvents from '@/components/ClockEvents.vue'
import ClipboardCopy from '@/components/ClipboardCopy.vue'
import TaskList from '@/components/TaskList.vue'
import ShiftList from '@/components/ShiftList.vue'

import { currentUserIs, UserRole, Managers } from '@/types/Users'
import { Job } from '@/types/Jobs'
import { loadJob, refreshClockInCode } from '@/services/jobs'

@Component({
  components: {
    EditJobDialog,
    CloseJobDialog,
    EditShiftDialog,
    QrCodeDialog,
    CreateInvoiceDialog,
    GMap,
    ClockEvents,
    ClipboardCopy,
    TaskList,
    ShiftList,
  },
})
export default class JobView extends Vue {
  loading = false
  editJobDialog = false
  closeJobDialog = false
  createShiftDialog = false
  qrCodeDialog = false
  createInvoiceDialog = false
  refreshingClockInCode = false
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
  }

  get job(): Job {
    return this.$store.getters.job(parseInt(this.$route.params.jobId))
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get userIsOrgManager() {
    return currentUserIs(UserRole.OrganizationManager)
  }

  openQrCodeDialog() {
    this.qrCodeDialog = true
  }

  get userLocation() {
    return this.$store.state.users.userLocation
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

  get navigationUrl() {
    const position = this.userLocation && `${this.userLocation.lat},${this.userLocation.lng}`
    const address = `${this.job.address}, ${this.job.city}, ${this.job.state} ${this.job.zip_code}`
    return `https://www.google.com/maps/dir/?api=1${position ? `&origin=${position}` : ''}&destination=${address}`
  }

  async refreshClockInCode() {
    this.refreshingClockInCode = true
    try {
      await refreshClockInCode(this.$store, this.job.id)
    }
    finally {
      this.refreshingClockInCode = false
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
