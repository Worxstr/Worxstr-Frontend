<template lang="pug">
div
  new-conversation-dialog(:opened.sync="newConversationDialog")

  portal(to='toolbarActions')
    v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        v-btn(
          text
          color="primary",
          v-bind="attrs",
          v-on="on"
        )
          v-icon(@click="newConversationDialog = true") mdi-plus
          span New
      
  v-container.messages.fill-height.align-start.d-flex.flex-row.pa-md-2.pa-0

    .d-flex.flex-column(
      v-if="$route.name == 'messages' || $vuetify.breakpoint.mdAndUp",
      :style="`width: ${$route.name == 'conversation' ? '35%' : '100%'}`",
      :max-width="$vuetify.breakpoint.mdAndUp ? '35%' : '100%'"
    )
      .mr-md-4(:rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'")
        conversations

    .flex-grow-1.fill-height(
      v-if="$route.name == 'conversation'",
      :rounded="$vuetify.breakpoint.mdAndUp ? 'lg' : '0'"
    )
      router-view
</template>

<script>
import Conversations from "./Conversations";
import NewConversationDialog from "@/views/messages/NewConversationDialog";

export default {
  name: "Messages",
  metaInfo: {
    title: "Messages",
  },
  components: { Conversations, NewConversationDialog },
  data: () => ({
    newConversationDialog: false,
    transitionFinished: false,
  }),
  mounted() {
    setTimeout(() => {
      this.transitionFinished = true;
    }, 50);
  },
};
</script>
