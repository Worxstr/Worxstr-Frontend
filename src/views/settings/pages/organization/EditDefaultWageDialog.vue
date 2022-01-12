<template lang="pug">
v-dialog(
  v-if='organization'
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="600",
  persistent
)
  v-card.d-flex.flex-column
    v-form.flex-grow-1.d-flex.flex-column(@submit.prevent="updateDefaultWage" v-model="isValid")
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Default wage for {{ organization.name }}

      v-divider
          
      v-card-text
          currency-input(
            suffix='/ hour'
            label='Hourly wage'
            dense
            outlined
            v-model.number='form.defaultWage'
            required
          )

      v-spacer
      
      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(type='submit' text color="primary") Save

    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import CurrencyInput from '@/components/inputs/CurrencyInput.vue'
import * as organizations from '@/services/organizations'

dayjs.extend(duration)

@Component({
  components: { CurrencyInput },
})
export default class EditDefaultWageDialog extends Vue {
  
  loading = false
  isValid = false
  form = {
    defaultWage: 7.5,
  }

  @Prop({ default: false }) opened!: boolean
  @Prop({ type: Number }) organizationId!: number

  get organization() {
    return this.$store.getters.organization(this.organizationId)
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    this.form.defaultWage = this.organization.minimum_wage
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async updateDefaultWage() {
    try {
      await organizations.updateMyOrganization(this.$store, {
        default_wage: this.form.defaultWage,
      })
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
