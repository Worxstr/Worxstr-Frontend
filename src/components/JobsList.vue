<template lang="pug">
.jobs-list

  edit-job-dialog(:opened.sync="editJobDialog", :job.sync="selectedJob")
  close-job-dialog(:opened.sync="closeJobDialog", :job.sync="selectedJob")

  v-list(v-if="jobs.length")
    div(
      v-for="(job, i) in jobs"
      :key="job.id"
    )
      v-list-item(
        @click="$router.push({ name: 'job', params: { jobId: job.id } })"
      )
        v-list-item-avatar
          v-badge(:color='job.color' dot)

        v-list-item-content
          v-list-item-title(v-text="job.name")
          v-list-item-subtitle(v-text="job.address")
        
        v-list-item-action
          v-menu(bottom left)
            template(v-slot:activator='{ on, attrs }')
              v-btn(icon v-bind='attrs' v-on='on' @click.native.stop)
                v-icon mdi-dots-vertical
            v-list
              v-list-item(@click='openEditJobDialog(job)')
                v-list-item-icon.mr-3
                  v-icon mdi-pencil
                v-list-item-title Edit
              v-list-item(@click='openCloseJobDialog(job)')
                v-list-item-icon.mr-3
                  v-icon(color='error') mdi-close
                v-list-item-title Close
                
      v-divider(v-if='i != jobs.length - 1')
      

  .d-flex.flex-column.justify-center(v-else)
    v-icon.text-h2.ma-5 mdi-calendar-check
    p.text-center.text-body-1 No jobs yet.

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Job } from '@/definitions/Job.ts'
import EditJobDialog from '@/views/jobs/EditJobDialog.vue'
import CloseJobDialog from '@/views/jobs/CloseJobDialog.vue'

@Component({
  components: {
    EditJobDialog,
    CloseJobDialog,
  },
})
export default class JobsList extends Vue {
  @Prop(Array) readonly jobs!: Array<Job>

  editJobDialog = false
  closeJobDialog = false
  selectedJob: Job | null = null

  openEditJobDialog(job: Job) {
    this.selectedJob = job
    this.editJobDialog = true
  }

  openCloseJobDialog(job: Job) {
    this.selectedJob = job
    this.closeJobDialog = true
  }
}
</script>
