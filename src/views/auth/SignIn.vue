<template lang="pug">
div
  v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center.arrow-container
    v-card.soft-shadow(width="500")
      v-form(@submit.prevent="signIn", v-model="isValid")
        v-card-title.text-h5 Sign in
        v-card-text.pb-0
          v-text-field(
            autofocus
            label="Email",
            type="email",
            required="",
            v-model="form.email",
            :rules="emailRules"
            outlined
            dense
          )
          v-text-field(
            label="Password",
            type="password",
            required="",
            v-model="form.password",
            :rules="passwordRules"
            outlined
            dense
            hide-details
          )
          v-checkbox(
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
import { emailRules, passwordRules } from '@/plugins/inputValidation'
import Arrows from '@/components/Arrows.vue'

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
  isValid = false
  loading = false
  emailRules = emailRules
  passwordRules = passwordRules

  mounted() {
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }

    this.loadCredentialsFromBiometrics()
  }

  async signIn() {
    this.loading = true
    try {
      const data = await this.$store.dispatch('signIn', this.form)

      // TODO: Find better way to determine login success
      if (data.response.user) {
        const result: AvailableResult = await NativeBiometric.isAvailable()

        console.log(result)

        if (result.isAvailable)
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

  async loadCredentialsFromBiometrics() {
    const result: AvailableResult = await NativeBiometric.isAvailable()
    const biometricsAvailable = result.isAvailable

    if (biometricsAvailable) {
      // Get user's credentials
      const credentials: Credentials = await NativeBiometric.getCredentials({
        server: 'worxstr.com',
      })

      try {
        await NativeBiometric.verifyIdentity({
          reason: 'For easy sign in.',
          title: 'Log in with biometrics',
          subtitle: 'Your Worxstr credentials are saved securely on this device.',
        })
        
        // Authentication successful
        this.form.email = credentials.username
        this.form.password = credentials.password
        this.signIn()
      }
      catch (error) {
        this.$store.dispatch('showSnackbar', {
          text: "Couldn't sign in with biometrics."
        })
      }
    }
  }
}
</script>
