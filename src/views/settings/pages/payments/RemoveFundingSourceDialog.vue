<template lang="pug">

v-dialog(
  v-if="fundingSource"
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-card-title.headline
      span Remove {{ fundingSource.name }}?

    v-card-text You will no longer be able to withdraw funds from this account.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="removeFundingSource" :loading='loading') Remove
</template>

<script lang="ts">
import { FundingSource } from '@/definitions/Payments'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class RemoveFundingSourceDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop(Object) readonly fundingSource!: FundingSource

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async removeFundingSource() {
    this.loading = true
    await this.$store.dispatch('removeFundingSource', this.fundingSource._links.self.href)
    this.loading = false
    this.closeDialog()
  }

}
</script>
