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
  }
  isValid = false
  loading = false
  emailRules = emailRules
  passwordRules = passwordRules

  mounted() {
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }
  }

  async signIn() {
    this.loading = true
    try {
      await this.$store.dispatch('signIn', this.form)
    } finally {
      this.loading = false
    }
  }
}
</script>
