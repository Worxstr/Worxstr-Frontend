<template lang="pug">
v-tooltip(bottom)
  span Copy to clipboard
  template(v-slot:activator='{ on, attrs }')
    v-btn(
      icon
      color='primary'
      v-bind='attrs'
      v-on='on'
      @click='copyText(text)'
    )
      v-icon mdi-content-copy
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Clipboard } from '@capacitor/clipboard'
import { showToast } from '@/services/app'

@Component
export default class ClipboardCopy extends Vue {

  @Prop({ type: String }) text!: string

  async copyText(text: string) {
    try {
      await Clipboard.write({
        string: text
      })
      showToast(this.$store, {
        text: "Copied."
      })
    }
    catch (e) {
      showToast(this.$store, {
        text: "Couldn't copy to clipboard."
      })
    }
  }
}
</script>