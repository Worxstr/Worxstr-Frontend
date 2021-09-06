<template lang="pug">

v-skeleton-loader(v-if="loading && !conversations.length" type='list-item, list-item, list-item, list-item, list-item, list-item, list-item')

.conversations(v-else)
  v-list(color="transparent")
    div(
      v-for="(conversation, i) in conversations",
      :key="conversation.id",
    )
      v-list-item(
        link,
        activeclass="primary--text",
        :to="{ name: 'conversation', params: { conversationId: conversation.id } }"
      )
        v-list-item-content
          v-list-item-title {{ conversation | groupNameList(authenticatedUser) }}

      v-divider(v-if='i != conversations.length - 1')
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "Conversations",
  async mounted() {
    this.loading = true
    try {
      await this.$store.dispatch("loadConversations")
    }
    finally {
      this.loading = false
    }
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