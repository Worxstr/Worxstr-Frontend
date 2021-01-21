<template lang="pug">
.conversations
  v-list(color="transparent")
    v-list-item(
      v-for="n in [1, 2, 3, 4, 5]",
      :key="n",
      link,
      activeclass="primary--text",
      :to="{ name: 'conversation', params: { conversationId: n } }"
    )
      v-list-item-content
        v-list-item-title Conversation {{ n }}
</template>

<script>
export default {
  name: "Conversations",
};
</script>