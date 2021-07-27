<template lang="pug">
div
  v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center.arrow-container
    v-card.soft-shadow(width='500')
      v-form(@submit.prevent='signUp' v-model='isValid')
        v-card-title Sign up
        v-card-text
          v-text-field(
            autofocus,
            label='First name'
            v-model='form.first_name'
            :rules='rules.firstName'
            required
          )
          v-text-field(
            label='Last name'
            v-model='form.last_name'
            :rules='rules.lastName' 
            required
          )
          v-text-field(
            label='Email'
            type='email'
            :rules='rules.email'
            v-model='form.email'
            required
          )
          phone-input(
            v-model='form.phone'
            required
          )
          v-text-field(
            label='Manager ID'
            v-model='form.manager_id'
            :rules='rules.managerId'
          )
          v-text-field(
            label='Password'
            type='password'
            v-model='form.password'
            :rules='rules.password'
            required
          )
          v-text-field(
            label='Confirm password'
            type='password'
            v-model='form.confirm_password'
            :rules="[...rules.confirmPassword, rules.passwordMatches(form.password, form.confirm_password)]"
            required
          )
          v-checkbox(v-model='form.agreeToTerms' required :rules='[(value) => !!value]' hide-details)
            template(v-slot:label)
              div
                span I agree to the
                a(href='/terms' target='_blank' @click.stop) &nbsp;terms of service

        v-card-actions
          v-spacer
          v-btn(v-if='step != 0' text @click='step--') Back
          v-btn(v-if='step != 3' text @click='step++') Next
          v-btn(
            v-if='step == 3'
            text
            color='primary'
            type='submit'
            :disabled='!isValid'
          ) Sign up
      v-fade-transition
        v-overlay(absolute opacity='0.2' v-if='loading')
          v-progress-circular(indeterminate)
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 50px')
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue } from 'vue-property-decorator'
import { exists, emailRules, phoneRules, passwordRules, passwordMatches } from '@/plugins/inputValidation'
import Arrows from '@/components/Arrows.vue'

@Component({
  metaInfo: {
    title: 'Sign up'
  },
  components: {
    Arrows,
  },
})
export default class SignUp extends Vue {
  loading = false
  isValid = false

  step = 0

  form = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    manager_id: "",
    password: "",
    confirm_password: "", 
    agreeToTerms: false,
  }
  rules = {
    firstName: [exists('First name required')],
    lastName: [exists('Last name required')],
    phone: phoneRules,
    email: emailRules,
    managerId: [exists('Manager ID required')],
    password: passwordRules,
    confirmPassword: [exists('Password confirmation required')],
    passwordMatches,
  }

  async signUp() {
    this.loading = true
    try {
      await this.$store.dispatch("signUp", this.form)
    } finally {
      this.loading = false
    }
  }
}
</script>
