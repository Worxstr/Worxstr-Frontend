<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-card-title.headline Close {{job.name}}?
    v-card-text This cannot be undone.
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="closeJob") Yes, Close
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script>
export default {
  name: "closeJobDialog",
  props: {
    opened: Boolean,
    job: Object,
    employeeName: String,
  },
  data: () => ({
    loading: false,
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async closeJob() {
      this.loading = true
      await this.$store.dispatch("closeJob", this.job.id);
      this.loading = false
      this.closeDialog();
      this.$router.push({name: 'jobs'})
    },
  },
};
</script>