<template lang="pug">

v-skeleton-loader(v-if="loading && !conversations.length" type='list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line')

.conversations(v-else)
  v-list(color="transparent")
    div(
      v-for="(conversation, i) in conversations",
      :key="conversation.id",
    )
      v-list-item(
        two-line
        link
        active-class="primary--text"
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
import { Component, Vue } from 'vue-property-decorator'
import { loadConversations } from '@/services/messages'

@Component()
export default class Conversations extends Vue {
  loading = false

  get authenticatedUser() {
    return this.$store.state.authenticatedUser
  }

  get conversations() {
    return this.$store.getters.conversations
  }

  async mounted() {
    this.loading = true
    try {
      await loadConversations(this.$store)
    }
    finally {
      this.loading = false
    }
  }
}
</script>