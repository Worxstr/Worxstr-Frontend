<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-card-title.headline Delete shift {{shift.id}}?
    v-card-text {{ employeeName }} will no longer work this shift.
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="deleteShift") Yes, Delete
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script>
export default {
  name: "denyDialog",
  props: {
    opened: Boolean,
    shift: Object,
    employeeName: String,
  },
  data: () => ({
    loading: false,
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async deleteShift() {
      this.loading = true
      await this.$store.dispatch("deleteShift", {
        shiftId: this.shift.id,
        jobId: this.$route.params.jobId
      });
      this.loading = false
      this.closeDialog();
    },
  },
};
</script>