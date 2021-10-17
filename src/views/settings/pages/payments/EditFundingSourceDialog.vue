<template lang="pug">
v-dialog(
  v-if='editedFundingSource'
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="updateFundingSource",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Editing {{ editedFundingSource.name }}

      v-divider

      v-card-text.pb-0
        v-text-field(
          autofocus
          outlined,
          dense,
          label="Name for funding source",
          v-model="editedFundingSource.name",
          :rules="rules.name",
          required,
        )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(text, color="primary", :disabled="!isValid", type="submit") Update
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { FundingSource } from '@/types/Payments'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { exists } from '@/util/inputValidation'
import { updateFundingSource } from '@/services/payments'

@Component
export default class RemoveFundingSourceDialog extends Vue {

  isValid = false
  loading = false
  rules = {
    name: [exists('You must enter a name for your account.')],
  }

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Object) readonly fundingSource!: FundingSource

  editedFundingSource: FundingSource | null = null

  @Watch('opened')
  dialogOpened() {
    this.editedFundingSource = {...this.fundingSource}
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async updateFundingSource() {
    this.loading = true
    try {
      await updateFundingSource(this.$store, this.editedFundingSource as FundingSource)
      this.closeDialog()
    }
    finally {
      this.loading = false 
    }
  }
}
</script>
