<template lang="pug">
div.pa-2
  new-conversation-dialog(:opened.sync="newConversationDialog")

  portal(to="toolbarActions")
    v-tooltip(bottom)
      span New conversation
      template(v-slot:activator="{ on, attrs }")
        v-btn(
          text
          color="primary"
          :icon='$vuetify.breakpoint.xs'
          @click="newConversationDialog = true"
          v-bind="attrs"
          v-on="on"
        )
          v-icon(:left='!$vuetify.breakpoint.xs') mdi-plus
          span(v-if='$vuetify.breakpoint.smAndUp') New
      
  v-card.messages.pa-0.d-flex.flex-row.fill-height.align-start.soft-shadow
    div(
      v-if="$route.name == 'messages' || $vuetify.breakpoint.mdAndUp",
      :style="`width: ${$route.name == 'conversation' ? '35%' : '100%'}; height: 100%`",
      :max-width="$vuetify.breakpoint.mdAndUp ? '35%' : '100%'"
    )
      conversations(@newConversation='newConversationDialog = true')
  
    v-divider(vertical)

    .flex-grow-1.fill-height(
      v-if="$route.name == 'conversation'",
      :rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'"
    )
      router-view
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Conversations from './Conversations.vue'
import NewConversationDialog from '@/views/messages/NewConversationDialog.vue'

@Component({
  metaInfo: {
    title: 'Messages',
  },
  components: { Conversations, NewConversationDialog }
})
export default class Messages extends Vue {
  newConversationDialog = false
  transitionFinished = false

  mounted() {
    setTimeout(() => {
      this.transitionFinished = true
    }, 50)
  }
}
</script>
