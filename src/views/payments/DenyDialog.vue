<template lang="pug">
v-dialog(
  v-if='timecards && timecards.length'
  id="payment-dialog"
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-card-title.headline
      span
        | Deny
        | {{timecards.length}}
        | payment{{timecards.length == 1 ? '' : 's'}}?

    v-card-text(v-if="timecards && timecards[0]")
      | {{timecards.length == 1 ? `${timecards[0].first_name} ${timecards[0].last_name}` : 'These contractors' }}
      | will not be paid for
      | {{timecards.length == 1 ? 'this shift' : 'these shifts'}}.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="denyPayments" :loading='loading') Deny
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { denyPayments } from '@/services/payments'

@Component
export default class DenyDialog extends Vue {

  @Prop({ default: false }) opened!: boolean
  @Prop({ default: [] }) timecardIds!: Array<number>
  
  get timecards() {
    return this.$store.getters.timecardsByIds(this.timecardIds)
  }

  loading = false
  
  closeDialog() {
    this.$emit("update:opened", false);
  }

  async denyPayments() {
    this.loading = true
    await denyPayments(this.$store, this.timecardIds)
    this.loading = false
    this.closeDialog()
  }
}
</script>
