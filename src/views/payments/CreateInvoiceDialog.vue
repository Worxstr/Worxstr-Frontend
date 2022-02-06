<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='800'
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent='createInvoice'
      ref='form'
      v-model='isValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Creating new invoice

      v-divider

      v-card-text.transfer-amount.pb-0
        richtext-field(
          placeholder='Description'
          v-model='invoice.description'
        )

        v-subheader Items

        invoice-input(v-model='invoice.items')

        //- v-list(outlined rounded)
        //-   v-list-item(v-for='item in invoice.items')
        //-     v-list-item-content
        //-       v-list-item-title {{ item.description }}
            
        //-     v-list-item-action
        //-       .text-subtitle-1 {{ item.amount | currency }}

        //-   v-divider

        //-   v-list-item
        //-     v-list-item-content
        //-       v-list-item-title.font-weight-bold Total
            
        //-     v-list-item-action
        //-       .text-subtitle-1.font-weight-black.green--text {{ invoiceTotal | currency }}

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(
          text
          color='primary'
          :disabled='!isValid'
          type='submit'
          data-cy='transfer-submit-button'
        ) Transfer
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import RichtextField from '@/components/inputs/RichtextField.vue'
import InvoiceInput from '@/components/inputs/InvoiceInput.vue'

@Component({
  components: {
    RichtextField,
    InvoiceInput,
  },
})
export default class CreateInvoiceDialog extends Vue {
  
  @Prop({ default: false }) readonly opened!: boolean

  isValid = false
  invoice = {
    description: '',
    items: []
  }
  
  closeDialog() {
    this.$emit('update:opened', false)
  }

  createInvoice() {
    // TODO
    this.closeDialog()
  }
}

</script>