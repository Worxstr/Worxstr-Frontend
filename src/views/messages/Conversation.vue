<template lang="pug">
.messages.d-flex.flex-column
  v-toolbar(flat, rounded="lg")
    v-btn(
      icon,
      v-if="$vuetify.breakpoint.smAndDown",
      @click="$router.push({ name: 'messages' })"
    )
      v-icon mdi-arrow-left

    v-toolbar-title
      | Conversation {{ $route.params.conversationId }}

  transition-group.message-container.px-4.d-flex.flex-column-reverse.align-start(
    name="scroll-y-reverse-transition",
    tag="div"
  )
    .message.grey.lighten-3.px-4.py-2.mb-2.rounded-xl(
      v-for="message in messages",
      :key="message.id",
      :class="message.sender.id == authenticatedUser.id ? 'right' : 'left'"
    )
      span {{message.sender.first_name}} {{message.sender.last_name}}: {{ message.text }}

  form.d-flex.flex-row.align-center.pa-3(@submit.prevent="sendMessage")
    v-text-field(
      v-model="message",
      ref="message",
      background-color="grey lighten-3",
      flat,https://stackoverflow.com/questions/65854015/get-the-the-flask-security-user-id-in-a-flask-socketio-event/65865820#65865820
      hide-details,
      rounded,
      solo,
      placeholder="Type a message..."
    )
    
    v-btn.ml-3(color="primary", icon, type="submit")
      v-icon mdi-send
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */
import { mapState } from 'vuex'

export default {
  name: "Messages",
  mounted() {
    // TODO: doesnt' work
    this.$refs.message.$el.focus();https://stackoverflow.com/questions/65854015/get-the-the-flask-security-user-id-in-a-flask-socketio-event/65865820#65865820
  },
  watch: {
    '$route.params.conversationId'(newVal, oldVal) {
      this.messages = []
    }
  },
  computed: {
    ...mapState(['authenticatedUser'])
  },
  methods: {
    sendMessage() {
      this.$socket.emit("message:create", {
        message: {
          text: this.message,
        },
        user_id: this.authenticatedUser.id,
        conversation_id: this.$route.params.conversationId
      });
      this.message = "";
    },
  },
  sockets: {
    connect: function () {
      console.log("Socket connected");
    },
    'message:create': function ({ message, conversation_id }) {
      if (conversation_id == this.$route.params.conversationId)
        this.messages.unshift(message)
    },
  },
  data: () => ({
    message: "",
    messages: [],
  }),
};
</script>

<style lang="scss" scoped>
.messages {
  height: 100%;
}

.message-container {
  height: 100%;
  overflow-y: auto;
}

.message {
  transition: all 0.2s;
}
.message.left {
  align-self: flex-start;
}
.message.right {
  align-self: flex-end;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.2s;
}
.message-enter,
.message-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.message-move {
  transition: transform 0.2s;
}
</style>