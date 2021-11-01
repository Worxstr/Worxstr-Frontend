<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='520'
  persistent
  light
)
  v-card

    v-toolbar.flex-grow-0(flat)
      v-toolbar-title.text-h6 Upload identity verification documents
      v-spacer
      v-btn(icon @click='closeDialog')
        v-icon mdi-close

    v-card-text
      dwolla-document-upload(:customerId='customerId(me.dwolla_customer_url)')

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { dwollaCustomerIdFromUrl } from '@/util/dwolla'

@Component
export default class DocumentUploadDialog extends Vue {
  
  @Prop({ default: false }) readonly opened!: boolean

  closeDialog() {
    this.$emit('update:opened', false)
  }
  
  get me() {
    return this.$store.getters.me
  }

  customerId(customerUrl: string) {
    return dwollaCustomerIdFromUrl(customerUrl)
  }
}
</script>