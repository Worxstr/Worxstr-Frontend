<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="createConversation",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 New conversation

      v-divider

      v-card-text
        p Select the person you want to message
        v-autocomplete(
          autofocus
          v-model="selectedUsers",
          :items="contacts",
          multiple,
          placeholder="Find someone",
          outlined,
          dense,
          :rules="[(v) => v.length != 0]",
          :item-text="(u) => `${u.first_name} ${u.last_name}`",
          :item-value="(u) => u.id"
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", @click="createConversation" :disabled="!isValid") Create conversation
        
      v-fade-transition
        v-overlay(v-if="loading", absolute, opacity=".2")
          v-progress-circular(indeterminate)
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import * as messages from '@/store/messages'

@Component
export default class NewConversationDialog extends Vue {

  isValid = false
  loading = false
  selectedUsers = []
  
  @Prop({ default: false }) opened!: boolean

  @Watch('opened')
  onOpened(opened: boolean) {
    if (opened) (this.$refs.form as HTMLFormElement).reset()
  }

  async mounted() {
    await messages.loadContacts()
  }

  get contacts() {
    return this.$store.state.messages.contacts
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }
  
  async createConversation() {
    this.loading = true
    try {
      const conversation = await messages.createConversation(this.selectedUsers)
      this.$router.push({
        name: 'conversation',
        params: { conversationId: conversation.id },
      })
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
