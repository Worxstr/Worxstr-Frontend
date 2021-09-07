<template lang="pug">
v-form.flex-grow-1.d-flex.flex-column(
  @submit.prevent="submitForm",
  v-model="isValid",
  style="width: 100%"
)
  v-text-field(
    v-if="type == 'sales'"
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
      v-if="!$store.state.authenticatedUser"
      v-model="form.contact_name",
      label="Your name",
      required,
      :rules='rules.contactName'
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-text-field(
      :class="{'.ml-2': $store.state.authenticatedUser}"
      v-if="type == 'sales'"
      v-model="form.contact_title",
      label="Job title",
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  .d-flex(v-if='!$store.state.authenticatedUser')
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
    v-if="type == 'sales'"
    v-model="form.website",
    label="Business website",
    type='url'
    :rules='rules.url'
    placeholder='https://example.com'
    required,
    outlined,
    dense,
    :color="color",
    :filled="filled"
  )

  .d-flex.flex-column.flex-md-row(v-if="showManagerContractorFields && type == 'sales'")
    v-text-field.mr-2(
      v-model.number="form.num_managers",
      label="Number of managers",
      type="number",
      min="1",
      required,
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )
    v-text-field.ml-2(
      v-model.number="form.num_contractors",
      label="Number of contractors",
      type="number",
      min="1",
      required,
      outlined,
      dense,
      :color="color",
      :filled="filled"
    )

  v-textarea(
    v-if="type == 'support'"
    v-model="form.description"
    :rules="rules.description"
    label="Describe your problem"
    required 
    outlined
    dense
    :color="color"
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
    ) {{ type == 'sales' ? 'Request information' : 'Contact support' }}

</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue, Prop } from 'vue-property-decorator'
import { emailRules, exists, url } from '@/plugins/inputValidation'
import PhoneInput from '@/components/inputs/PhoneInput.vue'

import * as UAParser from 'ua-parser-js'

@Component({
  components: {
    PhoneInput
  }
})
export default class ContactForm extends Vue {
  
  isValid = false
  usePhone = false

  form: any = {}

  rules = {
    contactName: [exists('Name required')],
    email: emailRules,
    url: [url],
    description: [exists('Description required')],
  }

  @Prop(String) readonly type!: string // 'sales' | 'support'
  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly text!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: true }) readonly showManagerContractorFields!: boolean
  @Prop(Object) readonly dataSupplement: object | undefined

  loading = false

  mounted() {
    if (this.dataSupplement) {
      this.form = {
        ...this.form,
        ...this.dataSupplement
      }
    }
  }

  async submitForm() {
    this.loading = true 

    let request: any = {...this.form}

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

    request = {
      ...request,
      ...UAParser(navigator.userAgent)
    }

    await this.$store.dispatch('contactSales', {
      form: request,
      type: this.type
    })

    this.loading = false
    this.$emit('submitted')
  }
}
</script>