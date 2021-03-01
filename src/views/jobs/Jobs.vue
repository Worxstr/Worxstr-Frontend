<template lang="pug">

v-container(v-if="loading")
  v-skeleton-loader.my-4(type='heading')
  v-skeleton-loader(type='list-item, list-item, list-item, list-item, list-item, list-item, list-item')

v-container.approvals(v-else)

  edit-job-dialog(:opened.sync="createJobDialog" create)

  .mb-5
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Jobs
      v-spacer
      v-btn(text @click="openCreateJobDialog" v-if="userIsOrgManager") Add new job

    v-card(v-if="directJobs.length")
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

    div(v-else).d-flex.flex-column.justify-center
      v-icon.text-h2.ma-5 mdi-calendar-check
      p.text-center.text-body-1 No jobs yet.

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
import { userIs, ORGANIZATION_MANAGER } from '@/definitions/userRoles'

export default {
  name: "jobs",
  data: () => ({
    loading: false,
    createJobDialog: false
  }),
  async mounted() {
    this.loading = true
    await this.$store.dispatch("loadJobs");
    this.loading = false
  },
  computed: {
    ...mapGetters(["directJobs", "indirectJobs"]),
    userIsOrgManager() {
      return this.$store.state.authenticatedUser ? userIs(ORGANIZATION_MANAGER, this.$store.state.authenticatedUser) : false
    }
  },
  components: { EditJobDialog },
  methods: {
    openCreateJobDialog() {
      this.createJobDialog = true
    }
  }
};
</script>