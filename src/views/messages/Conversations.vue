<template lang="pug">

v-skeleton-loader(v-if="loading" type='list-item, list-item, list-item, list-item, list-item, list-item, list-item')

v-card.conversations(v-else)
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
            v-for="(participant, index) in conversation.participants",
            :key="participant.id",
            v-if="participant.id != authenticatedUser.id"
          )
            | {{ participant.first_name }}
            span(v-if="conversation.participants.length == 2") &nbsp;{{ participant.last_name }}
            span(v-if="index != conversation.participants.length - 1 && conversation.participants.length != 2")
              | ,&nbsp;
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "Conversations",
  async mounted() {
    this.loading = true
    await this.$store.dispatch("loadConversations");
    this.loading = false
  },
  data: () => ({
    loading: false,
  }),
  computed: {
    ...mapState(["authenticatedUser"]),
    ...mapGetters(["conversations"]),
  },
};
</script>