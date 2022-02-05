<template lang="pug">
v-container.d-flex.flex-column.pt-6.gap-small

  portal(to='toolbarActions')
    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='primary'
      data-cy='edit-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-pencil
      span(v-if='!$vuetify.breakpoint.xs') Edit

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='success'
      data-cy='edit-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-check
      span(v-if='!$vuetify.breakpoint.xs') Complete

    v-btn(
      text
      :icon='$vuetify.breakpoint.xs'
      color='error'
      data-cy='delete-shift-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
      span(v-if='!$vuetify.breakpoint.xs') Deny
  
  div
    h3.text-h3.green--text +{{ 123.45 | currency }}
    h6.text-h6 To Alex Wohlbruck


  masonry(:cols='{default: 2, 959: 1}' :gutter='30')

    .mb-4.d-flex.flex-column.gap-small
      h5.text-h5 Shift worked
      v-sheet(outlined rounded)
        v-card-text.pb-1
          .d-flex.flex-column


            h6.text-body-1
              | Front of store - &nbsp;
              router-link.alt-style(
                :to="{name: 'job', params: { jobId: 1 }}"
              ) Alex's Test Job

            .text-body-2 {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | time }} - {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | time }}
            .text-body-2 {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | date('MMM D, YYYY') }} - {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | date('MMM D, YYYY') }}

        v-card-actions
          v-spacer
          v-btn(
            text
            color='primary'
            :to="{name: 'shift', params: {shiftId: 1}}"
            exact
          ) View shift
          v-btn(
            text
            color='primary'
            :to="{name: 'job', params: {jobId: 1}}"
            exact
          ) View job
    
    .mb-4.d-flex.flex-column.gap-small
      h5.text-h5 Timecard
      v-sheet(outlined rounded)
        v-card-text
          h6.text-body-1 Worked for 4 hours
          span 1 hour break
        
        v-divider

        clock-events(:events='history')
          
    .mb-4.d-flex.flex-column.gap-small
      h5.text-h5 ACH transfer
      v-sheet(outlined rounded)
        v-card-text
          v-chip.mr-3(
            small
            :color='`${statusColor("processed")} ${$vuetify.theme.dark ? "darken" : "lighten"}-3`'
          )
            | {{ 'processed' | capitalize }}
          span {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | date('MMM D, YYYY') }}, {{ 'Sat, 05 Feb 2022 03:54:46 GMT' | time }}

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ClockEvents from '@/components/ClockEvents.vue'

@Component({
  metaInfo: {
    title: 'Payment',
  },
  components: {
    ClockEvents
  }
})
export default class Payment extends Vue {
  
  history = [{"action":1,"contractor_id":162,"id":1184,"job_id":114,"shift_id":748,"time":"2022-02-05T03:30:01Z","timecard_id":457},{"action":2,"contractor_id":162,"id":1185,"job_id":114,"shift_id":748,"time":"2022-02-05T03:30:07Z","timecard_id":457}]

  // TODO: Duplicated in TransferHistory.vue
  // TODO: DRY
  statusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'amber'
      case 'processed':
        return 'green'
      case 'cancelled':
        return 'deep-orange'
      case 'failed':
        return 'red'
      default:
        return 'primary'
    }
  }
}
</script>