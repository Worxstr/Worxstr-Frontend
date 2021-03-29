<template lang="pug">
v-card.messages.d-flex.flex-column(v-if="conversation")
  v-toolbar(flat, rounded="lg")
    v-btn(
      icon,
      v-if="$vuetify.breakpoint.smAndDown",
      @click="$router.push({ name: 'messages' })"
    )
      v-icon mdi-arrow-left

    v-toolbar-title {{ conversation | groupNameList(authenticatedUser) }}

  //- transition-group.message-container.px-4.d-flex.flex-column-reverse.align-start(
  //-   name="scroll-y-reverse-transition",
  //-   tag="div"
  //- )
  .message-container.px-4.d-flex.flex-column-reverse.align-start
    .message.d-flex.flex-column(
      v-for="(message, i) in conversation.messages"
      :key="message.id"
      :class="message.sender_id == authenticatedUser.id ? 'right' : 'left'"
    )
      p.px-4.py-2.mb-2.rounded-xl.grey(
        :class="{ 'lighten-3': !$vuetify.theme.dark, 'darken-3': $vuetify.theme.dark }"
      ) 
        | {{ message.body }}

      p.text-caption.text--disabled(v-if='showInfo(i)')
        span(v-if='message.sender_id != authenticatedUser.id') {{ participant(message.sender_id).first_name }} -&nbsp;
        span(v-if='isToday(message.timestamp)') {{ message.timestamp | date('MMM D') }},&nbsp;
        span {{ message.timestamp | time }}

  form.d-flex.flex-row.align-center.pa-3(@submit.prevent="sendMessage")
    v-text-field(
      v-model="message"
      ref="message"
      :background-color="`grey ${$vuetify.theme.dark ? 'darken' : 'lighten'}-3`"
      flat
      hide-details
      rounded
      solo
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
  metaInfo() {
    return {
      title: this.conversation
        ? this.$options.filters.groupNameList(this.conversation, this.authenticatedUser)
        : 'Conversation'
    }
  },
  mounted() {
    // TODO: get the text input to focus
    console.log(this.$refs.message); //.$el.focus();

    this.$store.dispatch("loadConversation", this.$route.params.conversationId);
  },
  watch: {
    "$route.params.conversationId"() {
      this.messages = [];
    },
  },
  data: () => ({
    message: "",
  }),
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
    // Determine if the message info should be shown
    showInfo(messageIndex) {
      const current = this.conversation.messages[messageIndex]
      const next = this.conversation.messages[messageIndex + 1]

      if (next) {
        // The messages were sent by different users
        if (current.sender_id != next.sender_id) return true

        // The messages were sent more than a minute apart
        return ((new Date(next.timestamp)).getTime()) - (new Date(current.timestamp)).getTime() > (60 * 1000)
      }
      return true;
    },
    // Check if the message was sent today
    isToday(timestamp) {
      const now = (new Date())
      const then = (new Date(timestamp))
      return !(
        now.getUTCDay() == then.getUTCDay() &&
        now.getUTCMonth() == then.getUTCMonth() &&
        now.getUTCFullYear() == then.getUTCFullYear()
      )
    },
    sendMessage() {
      this.$socket.emit("test", { test: 1 });
      this.$store.dispatch("sendMessage", {
        message: {
          body: this.message,
        },
        conversationId: this.$route.params.conversationId,
      });
      this.message = "";
    },
    participant(participantId) {
      const participant = this.conversation.participants.find(
        (p) => p.id == participantId
      );
      return participant
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
  align-items: flex-start;
}
.message.right {
  align-self: flex-end;
  align-items: flex-end;
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