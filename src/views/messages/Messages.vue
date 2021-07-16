<template lang="pug">
div.pa-2
  new-conversation-dialog(:opened.sync="newConversationDialog")

  portal(to="toolbarActions")
    v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        v-btn(text, color="primary", v-bind="attrs", v-on="on")
          v-icon(@click="newConversationDialog = true") mdi-plus
          span New
      
  v-card.messages.pa-0.d-flex.flex-row.fill-height.align-start.soft-shadow(fluid)
    div(
      v-if="$route.name == 'messages' || $vuetify.breakpoint.mdAndUp",
      :style="`width: ${$route.name == 'conversation' ? '35%' : '100%'}`",
      :max-width="$vuetify.breakpoint.mdAndUp ? '35%' : '100%'"
    )
      conversations
  
    v-divider(vertical)

    .flex-grow-1.fill-height(
      v-if="$route.name == 'conversation'",
      :rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'"
    )
      router-view
</template>

<script>
import Conversations from './Conversations'
import NewConversationDialog from '@/views/messages/NewConversationDialog'

export default {
  name: 'Messages',
  metaInfo: {
    title: 'Messages',
  },
  components: { Conversations, NewConversationDialog },
  data: () => ({
    newConversationDialog: false,
    transitionFinished: false,
  }),
  mounted() {
    setTimeout(() => {
      this.transitionFinished = true
    }, 50)
  },
}
</script>
