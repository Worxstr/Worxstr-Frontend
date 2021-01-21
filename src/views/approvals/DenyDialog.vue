<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-card-title.headline Deny timecard?
    v-card-text
      | {{ timecard.first_name }} {{ timecard.last_name }} will not be paid for
      | this shift.
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="denyTimecard") Yes, Deny
</template>

<script>
export default {
  name: "denyDialog",
  props: {
    opened: Boolean,
    timecard: Object,
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async denyTimecard() {
      await this.$store.dispatch("denyTimecards", [
        {
          id: this.timecard.id,
          denied: true,
        },
      ]);
      this.closeDialog();
    },
  },
};
</script>