<template lang="pug">
v-container.messages.fill-height.align-start.d-flex.flex-row.pa-md-2.pa-0
  new-conversation-dialog(:opened.sync="newConversationDialog")
  v-btn(
    v-if="!$vuetify.breakpoint.mdAndUp && $route.name != 'conversation'",
    fab,
    app,
    absolute,
    bottom,
    right,
    color="primary",
    style="transform: translatey(-180%)",
    @click="newConversationDialog = true"
  )
    v-icon mdi-plus

  .d-flex.flex-column(
    v-if="$route.name == 'messages' || $vuetify.breakpoint.mdAndUp",
    :style="`width: ${$route.name == 'conversation' ? '35%' : '100%'}`",
    :max-width="$vuetify.breakpoint.mdAndUp ? '35%' : '100%'"
  )
    v-toolbar(flat, color="transparent")
      v-toolbar-title.text-h5.font-weight-medium Messages
      v-spacer
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon, color="primary", v-if="$vuetify.breakpoint.mdAndUp" v-bind="attrs" v-on="on")
            v-icon(@click="newConversationDialog = true") mdi-plus
        span New conversation

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
  components: { Conversations, NewConversationDialog },
  data: () => ({
    newConversationDialog: false,
  }),
};
</script>
