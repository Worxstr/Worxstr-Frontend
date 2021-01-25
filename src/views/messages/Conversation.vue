<template lang="pug">
.messages.d-flex.flex-column(v-if="conversation")
  v-toolbar(flat, rounded="lg")
    v-btn(
      icon,
      v-if="$vuetify.breakpoint.smAndDown",
      @click="$router.push({ name: 'messages' })"
    )
      v-icon mdi-arrow-left

    v-toolbar-title
      span(
        v-for="participant in conversation.participants",
        :key="participant.id",
        v-if="participant.id != authenticatedUser.id"
      )
        | {{ participant.first_name }} {{ participant.last_name }}

  //- transition-group.message-container.px-4.d-flex.flex-column-reverse.align-start(
  //-   name="scroll-y-reverse-transition",
  //-   tag="div"
  //- )
  .message-container.px-4.d-flex.flex-column-reverse.align-start
    .message(
      v-for="message in conversation.messages",
      :key="message.id",
      :class="message.sender_id == authenticatedUser.id ? 'right' : 'left'"
    )
      p.grey.lighten-3.px-4.py-2.mb-2.rounded-xl
        | {{ message.body }}

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
/* eslint-disable @typescript-eslint/camelcase */
import { mapState } from "vuex";

export default {
  name: "Messages",
  mounted() {
    // TODO: get the text input to focus
    console.log(this.$refs.message); //.$el.focus();

    this.$store.dispatch("loadConversation", this.$route.params.conversationId);
  },
  watch: {
    "$route.params.conversationId"(newVal, oldVal) {
      this.messages = [];
    },
  },
  computed: {
    ...mapState(["authenticatedUser"]),
    conversation() {
      const conversation = this.$store.getters.conversation(
        this.$route.params.conversationId
      );
      // conversation.messages = conversation.messages.sort()
      if (conversation && conversation.messages)
        conversation.messages = conversation.messages.reverse();
      return conversation;
    },
  },
  methods: {
    sendMessage() {
      this.$store.dispatch("sendMessage", {
        message: {
          body: this.message,
        },
        conversationId: this.$route.params.conversationId,
      });
      this.message = "";
    },
    participantName(participantId) {
      const participant = this.conversation.participants.find(
        (p) => p.id == participantId
      );
      return participant
        ? `${participant.first_name} ${participant.last_name}`
        : "";
    },
  },
  sockets: {
    connect: function () {
      console.log("Socket connected");
    },
    "message:create": function ({ message, conversation_id }) {
      if (conversation_id == this.$route.params.conversationId)
        this.messages.unshift(message);
    },
  },
  data: () => ({
    message: "",
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