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
        v-spacer
        .text-h6.font-weight-black.green--text(v-if='invoice.items.length')
          | {{ total | currency }}

      v-divider

      v-card-text.transfer-amount.d-flex.flex-column.gap-small

        .d-flex.flex-column.flex-sm-row.gap-small(v-if='userIsManager')
          v-select(
            autofocus
            label='Attach to job'
            outlined
            dense
            v-model='invoice.job_id'
            :items='jobs'
            item-text='name'
            item-value='id'
            hide-details
            :loading='loadingJobs'
          )

          v-select(
            label='Recipient'
            outlined
            dense
            v-model='invoice.recipient_id'
            :items='contractors'
            item-text='name'
            item-value='id'
            hide-details
            :loading='loadingContractors'
            :rules='rules.recipient'
          )
        
        invoice-input(v-model='invoice.items' :orderable='true' :autofocus='userIsContractor')
        
        richtext-field(
          placeholder='What\'s this for?'
          v-model='invoice.description'
        )

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
          :loading='loading'
        ) Create
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import RichtextField from '@/components/inputs/RichtextField.vue'
import InvoiceInput from '@/components/inputs/InvoiceInput.vue'
import { createInvoice } from '@/services/payments'
import { loadJobs } from '@/services/jobs'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { Job } from '@/types/Jobs'
import { exists } from '@/util/inputValidation'
import { loadWorkforce } from '@/services/users'

@Component({
  components: {
    RichtextField,
    InvoiceInput,
  },
})
export default class CreateInvoiceDialog extends Vue {
  
  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ type: Number }) readonly jobId?: number

  loading = false
  loadingJobs = false
  loadingContractors = false
  isValid = false
  invoice: any = {
    description: '',
    items: [{
      description: '',
      amount: 0,
    }]
  }
  rules = {
    recipient: [
      exists('Recipient is required'),
    ],
  }

  @Watch('opened')
  async onOpenedChange(val: boolean) {
    if (val) {
      if (this.jobId) {
        this.invoice.job_id = this.jobId
      }

      if (this.userIsContractor) {
        this.invoice.recipient_id = this.$store.getters.me.id
      }

      if (this.userIsManager) {
        this.loadJobs()
        this.loadContractors()
      }
    }
  }

  async loadJobs() {
    this.loadingJobs = true
    await loadJobs(this.$store)
    this.loadingJobs = false
  }

  async loadContractors() {
    this.loadingContractors = true
    await loadWorkforce(this.$store)
    this.loadingContractors = false
  }

  // TODO: Figure out how to add rules prop to InvoiceInput
  get allValid() {
    return this.isValid && this.invoice.items.length > 0
  }

  get total() {
    return this.invoice.items.reduce((total: number, lineitem: any) => total + lineitem.amount, 0)
  }

  get jobs() {
    return this.$store.getters.jobs
  }

  get contractors() {
    return this.$store.getters.contractors
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get userIsContractor() {
    return currentUserIs(UserRole.Contractor)
  }
  
  closeDialog() {
    this.$emit('update:opened', false)
  }

  async createInvoice() {
    this.loading = true
    try {
      const payment = await createInvoice(this.$store, this.invoice);
      (this.$refs.form as HTMLFormElement)?.reset()
      this.closeDialog()
      this.$router.push({
        name: 'payment',
        params: {
          paymentId: payment.id,
        }
      })
    }
    finally {
      this.loading = false
    }
  }
}

</script>