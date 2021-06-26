<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="createConversation",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title New conversation

      v-divider

      v-card-text
        p Select the person you want to message
        v-autocomplete(
          autofocus
          v-model="selectedUsers",
          :items="contacts",
          multiple,
          placeholder="Find someone",
          outlined,
          dense,
          :rules="[(v) => v.length != 0]",
          :item-text="(u) => `${u.first_name} ${u.last_name}`",
          :item-value="(u) => u.id"
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(
          text,
          color="primary",
          @click="createConversation",
          :disabled="!isValid"
        ) Send message

      v-fade-transition
        v-overlay(v-if="loading", absolute, opacity=".2")
          v-progress-circular(indeterminate)
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "newConversationDialog",
  props: {
    opened: Boolean,
  },
  mounted() {
    this.$store.dispatch("loadContacts");
  },
  computed: {
    ...mapState(["contacts"]),
  },
  data: () => ({
    isValid: false,
    loading: false,
    selectedUsers: [],
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
      this.$refs.form.reset();
    },
    async createConversation() {
      this.loading = true;
      try {
        const conversation = await this.$store.dispatch(
          "createConversation",
          this.selectedUsers
        );
        this.$router.push({
          name: "conversation",
          params: { conversationId: conversation.id },
        });
        this.closeDialog();
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>