<template lang="pug">
  v-container.d-flex.flex-column.justify-center(fill-height)
    v-progress-circular.ma-5(indeterminate v-if='loading' color='primary')
    v-icon.text-h2.ma-5(v-else :color="valid ? 'success' : 'error' ") {{ valid ? 'mdi-check' : 'mdi-close' }}

    p.text-body-1 {{ message }}

    .d-flex(v-if='!loading')
      v-btn(text @click='navigateToHome' color='primary') Go to home
      v-btn(text @click='navigateToLogin' color='primary' v-if='valid') Sign in
      v-btn(text @click='resendEmail' color='primary' v-else) Resend email
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

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
      await this.$store.dispatch('confirmEmail', this.$route.query.token)
      this.message = 'Email confirmed.'
      this.valid = true
    }
    catch (error) {
      console.log(error)
      this.message = 'Could not confirm email.'
      this.valid = false
    }
    this.loading = false
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
    this.$store.dispatch('resendEmailConfirmation', this.$route.query.email)
  }
}
</script>