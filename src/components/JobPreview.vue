<template lang="pug">
.job-preview(:style='`border-top: 3px solid ${job.color}`')
  g-map(
    :jobs='[job]'
    :users='job.contractors'
    :show-device-location='true'
    :height="$vuetify.breakpoint.mdAndUp ? '25vh' : '35vh'"
  )

  v-card-text.pb-1
    .d-flex.flex-column
      h6.text-body-1
        router-link.alt-style(
          :to="{name: 'job', params: { jobId: job.id }}"
        ) {{ (job && job.name) ? job.name : job.id }}

      .text-body-2 {{ job.address }}
      .text-body-2(v-if='countShifts') {{ countShifts }} {{ countShifts > 1 ? 'shifts' : 'shift' }}

  v-card-actions
    v-spacer
    v-btn(
      text
      color='primary'
      :to="{name: 'job', params: {jobId: job.id}}"
      exact
    ) View job
</template>

<script lang="ts">
import { Job } from '@/types/Jobs'
import { Vue, Component, Prop } from 'vue-property-decorator'
import GMap from '@/components/GMap.vue'

@Component({
  components: {
    GMap,
  },
})
export default class JobPreview extends Vue {
  @Prop({ required: true }) job!: Job

  get countShifts() {
    return this.job.shifts?.length || null
  }
}
</script>

<style lang="scss">
.job-preview {
  border-radius: 4px
}
</style>