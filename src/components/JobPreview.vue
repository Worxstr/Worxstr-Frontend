<template lang="pug">
.job-preview.pa-3.d-flex.flex-column
  .d-flex
    v-badge(:color='job.color' dot)
    h4.text-h6 {{ job.name }}

  p.text-caption {{ job.address }}
    br
    | {{ job.city }}, {{ job.state }} {{ job.zip_code }}, {{ job.country }}

  .d-flex
    v-spacer
    v-btn(color='primary' text :to="{name: 'job', params: {jobId: job.id}}") View job

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { loadJob } from '@/services/jobs'

@Component
export default class JobPreview extends Vue {
  @Prop({ type: Number }) jobId!: number
  
  async mounted() {
    await loadJob(this.$store, this.jobId)
  }

  get job() {
    return this.$store.getters.job(this.jobId)
  }
}
</script>