<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="headline"> Approve all timecards? </v-card-title>
      <v-card-text> This will approve all unapproved timecards </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()"> Cancel </v-btn>
        <v-btn color="green" text> Approve all </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "approveAllDialog",
  props: {
    timecard: Object,
    opened: Boolean,
  },
  data: () => ({
    payWithCash: false,
  }),
  methods: {
    async approveTimecard() {
      await this.$store.dispatch("approveTimecard", {
        id: this.timecard.id,
        approved: true,
        paypal: !this.payWithCash,
      });
      this.closeDialog()
    },
    closeDialog() {
      this.$emit("update:opened", false);
    },
  },
};
</script>