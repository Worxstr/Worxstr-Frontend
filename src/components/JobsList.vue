<template lang="pug">
.jobs-list

  div
    edit-job-dialog(:opened.sync="editJobDialog" :jobId="selectedJobId")
    close-job-dialog(:opened.sync="closeJobDialog" :jobId="selectedJobId")

  v-list(v-if="jobs.length")
    div(
      v-for="(job, i) in jobs"
      :key="job.id"
    )
      v-list-item
        v-badge.mt-1.ml-1(:color='job.color' dot)

        v-list-item-content.ml-6
          v-list-item-title
            router-link.alt-style(:to="{name: 'job', params: {jobId: job.id}}") {{ job.name }}
          v-list-item-subtitle(v-text="job.address")

        v-list-item-action
          v-btn(
            icon
            color='primary'
            @click.stop='openEditJobDialog(job.id)'
            data-cy='edit-job-button'
          )
            v-icon mdi-pencil
            
        v-list-item-action
          v-btn(
            icon
            color='error'
            @click.stop='openCloseJobDialog(job.id)'
            data-cy='close-job-button'
          )
            v-icon mdi-close

        v-list-item-action.ml-0
          v-btn(
            icon
            :to="{name: 'job', params: {jobId: job.id}}"
          )
            v-icon mdi-chevron-right
                
      v-divider(v-if='i != jobs.length - 1')

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Job } from '@/types/Jobs'
import EditJobDialog from '@/views/jobs/EditJobDialog.vue'
import CloseJobDialog from '@/views/jobs/CloseJobDialog.vue'

@Component({
  components: {
    EditJobDialog,
    CloseJobDialog
  }
})
export default class JobsList extends Vue {
  
  @Prop(Array) readonly jobs!: Array<Job>

  editJobDialog = false
  closeJobDialog = false
  selectedJobId: number | null = null

  openEditJobDialog(jobId: number) {
    this.selectedJobId = jobId
    this.editJobDialog = true
  }

  openCloseJobDialog(jobId: number) {
    this.selectedJobId = jobId
    this.closeJobDialog = true
  }
}
</script>