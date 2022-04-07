<template lang="pug">
div
  v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center.arrow-container
    
    v-card.soft-shadow(width='600' style='overflow-y: auto')
  
      v-form(@submit.prevent='signUp' v-model='isValid')
        v-card-title.text-h5
          span(v-if='!accountType') Sign up
          span(v-else) Sign up as a {{ accountType == 'org' ? 'business' : 'contractor' }}

        v-card-text.pb-0

          v-window.pt-2(v-model='step' touchless :style="step == 1 && 'padding-bottom: 20px'")

            v-window-item(:value='0')
              .pa-1.d-flex.flex-column.flex-sm-row.justify-center.gap-small
                v-btn.pa-6(text outlined @click="accountType = 'contractor'; step++")
                  v-icon(color='primary') mdi-account
                  span.ml-3.text-h6 I'm a contractor

                v-btn.pa-6(text outlined :to="{ name: 'pricing' }")
                  v-icon(color='primary') mdi-domain
                  span.ml-3.text-h6 I have a business

            v-window-item(:value='1' :style='$vuetify.breakpoint.xs && `min-height: calc(80vh - 70px)`')
              p(v-if="accountType == 'org'")
                | Are you a contractor?
                a(@click="accountType = 'contractor'") &nbsp;Create your account here
                | .

                
              v-alert(
                v-if='usingSandbox'
                border='left'
                color='primary'
                dense
                text
                type='info'
              ) You are signing up using the sandbox environment


              div(v-if="accountType == 'org'")
                manager-form(@update='managerFormUpdate')

              div(v-if="accountType == 'contractor'")
                contractor-form(@update='contractorFormUpdate')

              v-checkbox.mt-0(
                v-model='form.terms'
                :rules='rules.terms'
                required
              )
                template(v-slot:label)
                  .text-caption By checking this box you agree to&nbsp;
                    a(href='https://worxstr.com/terms' target='_blank' @click.stop) our Terms of Service
                    | &nbsp;and&nbsp;
                    a(href='https://worxstr.com/privacy' target='_blank' @click.stop) Privacy Policy
                    | &nbsp;as well as our Vendor&nbsp;
                    a(href='https://www.dwolla.com/legal/tos/' target='_blank' @click.stop) Dwolla's Terms of Service
                    | &nbsp;and&nbsp;
                    a(href='https://www.dwolla.com/legal/privacy/' target='_blank' @click.stop) Dwolla's Privacy Policy
        
        v-card-actions
          v-spacer
          v-btn(v-if='step != 0' text @click='step--') Back
          v-btn(
            v-if="step == 1"
            text
            color='primary'
            type='submit'
            :disabled='!isValid'
            :loading='loading'
          ) Sign up

  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 50px')
</template>

<script>
/* eslint-disable @typescript-eslint/camelcase */

import { Component, Vue } from 'vue-property-decorator'
import { Capacitor } from '@capacitor/core'
import { signUp } from '@/services/auth'
import ContractorForm from './ContractorForm.vue'
import ManagerForm from './ManagerForm.vue'
import { hashColor } from '@/util/helpers'

@Component({
  metaInfo: {
    title: 'Sign up',
  },
  components: {
    ContractorForm,
    ManagerForm,
  }
})
export default class SignUp extends Vue {
  step = 0
  loading = false
  isValid = false
  accountType = null // 'contractor' | 'org'
  subscription_tier = null

  form = {
    terms: false,
  }
  rules = {
    terms: [
      (v) => !!v || 'You must agree to the terms and conditions',
    ],
  }

  contractorForm = {}
  managerForm = {}

  get isNativePlatform() {
    return Capacitor.isNativePlatform()
  }

  async mounted() {
    if (this.$route.query.manager_reference) {
      // Continue to sign up as contractor
      this.accountType = 'contractor'
      this.step = 1
    }

    if (this.$route.params.subscriptionTier) {
      this.accountType = 'org'
      this.step = 1
      this.form.subscription_tier = this.$route.params.subscriptionTier
    }

    if (this.isNativePlatform) {
      this.accountType = 'contractor'
      this.step = 1
    }
  }

  contractorFormUpdate(formData) {
    this.contractorForm = formData
  }

  managerFormUpdate(formData) {
    this.managerForm = formData
  }

  get usingSandbox() {
    return this.managerForm.email?.includes('+test') || this.contractorForm.email?.includes('+test')
  }

  async signUp() {
    this.loading = true
    try {
      const data = {
        ...this.form,
        ...(this.accountType === 'org' ? this.managerForm : this.contractorForm),
        accountType: this.accountType,
      }

      if (this.accountType === 'contractor')
        data.color = hashColor(Date.now())

      await signUp(this.$store, data)
    } finally {
      this.loading = false
    }
  }
}
</script>