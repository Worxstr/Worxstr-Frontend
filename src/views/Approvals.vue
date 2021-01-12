<template>
  <v-container class="approvals">
    <h4 class="text-h4 font-weight-bold mb-2">Approvals</h4>

    <div v-for="timecard in timecards" :key="timecard.id">
      <code>
        {{ timecard }}
      </code>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "approvals",
  mounted() {
    this.$store.dispatch("loadApprovals");
  },
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["timecards"]),
  },
  methods: {
    ...mapActions(["signOut"]),
  },
};
</script>