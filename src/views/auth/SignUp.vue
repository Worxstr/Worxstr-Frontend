<template lang="pug">
div
  v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center.arrow-container
    v-card.soft-shadow(width='600')
      v-form(@submit.prevent='signUp' v-model='isValid')
        v-card-title.text-h5
          span(v-if='!accountType') Sign up
          span(v-else) Sign up as {{ accountType == 'org' ? 'business' : 'contractor' }}
        v-card-text.pb-0
          v-window.pt-2(v-model='step')

            v-window-item(:value='0')
              .pa-1.d-flex.justify-center
                v-btn.pa-10(text @click="accountType = 'contractor'; step++")
                  v-icon mdi-account
                  span.ml-3.text-h6 I'm a contractor
                v-btn.pa-10(text :to="{ name: 'pricing' }")
                  v-icon mdi-domain
                  span.ml-3.text-h6 I have a business

            v-window-item(:value='1')
              dwolla-personal-vcr(
                v-if="accountType == 'contractor'"
                terms='/terms'
                privacy='/privacy'
              )
              dwolla-business-vcr(
                v-if="accountType == 'org'"
                terms='/terms'
                privacy='/privacy'
              )
              p(v-if="accountType == 'org'")
                | Are you a contractor? Click
                a(@click="accountType = 'contractor'") &nbsp;here&nbsp;
                | to create your account.

            v-window-item(:value='2')
              v-text-field(
                label='Manager reference'
                v-model='form.manager_reference'
                :rules='rules.managerReference'
                outlined
                dense
                v-if="accountType == 'contractor'"
              )
              v-text-field(
                label='Password'
                type='password'
                v-model='form.password'
                :rules='rules.password'
                required
                outlined
                dense
              )
              v-text-field(
                label='Confirm password'
                type='password'
                v-model='form.confirm_password'
                :rules="[...rules.confirmPassword, rules.passwordMatches(form.password, form.confirm_password)]"
                required
                outlined
                dense
              )

              //- v-checkbox(v-model='form.agreeToTerms' required :rules='[(value) => !!value]' hide-details)
              //-   template(v-slot:label)
              //-     div
              //-       span I agree to the
              //-       a(href='/terms' target='_blank' @click.stop) &nbsp;terms of service

                  

        v-card-actions(v-if='step != 1')
          v-spacer
          v-btn(v-if='step != 0 && step != 2' text @click='step--') Back
          v-btn(v-if='step != 0 && step != 2' text @click='step++') Next
          v-btn(
            v-if='step == 2'
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
import {
  exists,
  passwordRules,
  passwordMatches,
} from '@/plugins/inputValidation'
import Arrows from '@/components/Arrows.vue'

@Component({
  metaInfo: {
    title: 'Sign up',
  },
  components: {
    Arrows,
  },
})
export default class SignUp extends Vue {
  step = 0
  loading = false
  isValid = false
  accountType = null // 'contractor' | 'org'

  form = {
    manager_reference: '',
    password: '',
    confirm_password: '',
    // agreeToTerms: false,
    customer_url: '',
    subscription_tier: null,
  }
  rules = {
    managerReference: [exists('Manager reference required')],
    password: passwordRules,
    confirmPassword: [exists('Password confirmation required')],
    passwordMatches,
  }

  mounted() {
    window.dwolla.configure({
      environment: 'sandbox',
      // styles: '/main.css',
      tokenUrl: `${process.env.VUE_APP_API_BASE_URL}/payments/access`,
      success: async (res) => {
        this.form.customer_url = res.location
        this.step = 2
      },
      error: (err) => {
        console.log(err)
      },
    })

    if (this.$route.params.subscriptionTier) {
      this.accountType = 'org'
      this.step++
      this.form.subscription_tier = this.$route.params.subscriptionTier
    }
  }

  async signUp() {
    this.loading = true
    try {
      await this.$store.dispatch('signUp', this.form)
    } finally {
      this.loading = false
    }
  }
}
</script>