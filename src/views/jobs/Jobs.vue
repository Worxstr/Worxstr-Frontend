<template lang="pug">
div
  edit-job-dialog(:opened.sync='createJobDialog')

  portal(to="toolbarActions")
    v-btn(
      v-if='userIsOrgManager'
      @click='createJobDialog = true'
      :icon='$vuetify.breakpoint.xs'
      color='primary'
      text
      data-cy='add-job-button'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-plus
      span(v-if='!$vuetify.breakpoint.xs') Add job

  v-container(fluid v-if="loading && !(directJobs.length || indirectJobs.length)")
    v-skeleton-loader.my-4(type='heading')
    v-skeleton-loader(
      type='list-item, list-item, list-item, list-item, list-item, list-item, list-item'
    )

  .d-flex.flex-column.justify-center(v-else-if='!allJobs.length')
    v-icon.text-h2.ma-5 mdi-calendar-check
    p.text-center.text-body-1 No jobs yet.

  v-container.approvals(v-else)
        
    v-card.mb-3.d-flex.flex-column.soft-shadow(outlined)
      g-map(:jobs='allJobs')
      jobs-list(:jobs='directJobs')

    .mb-5(v-if='indirectJobs.length')
      v-toolbar(flat color='transparent')
        v-toolbar-title.text-h6 Other jobs

      v-card.soft-shadow(outlined)
        jobs-list(:jobs='indirectJobs')
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import { currentUserIs, UserRole } from '@/types/Users'
import { Job } from '@/types/Jobs'
import { loadJobs } from '@/services/jobs'

import GMap from '@/components/GMap.vue'
import JobsList from '@/components/JobsList.vue'
import EditJobDialog from './EditJobDialog.vue'

@Component({
  components: { JobsList, GMap, EditJobDialog },
})
export default class JobsView extends Vue {

  loading = false
  createJobDialog = false

  metaInfo() {
    return { title: 'Jobs' }
  }

  async mounted() {
    this.loading = true
    try {
      await loadJobs(this.$store)
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
    return currentUserIs(UserRole.Admin)
  }
}
</script>