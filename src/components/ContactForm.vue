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
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  .d-flex
    phone-input(
      v-if="usePhone",
      v-model="form.phone",
      :rules='rules.phone'
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
    outlined,
    dense,
    :color="color",
    :filled="filled"
  )

  .d-flex.flex-column.flex-md-row
    v-select.mr-2(
      v-model="form.num_managers",
      label="Number of managers",
      type="number",
      min="1",
      required,
      :items='employeeCountOptions'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-select.ml-2(
      v-model="form.num_contractors",
      label="Number of contractors",
      type="number",
      min="1",
      required,
      :items='employeeCountOptions'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  v-spacer

  v-card-actions.pt-0
    v-spacer
    slot
    v-btn(
      type='submit'
      text
      :text="text"
      :color="color"
      :disabled='!isValid'
      :loading="loading"
    ) Send message
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue, Prop } from 'vue-property-decorator'
import { emailRules, exists } from '@/plugins/inputValidation'
import PhoneInput from '@/components/inputs/PhoneInput.vue'

@Component({
  components: {
    PhoneInput
  }
})
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
    contactName: [exists('Name required')],
    email: emailRules,
  }

  employeeCountOptions = [{
    text: '0-25',
    value: 0
  },{
    text: '26-100',
    value: 1
  },{
    text: '101+',
    value: 2
  }]

  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly text!: boolean
  @Prop({ default: false }) readonly filled!: boolean

  loading = false

  async submitForm() {
    this.loading = true 

    const request: any = {...this.form}

    if (this.form.phone) {
      request.phone = {
        country_code: '1',
        area_code: this.form.phone.substring(1,4),
        phone_number: this.form.phone.substring(6,9) + this.form.phone.substring(10,14)
      }
      delete request.email
    }
    else {
      delete request.phone
    }
    
    await this.$store.dispatch('contactSales', request)

    this.loading = false
    this.$emit('submitted')
  }
}
</script>