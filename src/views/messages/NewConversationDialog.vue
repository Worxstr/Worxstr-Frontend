<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-card-title.headline New conversation
    v-card-text
        p Select the person you want to message
        v-autocomplete(
            v-model="selectedUser"
            :items="people"
            placeholder="Find someone"
            outlined
            dense
            :item-text="(u) => `${u.first_name} ${u.last_name}`",
        )

    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="primary", @click="deleteShift") Send message
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script>
export default {
  name: "newConversationDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
    loading: false,
    people: [
        // eslint-disable-next-line @typescript-eslint/camelcase
        { first_name: 'Employee', last_name: 'One', id: 1 },
        // eslint-disable-next-line @typescript-eslint/camelcase
        { first_name: 'Employee', last_name: 'Two', id: 2 },
    ]
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    async deleteShift() {
      this.loading = true
    //   await this.$store.dispatch("deleteShift", this.shift.id);
      this.loading = false
      this.closeDialog();
    },
  },
};
</script>