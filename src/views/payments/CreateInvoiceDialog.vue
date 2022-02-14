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
      v-model='allValid'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Creating new invoice
        v-spacer
        .text-h6.font-weight-black.green--text(v-if='invoice.items.length')
          | {{ total | currency }}

      v-divider

      v-card-text.transfer-amount.d-flex.flex-column.gap-small
        
        richtext-field(
          placeholder='What\'s this for?'
          v-model='invoice.description'
        )

        div
          //- // TODO: Create generic component for draggable list creation
          invoice-input(v-model='invoice.items' :orderable='true')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(
          text
          color='primary'
          :disabled='!allValid'
          type='submit'
          data-cy='transfer-submit-button'
        ) Create
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
    items: [{
      title: '',
      amount: 0,
    }]
  }

  // TODO: Figure out how to add rules prop to InvoiceInput
  get allValid() {
    return this.isValid && this.invoice.items.length > 0
  }

  get total() {
    return this.invoice.items.reduce((total: number, lineitem: any) => total + lineitem.amount, 0)
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