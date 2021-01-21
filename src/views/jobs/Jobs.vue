<template>
  <v-container class="approvals">
    <div class="mb-5" v-if="directJobs.length">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Jobs</v-toolbar-title>
        <v-spacer/>
        <v-btn text>Add new job</v-btn>
      </v-toolbar>

      <v-card>
        <v-list>
          <v-list-item
            v-for="job in directJobs"
            :key="job.id"
            link
            :to="{ name: 'job', params: { jobId: job.id } }"
          >
            <v-list-item-content>
              <v-list-item-title v-text="job.name" />
              <v-list-item-subtitle v-text="job.address" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <div class="mb-5" v-if="indirectJobs.length">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Subordinate jobs</v-toolbar-title>
      </v-toolbar>

      <v-card>
        <v-list>
          <v-list-item
            v-for="job in indirectJobs"
            :key="job.id"
            link
            :to="{ name: 'job', params: { jobId: job.id } }"
          >
            <v-list-item-content>
              <v-list-item-title v-text="job.name" />
              <v-list-item-subtitle v-text="job.address" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "jobs",
  mounted() {
    this.$store.dispatch("loadJobs");
  },
  computed: {
    ...mapGetters(["directJobs", "indirectJobs"]),
  },
};
</script>