<template>
  <v-container class="approvals">
    <div class="mb-5">
      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Jobs</v-toolbar-title>
      </v-toolbar>

      <v-card>
        <v-list>
          <v-list-item
            v-for="job in 7"
            :key="job"
            link
            :to="{ name: 'job', params: { jobId: job } }"
          >
            <v-list-item-content>
              <v-list-item-title
                v-text="`Test job number ${job}`"
              ></v-list-item-title>

              <v-list-item-subtitle v-text="'Location'"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>

      <v-toolbar flat color="transparent">
        <v-toolbar-title class="text-h6">Subordinate jobs</v-toolbar-title>
      </v-toolbar>

      <v-card>
        <v-list>
          <v-list-item
            v-for="job in 5"
            :key="job"
            link
            :to="{ name: 'job', params: { jobId: job } }"
          >
            <v-list-item-content>
              <v-list-item-title
                v-text="`Test job number ${job}`"
              ></v-list-item-title>

              <v-list-item-subtitle v-text="'Location'"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "jobs",
  data: () => ({}),
};
</script>