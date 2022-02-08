<template lang="pug">
v-dialog(
  v-if='payments && payments.length'
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
        | {{payments.length}}
        | payment{{payments.length == 1 ? '' : 's'}}?

    v-card-text(v-if="payments && payments[0]")
      | {{payments.length == 1 ? `${payments[0].first_name} ${payments[0].last_name}` : 'These contractors' }}
      | will not be paid for
      | {{payments.length == 1 ? 'this shift' : 'these shifts'}}.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(
        text
        color="red"
        @click="denyPayments"
        :loading='loading'
        data-cy='confirm-deny-payment-button'
      ) Deny
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { denyPayments } from '@/services/payments'

@Component
export default class DenyDialog extends Vue {

  @Prop({ default: false }) opened!: boolean
  @Prop({ default: [] }) paymentIds!: Array<number>
  
  get payments() {
    return this.$store.getters.paymentsByIds(this.paymentIds)
  }

  loading = false
  
  closeDialog() {
    this.$emit("update:opened", false)
  }

  async denyPayments() {
    this.loading = true
    await denyPayments(this.$store, this.paymentIds)
    this.loading = false
    this.closeDialog()
    this.$emit('denied')
  }
}
</script>
