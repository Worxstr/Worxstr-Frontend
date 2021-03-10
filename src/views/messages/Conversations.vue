<template lang="pug">

v-skeleton-loader(v-if="loading && !conversations.length" type='list-item, list-item, list-item, list-item, list-item, list-item, list-item')

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
        v-list-item-title {{ conversation | groupNameList(authenticatedUser) }}
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