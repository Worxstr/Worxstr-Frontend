<template lang="pug">
v-container(fluid v-if="loading && !(directJobs.length || indirectJobs.length)")
  v-skeleton-loader.my-4(type="heading")
  v-skeleton-loader(
    type="list-item, list-item, list-item, list-item, list-item, list-item, list-item"
  )

v-container.approvals(v-else)
  edit-job-dialog(:opened.sync="createJobDialog", :create="true")

  portal(to="toolbarActions")
    v-btn(
      color="primary",
      text
      :icon='$vuetify.breakpoint.xs'
      @click="openCreateJobDialog",
      v-if="userIsOrgManager"
    )
      v-icon(left) mdi-plus
      span(v-if='!$vuetify.breakpoint.xs') Add job

      
  v-card.mb-3.d-flex.flex-column.soft-shadow
    jobs-map(:jobs='allJobs')
    jobs-list(:jobs='directJobs')
    

  .mb-5(v-if="indirectJobs.length")
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h6 Subordinate jobs

    jobs-list(:jobs='indirectJobs')
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import { userIs, UserRole } from '@/definitions/User'
import { Job } from '@/definitions/Job'

import EditJobDialog from './EditJobDialog.vue'
import JobsMap from '@/components/JobsMap.vue'
import JobsList from '@/components/JobsList.vue'

@Component({
  components: { EditJobDialog, JobsList, JobsMap },
})
export default class JobsView extends Vue {

  loading = false
  createJobDialog = false
  editJobDialog = false

  metaInfo() {
    return { title: 'Jobs' }
  }

  async mounted() {
    this.loading = true
    try {
      await this.$store.dispatch("loadJobs")
    }
    finally {
      this.loading = false
    }
  }

  get directJobs(): Job[] {
    return this.$store.getters.directJobs
  }

  get indirectJobs(): Job[] {
    return this.$store.getters.indirectJobs
  }

  get allJobs(): Job[] {
    return [...this.directJobs, ...this.indirectJobs]
  }

  get userIsOrgManager() {
    return this.$store.state.authenticatedUser ? userIs(UserRole.OrganizationManager, this.$store.state.authenticatedUser) : false
  }

  openCreateJobDialog() {
    this.createJobDialog = true
  }
}
</script>