<template lang="pug">
v-card.conversations
  v-list(color="transparent")
    v-list-item(
      v-for="conversation in conversations",
      :key="conversation.id",
      link,
      activeclass="primary--text",
      :to="{ name: 'conversation', params: { conversationId: conversation.id } }"
    )
      v-list-item-content
        v-list-item-title
          span(
            v-for="participant in conversation.participants",
            :key="participant.id",
            v-if="participant.id != authenticatedUser.id"
          )
            | {{ participant.first_name }} {{ participant.last_name }}
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "Conversations",
  async mounted() {
    await this.$store.dispatch("loadConversations");
  },
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["conversations"]),
  },
};
</script>