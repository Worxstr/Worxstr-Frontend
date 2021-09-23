<template lang="pug">

v-skeleton-loader(v-if="loading && !conversations.length" type='list-item, list-item, list-item, list-item, list-item, list-item, list-item')

.conversations(v-else)
  v-list(color="transparent")
    div(
      v-for="(conversation, i) in conversations",
      :key="conversation.id",
    )
      v-list-item(
        two-line
        link,
        activeclass="primary--text",
        :to="{ name: 'conversation', params: { conversationId: conversation.id } }"
      )
        v-list-item-content
          v-list-item-title {{ conversation | groupNameList(authenticatedUser) }}
          v-list-item-subtitle(
            v-if='conversation.messages.length'
          ) {{ conversation.messages[conversation.messages.length - 1].body }}
        v-list-item-action(
          v-if='conversation.messages.length'
        )
          v-list-item-action-text {{ conversation.messages[conversation.messages.length - 1].timestamp | dateOrTime }}

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