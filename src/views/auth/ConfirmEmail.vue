<template lang="pug">
  v-container.d-flex.flex-column.justify-center(fill-height)
    v-progress-circular.ma-5(indeterminate v-if='loading' color='primary')
    v-icon.text-h2.ma-5(v-else :color="valid ? 'success' : 'error' ") {{ valid ? 'mdi-check' : 'mdi-close' }}

    p.text-body-1 {{ message }}

    .d-flex(v-if='!loading')
      //- v-btn(text @click='navigateToHome' color='primary') Go to home
      //- v-btn(text @click='openApp' color='primary' v-if='valid') Open app
      v-btn(text @click='resendEmail' color='primary' v-if='!valid') Resend email
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { confirmEmail, resendEmailConfirmation } from '@/services/auth'
import { showToast } from '@/services/app'
import { defaultRoute } from '@/definitions/User'

@Component({
  metaInfo: {
    title: 'Confirm email'
  }
})
export default class ConfirmEmail extends Vue {
  loading = false
  message = 'Confirming your email address...'
  valid: boolean | null = null

  async mounted() {
    this.loading = true
    try {
      if (!this.$route.query.token) {
        return showToast(this.$store, {text: 'No token provided'})
      }
      await confirmEmail(
        this.$store,
        this.$route.query.token as string,
        this.$route.query.email as string
      )
      this.message = 'Email confirmed.'
      this.valid = true

      setTimeout(this.openApp, 500)
    }
    catch (error) {
      console.log(error)
      this.message = 'Could not confirm email.'
      this.valid = false
    }
    this.loading = false
  }

  openApp() {
    if (!this.$store.state.users.authenticatedUser) {
      this.navigateToLogin()
    }
    else {
      this.$router.push({
        name: defaultRoute()
      })
    }
  }

  navigateToHome() {
    this.$router.push('/')
  }

  navigateToLogin() {
    this.$router.push({ name: 'signIn', params: {
      email: this.$route.query.email as string
    }})
  }

  resendEmail() {
    resendEmailConfirmation(this.$store, this.$route.query.email as string)
  }
}
</script>