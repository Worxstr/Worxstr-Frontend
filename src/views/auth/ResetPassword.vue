<template lang="pug">
v-container.sign-in.fill-height.d-flex.flex-column.justify-center.align-center
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 50px')
 
  v-card.soft-shadow(width="500")
    v-form(@submit.prevent="submit", v-model="isValid")
      v-card-title.text-h5 Reset your password
      v-card-subtitle(v-if='hasToken && $route.query.email') For {{ $route.query.email }}
      v-card-text
        v-alert(
          v-if='usingSandbox'
          border='left'
          color='primary'
          dense
          text
          type='info'
        ) This account uses sandbox environment
        v-text-field(
          v-if='!hasToken'
          autofocus
          label='Email'
          type='email'
          required
          outlined
          dense
          v-model='form.email'
          :rules='emailRules'
        )
        div(v-else)
          v-text-field(
            autofocus
            outlined,
            dense,
            label="New password",
            v-model="form.password",
            :rules="rules.password",
            required
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append='showPassword = !showPassword'
          )

          v-text-field(
            v-if='!showPassword'
            outlined
            dense
            label="Confirm new password"
            v-model="form.confirmPassword"
            :rules="[...rules.confirmPassword, rules.passwordMatches(form.password, form.confirmPassword)]"
            required
            type="password"
          )
      v-card-actions
        v-spacer
        v-btn(
          text
          color="primary"
          type="submit"
          :disabled="!isValid"
        ) {{ hasToken ? 'Reset password' : 'Send reset email' }}
    v-fade-transition
      v-overlay(absolute, opacity="0.2", v-if="loading")
        v-progress-circular(indeterminate)
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { exists, emailRules, passwordRules, passwordMatches } from '@/util/inputValidation'
import Arrows from '@/components/Arrows.vue'
import { sendResetPasswordEmail, resetPassword } from '@/services/auth'
import { showToast, toggleSandbox } from '@/services/app'

@Component({
  metaInfo: {
    title: 'Reset password'
  },
  components: {
    Arrows,
  },
})
export default class ResetPassword extends Vue {

  form = {
    email: '',
    password: '',
    confirmPassword: '',
  }
  isValid = false
  loading = false
  emailRules = emailRules
  showPassword = false
  hasToken = false
  rules = {
    password: passwordRules,
    confirmPassword: [exists('Password confirmation required')],
    passwordMatches,
  }

  mounted() {
    if (this.$route.query.token) {
      this.hasToken = true
    }

    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }
  }

  get usingSandbox() {
    return this.form.email.includes('+test')
  }

  @Watch('usingSandbox')
  sandboxToggled(sandbox: boolean) {
    toggleSandbox(this.$store, sandbox)
  }

  async submit() {
    this.loading = true
    try {
      if (this.hasToken) {
        await resetPassword(this.$store, this.$route.query.token as string, this.form.password)
      }
      else {
        await sendResetPasswordEmail(this.$store, this.form.email)
        showToast(this.$store, {text: 'Reset link sent'})
      }
    }
    finally {
      this.loading = false
    }
  }
}
</script>
