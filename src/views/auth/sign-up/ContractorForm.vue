<template lang="pug">
.contractor-form
  v-subheader Full legal name

  .d-flex.flex-column.flex-sm-row
    v-text-field.mr-sm-4(
      autofocus
      label='First name'
      hint='Enter your full legal first name'
      placeholder='Bobby'
      v-model='form.firstName'
      :rules='rules.firstName'
      required
      outlined
      dense
    )
    v-text-field(
      label='Last name'
      hint='Enter your full legal last name'
      placeholder='Tables'
      v-model='form.lastName'
      :rules='rules.lastName'
      required
      outlined
      dense
    )

  v-subheader Your info

  v-text-field(
    v-if='!retry'
    label='Email'
    type='email'
    placeholder='bobby@example.com'
    required
    v-model='form.email'
    :rules='rules.email'
    outlined
    dense
  )

  .d-flex.flex-column.flex-sm-row(v-if='!retry')
    v-text-field.mr-sm-4(
      label='Manager reference number'
      hint='Given to you by your manager'
      placeholder='123456789'
      v-model='form.manager_reference'
      :rules='rules.managerReference'
      outlined
      dense
    )
    phone-input(
      v-model="form.phone"
      :required='true'
      outlined
      dense
    )

  .d-flex.flex-column.flex-sm-row
    v-text-field.mr-sm-4(
      label='Mailing address 1'
      hint='Typically the address that you used to file your last tax return'
      placeholder='1234 Main St.'
      v-model='form.address1'
      :rules='rules.address1'
      required
      outlined
      dense
    )
    v-text-field(
      label='Mailing address 2'
      placeholder='Apt. 123'
      v-model='form.address2'
      required
      outlined
      dense
    )

  .d-flex.flex-column.flex-sm-row
    v-text-field.mr-sm-4(
      label='City'
      placeholder='City'
      v-model='form.city'
      :rules='rules.city'
      required
      outlined
      dense
    )
    v-select.mr-sm-4(
      label='State'
      :items='states'
      v-model='form.state'
      :rules='rules.state'
      outlined
      dense
      required
    )
    v-text-field(
      label='Postal code'
      placeholder='12345'
      type='number'
      v-mask="'#####'"
      v-model='form.postalCode'
      :rules='rules.postalCode'
      required
      outlined
      dense
    )

  .d-flex.flex-column.flex-sm-row
    v-text-field.mr-sm-4(
      label='Date of birth'
      type="date",
      v-model='form.dateOfBirth'
      :rules='rules.dateOfBirth'
      outlined
      dense
      required
    )
    ssn-input(:short='!retry' v-model='form.ssn')
    
  div(v-if='!retry')
    v-text-field(
      label='Password'
      :type="showPassword ? 'text' : 'password'"
      v-model='form.password'
      :rules='rules.password'
      required
      outlined
      dense
      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append='showPassword = !showPassword'
    )
    v-text-field(
      v-if='!showPassword'
      label='Confirm password'
      type='password'
      v-model='form.confirm_password'
      :rules="[...rules.confirmPassword, rules.passwordMatches(form.password, form.confirm_password)]"
      required
      outlined
      dense
    )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import SsnInput from '@/components/inputs/SsnInput.vue'
import {
  exists,
  emailRules,
  postalCodeRules,
  passwordRules,
  passwordMatches,
} from '@/util/inputValidation'

@Component({
  components: {
    Arrows,
    PhoneInput,
    SsnInput,
  }
})
export default class ContractorForm extends Vue {

  @Prop({ default: false }) retry!: boolean
  
  form: any = {}
  showPassword = false
  states = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VI','VA','WA','WV','WI','WY']

  mounted() {
    if (this.$route.query.manager_reference) {
      this.form.manager_reference = this.$route.query.manager_reference
    }
  }

  get rules() {
    return {
      firstName: [exists('First name required')],
      lastName: [exists('Last name required')],
      phone: [exists('Phone number required')],
      email: emailRules,
      managerReference: [exists('Manager reference number required')],
      address1: [exists('Address 1 required')],
      city: [exists('City required')],
      state: [exists('State required')],
      postalCode: postalCodeRules,
      dateOfBirth: [exists('Date of birth required')],
      password: passwordRules,
      confirmPassword: [exists('Password confirmation required')],
      passwordMatches,
    }
  }

  @Watch('form')
  onFormChange() {
    this.$emit('update', this.form)
  }
}
</script>