<template lang="pug">
.messages.d-flex.flex-column(v-if="conversation")
  transition-group.message-container.px-4.pt-4.d-flex.flex-column.align-stretch(
    name="scroll-y-reverse-transition",
    tag="div"
    v-chat-scroll
  )
    v-spacer(key='spacer')
    .message.d-flex.flex-column(
      v-for="(message, i) in conversation.messages"
      :key="message.id"
      :class="sentByMe(message) ? 'right' : 'left'"
    )
      p.px-4.py-2.mb-1.rounded-xl(
        :class="{\
          'lighten-2': !$vuetify.theme.dark,\
          'darken-2': $vuetify.theme.dark,\
          'grey': !sentByMe(message),\
          'primary white--text': sentByMe(message),\
        }"
      ) 
        | {{ message.body }}

      p.text-caption.text--disabled(v-if='showInfo(i)')
        span(v-if='!sentByMe(message) && participant(message.sender_id)')
          | {{ participant(message.sender_id).first_name }} -&nbsp;
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
      dense
      placeholder="Type a message..."
      data-cy='message-input'
      :readonly='sendingMessage'
    )

    v-btn.ml-3(color='primary' icon type='submit' :loading='sendingMessage')
      v-icon mdi-send
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Vue } from 'vue-property-decorator'
import * as messages from '@/services/messages'
import { Message } from '@/types/Messages'
import { User } from '@/types/Users'

@Component
export default class Conversation extends Vue {
  message = ''
  sendingMessage = false

  metaInfo(): any {
    return {
      title: this.conversation
        ? this.$options.filters?.groupNameList(
            this.conversation,
            this.me
          )
        : 'Conversation',
    }
  }

  async mounted() {
    // TODO: get the text input to focus
    // console.log(this.$refs.message) //.$el.focus();
    await messages.loadConversation(this.$store, parseInt(this.$route.params.conversationId))
  }

  get me() {
    return this.$store.getters.me
  }

  get conversation() {
    const conversation = this.$store.getters.conversation(
      this.$route.params.conversationId
    )
    return conversation
  }

  sentByMe(message: Message) {
    return message.sender_id == this.me.id
  }

  // Determine if the message info should be shown
  showInfo(messageIndex: number) {
    const current = this.conversation.messages[messageIndex]
    const next = this.conversation.messages[messageIndex + 1]

    if (next) {
      // The messages were sent by different users
      if (current.sender_id != next.sender_id) return true

      // The messages were sent more than a minute apart
      return (
        new Date(next.timestamp).getTime() -
          new Date(current.timestamp).getTime() >
        60 * 1000
      )
    }
    return true
  }

  // Check if the message was sent today
  isToday(timestamp: string) {
    const now = new Date()
    const then = new Date(timestamp)
    return !(
      now.getUTCDay() == then.getUTCDay() &&
      now.getUTCMonth() == then.getUTCMonth() &&
      now.getUTCFullYear() == then.getUTCFullYear()
    )
  }

  async sendMessage() {
    if (!this.message) return

    // Split the message into chunks of 500 characters
    const chunks = this.message.match(/.{1,500}/g)
    if (!chunks) return

    this.sendingMessage = true
    for (const chunk of chunks) {
      if (!chunk) continue
      
      await messages.sendMessage(
        this.$store,
        { body: chunk },
        parseInt(this.$route.params.conversationId)
      )
    }
    this.sendingMessage = false
    this.message = ''
  }

  // TODO: Move the participants data into `users` state module
  participant(participantId: number) {
    const participant = this.conversation.participants.find(
      (p: User) => p.id == participantId
    )
    return participant
  }
}
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
  &.scroll-y-reverse-transition-leave-active {
    transition: none !important;
  }
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
