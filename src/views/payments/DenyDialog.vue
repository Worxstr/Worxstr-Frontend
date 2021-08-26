<template lang="pug">
v-dialog(
  id="payment-dialog"
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-card-title.headline
      span
        | Deny
        | {{timecards.length}}
        | payment{{timecards.length == 1 ? '' : 's'}}?

    v-card-text(v-if="timecards")
      | {{timecards.length == 1 ? `${timecards[0].first_name} ${timecards[0].last_name}` : 'These contractors' }}
      | will not be paid for this shift.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="denyTimecard") Deny
</template>

<script>
export default {
  name: "denyDialog",
  props: {
    opened: Boolean,
    timecardIds: Array,
  },
  computed: {
    timecards() {
      return this.$store.getters.timecardsByIds(this.timecardIds)
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
  }
};
</script>