<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-card-title.headline New conversation
    v-card-text
        p Select the person you want to message
        v-autocomplete(
            v-model="selectedUser"
            :items="contacts"
            multiple
            placeholder="Find someone"
            outlined
            dense
            :item-text="(u) => `${u.first_name} ${u.last_name}`",
        )

    v-spacer

    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="primary", @click="deleteShift") Send message
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: "newConversationDialog",
  props: {
    opened: Boolean,
  },
  mounted() {
    this.$store.dispatch('loadContacts');
  },
  computed: {
    ...mapState(['contacts'])
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
    //   await this.$store.dispatch("deleteShift", this.shift.id);
      this.loading = false
      this.closeDialog();
    },
  },
};
</script>