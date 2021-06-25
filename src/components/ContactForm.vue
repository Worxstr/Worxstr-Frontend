<template lang="pug">
v-form.flex-grow-1.d-flex.flex-column(
  @submit.prevent="updateTimecard",
  v-model="isValid",
  style="width: 100%"
)
  v-text-field(
    v-model="form.business_name",
    label="Business name",
    required,
    autofocus,
    outlined,
    dense,
    :color="color"
    :filled='filled'
  )

  .d-flex.flex-column.flex-md-row
    v-text-field.mr-2(
      v-model="form.first_name",
      label="First name",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )
    v-text-field.ml-2(
      v-model="form.last_name",
      label="Last name",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )

  .d-flex
    v-text-field(
      v-if='usePhone'
      v-model="form.phone",
      type="tel",
      v-mask="'(###) ###-####'"
      label="Phone number",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )
    v-text-field(
      v-else
      v-model="form.email",
      type="email",
      label="Email",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )
    v-btn.ml-2.mt-1(text, color="primary", @click="usePhone = !usePhone") Use {{ usePhone ? 'email' : 'phone' }} instead

  v-text-field(
    v-model="form.website",
    label="Business website",
    required,
    autofocus,
    outlined,
    dense,
    :color="color"
    :filled='filled'
  )

  .d-flex.flex-column.flex-md-row
    v-text-field.mr-2(
      v-model="form.num_managers",
      label="Number of managers",
      type="number",
      min="1",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )
    v-text-field.ml-2(
      v-model="form.num_contractors",
      label="Number of contractors",
      type="number",
      min="1",
      required,
      autofocus,
      outlined,
      dense,
      :color="color"
      :filled='filled'
    )
    
  v-spacer

  v-card-actions
    v-spacer
    v-btn(text, :text="text", :color="color") Send message
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ContactForm extends Vue {

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

  usePhone = false

  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly text!: boolean
  @Prop({ default: false }) readonly filled!: boolean

}
</script>