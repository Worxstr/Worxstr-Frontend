<template lang="pug">
v-form.flex-grow-1.d-flex.flex-column(
  @submit.prevent="submitForm",
  v-model="isValid",
  style="width: 100%"
)
  v-text-field(
    autofocus,
    v-model="form.business_name",
    label="Business name",
    required,
    :rules='rules.businessName'
    outlined,
    dense,
    :color="color",
    :filled="filled"
  )

  .d-flex.flex-column.flex-md-row
    v-text-field.mr-2(
      v-model="form.contact_name",
      label="Your name",
      required,
      :rules='rules.contactName'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-text-field.ml-2(
      v-model="form.contact_title",
      label="Job title",
      required,
      :rules='rules.contactTitle'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  .d-flex
    v-text-field(
      v-if="usePhone",
      v-model="form.phone",
      :rules='rules.phone'
      type="tel",
      v-mask="'(###) ###-####'",
      label="Phone number",
      required,
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-text-field(
      v-else,
      v-model="form.email",
      :rules='rules.email'
      type="email",
      label="Email",
      required,
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-btn.ml-2.mt-1(text, color="primary", @click="usePhone = !usePhone") Use {{ usePhone ? 'email' : 'phone' }} instead

  v-text-field(
    v-model="form.website",
    label="Business website",
    required,
    :rules='rules.website'
    outlined,
    dense,
    :color="color",
    :filled="filled"
  )

  .d-flex.flex-column.flex-md-row
    v-text-field.mr-2(
      v-model="form.num_managers",
      label="Number of managers",
      type="number",
      min="1",
      required,
      :rules='rules.numManagers'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-text-field.ml-2(
      v-model="form.num_contractors",
      label="Number of contractors",
      type="number",
      min="1",
      required,
      :rules='rules.numContractors'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  v-spacer

  v-card-actions
    v-spacer
    slot
    v-btn(text, :text="text", :color="color" :disabled='!isValid') Send message
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue, Prop } from 'vue-property-decorator'
import { emailRules, exists, phoneRules } from '@/plugins/inputValidation'

@Component
export default class ContactForm extends Vue {
  
  isValid = false
  usePhone = false

  form = {
    business_name: '',
    contact_name: '',
    contact_title: '',
    phone: '',
    email: '',
    website: '',
    num_managers: null,
    num_contractors: null,
    notes: '',
  }

  rules = {
    businessName: [exists('Business name required')],
    contactName: [exists('Name required')],
    contactTitle: [exists('Title required')],
    phone: phoneRules,
    email: emailRules,
    website: [exists('Business website required')],
    numManagers: [exists('Number of managers required')],
    numContractors: [exists('Number of contractors required')],
  }

  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly text!: boolean
  @Prop({ default: false }) readonly filled!: boolean

  submitForm() {
    console.log('dummy submit')
  }

}
</script>