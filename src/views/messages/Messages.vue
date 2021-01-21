<template lang="pug">
v-container.messages.fill-height.align-start.d-flex.flex-row.pa-md-2.pa-0
  v-card.mr-md-4(
    v-if="$route.name == 'messages' || $vuetify.breakpoint.mdAndUp",
    :width="$route.name == 'conversation' ? '30%' : '100%'",
    :max-width="$vuetify.breakpoint.mdAndUp ? '350px' : '100%'",
    :rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'"
  )
    conversations
  v-card.flex-grow-1.fill-height(
    v-if="$route.name == 'conversation'",
    :rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'"
  )
    router-view
</template>

<script>
import Conversations from "./Conversations";

export default {
  name: "Messages",
  components: { Conversations },
};
</script>