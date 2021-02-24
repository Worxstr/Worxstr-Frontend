<template lang="pug">
v-container.approvals

  edit-job-dialog(:opened.sync="createJobDialog" create)

  .mb-5(v-if="directJobs.length")
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Jobs
      v-spacer
      v-btn(text @click="openCreateJobDialog") Add new job

    v-card
      v-list
        v-list-item(
          v-for="job in directJobs"
          :key="job.id"
          link
          :to="{ name: 'job', params: { jobId: job.id } }"
        )
          v-list-item-content
            v-list-item-title(v-text="job.name")
              v-list-item-subtitle(v-text="job.address")

  .mb-5(v-if="indirectJobs.length")
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Subordinate jobs
      
    v-card
      v-list
        v-list-item(
          v-for="job in indirectJobs"
          :key="job.id"
          link
          :to="{ name: 'job', params: { jobId: job.id } }"
        )
          v-list-item-content
            v-list-item-title(v-text="job.name")
              v-list-item-subtitle(v-text="job.address")

</template>

<script>
import { mapGetters } from "vuex";
import EditJobDialog from './EditJobDialog'

export default {
  name: "jobs",
  mounted() {
    this.$store.dispatch("loadJobs");
  },
  computed: {
    ...mapGetters(["directJobs", "indirectJobs"]),
  },
  components: { EditJobDialog },
  data: () => ({
    createJobDialog: false
  }),
  methods: {
    openCreateJobDialog() {
      this.createJobDialog = true
    }
  }
};
</script>