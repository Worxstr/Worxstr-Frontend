<template lang="pug">
div
  v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center.arrow-container
    v-card.soft-shadow(width="500")
      v-form(@submit.prevent="signIn()", v-model="isValid")
        v-card-title.text-h5 Sign in
        v-card-text.pb-0
          v-alert(
            v-if='usingSandbox'
            border='left'
            color='primary'
            dense
            text
            type='info'
          ) You are signing in to the sandbox environment
          v-text-field(
            autofocus
            label='Email'
            type='email'
            required
            v-model='form.email'
            :rules='emailRules'
            outlined
            dense
          )
          v-text-field(
            label='Password'
            :type="showPassword ? 'text' : 'password'"
            v-model='form.password'
            :rules='passwordRules'
            required
            outlined
            dense
            :hide-details='biometricsAvailable'
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append='showPassword = !showPassword'
          )
          v-checkbox(
            v-if='biometricsAvailable'
            v-model='form.useBiometrics'
            label='Use biometrics for future sign-ins'
          )

        v-card-actions
          v-btn(text :to="{name: 'resetPassword', params: {email: form.email}}") Forgot password?
          v-spacer
          v-btn(text color="primary" type="submit" :disabled="!isValid") Sign in
          
      v-fade-transition
        v-overlay(absolute, opacity="0.2", v-if="loading")
          v-progress-circular(indeterminate)
      
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 50px')
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { AvailableResult, Credentials, NativeBiometric } from 'capacitor-native-biometric'
import { emailRules, passwordRules } from '@/util/inputValidation'
import Arrows from '@/components/Arrows.vue'
import { signIn } from '@/services/auth'
import { showToast } from '@/services/app'
import { Capacitor } from '@capacitor/core'

@Component({
  metaInfo: {
    title: 'Sign in',
  },
  components: {
    Arrows,
  },
})
export default class SignIn extends Vue {
  form = {
    email: '',
    password: '',
    useBiometrics: false,
  }
  showPassword = false
  isValid = false
  loading = false
  biometricsAvailable = false
  emailRules = emailRules
  passwordRules = passwordRules

  async mounted() {
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }
    if (await this.checkBiometricsAvailable())
      this.loadCredentialsFromBiometrics()
  }

  get usingSandbox() {
    return this.form.email.includes('+test')
  }

  async signIn(email?: string, password?: string) {
    this.loading = true
    try {
      if (!email) email = this.form.email
      if (!password) password = this.form.password

      const data = await signIn(this.$store, email, password)

      // TODO: Find better way to determine login success
      if (data?.response?.user) {
        const biometricsAvailable = await this.checkBiometricsAvailable()

        if (biometricsAvailable)
          this.saveCredentials(this.form.email, this.form.password)
      }
    } finally {
      this.loading = false
    }
  }

  async saveCredentials(email: string, password: string) {
    if (this.form.useBiometrics) {
      await NativeBiometric.setCredentials({
        username: email,
        password,
        server: 'worxstr.com',
      })
    }
  }

  async checkBiometricsAvailable() {
    if (!Capacitor.isNativePlatform()) return false
    const result: AvailableResult = await NativeBiometric.isAvailable()
    return this.biometricsAvailable = result.isAvailable
  }

  async loadCredentialsFromBiometrics() {

    const biometricsAvailable = await this.checkBiometricsAvailable()

    if (biometricsAvailable) {

      // Get user's credentials
      const credentials: Credentials = await NativeBiometric.getCredentials({
        server: 'worxstr.com',
      })

      try {
        // TODO: Only do this when the user has checked the "use biometrics" checkbox
        await NativeBiometric.verifyIdentity({
          reason: 'For easy sign in.',
          title: 'Log in with biometrics',
          subtitle: 'Your Worxstr credentials are saved securely on this device.',
        })
        
        // Authentication successful
        this.signIn(credentials.username, credentials.password)
      }
      catch (error) {
        showToast(this.$store, {
          text: "Couldn't sign in with biometrics."
        })
      }
    }
  }
}
</script>
