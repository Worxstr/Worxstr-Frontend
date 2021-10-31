<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='600'
  persistent
)
  v-form.flex-grow-1.d-flex.flex-column(
    ref='form'
    @submit.prevent='retryVerification'
    v-model='isValid'
  )
    v-card
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Retry identity verification

      v-card-text.pt-4
        //- v-alert(
        //-   border='left'
        //-   type='warning'
        //-   color='warning'
        //-   dense
        //-   text
        //- ) The information you enter must match your IRS tax profile.
        
        manager-form(v-if='userIsManager' @update='managerFormUpdate' :retry='true')
        contractor-form(v-if='userIsContractor' @update='contractorFormUpdate' :retry='true')

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(text color='primary' :disabled='!isValid' type='submit' :loading='loading') Update

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ContractorForm from '@/views/auth/sign-up/ContractorForm.vue'
import ManagerForm from '@/views/auth/sign-up/ManagerForm.vue'
import { currentUserIs, Managers, UserRole } from '@/types/Users'
import { retryDwollaPersonalVerification } from '@/services/users'
import { retryDwollaBusinessVerification } from '@/services/organizations'

@Component({
  components: {
    ContractorForm,
    ManagerForm,
  },
})
export default class RetryVerificationDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean

  form: any = {}
  isValid = false
  loading = false

  closeDialog() {
    this.$emit('update:opened', false)
  }

  get userIsManager() {
    return currentUserIs(...Managers)
  }

  get userIsContractor() {
    return currentUserIs(UserRole.Contractor)
  }

  managerFormUpdate(form: any) {
    this.form = form
  }

  contractorFormUpdate(form: any) {
    console.log('managerFormUpdate', form)
    this.form = form
  }

  async retryVerification() {
    this.loading = true
    try {
      if (this.userIsManager) {
        await retryDwollaBusinessVerification(this.$store, this.form)
      } else if (this.userIsContractor) {
        await retryDwollaPersonalVerification(this.$store, this.form)
      }
    } finally {
      this.loading = false
    }
  }
}
</script>
