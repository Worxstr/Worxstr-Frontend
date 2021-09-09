<template lang="pug">
v-dialog(
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
      @submit.prevent="openPlaidAuth",
      ref="form",
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Editing {{ user | fullName}}

      v-divider

      div(v-if='editedUser.contractor_info')

        v-subheader Contractor info

        v-card-text.pb-0
          v-text-field(
            autofocus
            outlined,
            dense,
            label="Wage",
            v-model="editedUser.contractor_info.hourly_rate",
            :rules="rules.wage",
            required,
          )

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(text color="primary" :disabled="!isValid" type="submit") Save
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { User } from '@/definitions/User'
import { exists } from '@/plugins/inputValidation'

@Component
export default class EditUserDialog extends Vue {

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ type: Object }) user!: User

  editedUser: User | {} = {}
  isValid = false
  loading = false
  rules = {
    wage: [exists('You must enter a name for your account.')],
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    if (opened && this.user)
      this.editedUser = Object.assign({}, this.user);
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }
}
</script>
