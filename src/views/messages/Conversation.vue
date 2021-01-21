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
      :class="message.pos"
    )
      span {{ message.text }}

  form.d-flex.flex-row.align-center.pa-3(@submit.prevent="sendMessage")
    v-text-field(
      v-model="message",
      ref="message",
      background-color="grey lighten-3",
      flat,
      hide-details,
      rounded,
      solo,
      placeholder="Type a message..."
    )
    
    v-btn.ml-3(color="primary", icon, type="submit")
      v-icon mdi-send
</template>

<script>
let id = 6;

export default {
  name: "Messages",
  mounted() {
    // TODO: doesnt' work
    this.$refs.message.$el.focus();
  },
  methods: {
    sendMessage() {
      console.log(this.message);
      console.log(this.$socket);

      this.$socket.emit("message", {
        text: this.message,
      });
    },
  },
  sockets: {
    connect: function () {
      console.log("socket connected");
    },
    newMessage: function ({ message }) {
      this.messages.unshift({
        text: message,
        pos: "right",
        id,
      });
      id++;
      this.message = "";
    },
  },
  data: () => ({
    message: "",

    messages: [
      {
        text: "Love u",
        pos: "right",
        id: 5,
      },
      {
        text: "Ok do good work lol",
        pos: "left",
        id: 4,
      },
      {
        text: "Nothing my shift is starting",
        pos: "right",
        id: 3,
      },
      {
        text: "What's up",
        pos: "left",
        id: 2,
      },
      {
        text: "Hi",
        pos: "right",
        id: 1,
      },
      {
        text: "Hello!",
        pos: "left",
        id: 0,
      },
    ],
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