<template lang="pug">
v-form.flex-grow-1.d-flex.flex-column(
  @submit.prevent="updateTimecard",
  v-model="isValid",
  style="width: 100%"
)
  v-text-field(
    autofocus,
    outlined,
    :color="color",
    dense,
    label="Subject",
    v-model="subject",
    required
  )

  v-textarea(
    outlined,
    :color="color",
    dense,
    label="Message",
    v-model="message",
    required,
    hide-details
  )

  v-spacer

  v-card-actions
    v-spacer
    v-btn(text, @click="openEmailClient", :text="text" :color='color') Send message
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ContactForm extends Vue {

  @Prop(String) readonly color: string | undefined
  @Prop(String) readonly subject: string | undefined
  @Prop(String) readonly message: string | undefined
  @Prop({ default: false }) readonly text!: boolean

  openEmailClient() {
    const win = window.open(
      `mailto:support@worxstr.com?subject=${this.subject || ''}&body=${this.message || ''}`,
      "_blank"
    )
    if (win) win.focus()
  }
}
</script>