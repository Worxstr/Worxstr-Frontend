<template lang="pug">
div
	change-password-dialog(:opened.sync='changePasswordDialog')

	v-list
		v-list-item(two-line)
			v-list-item-content
				v-list-item-title Password
			v-list-item-action
				v-btn(
					text
					color='primary'
					@click='changePasswordDialog = true'
				) Change

		v-list-item(three-line v-if='biometricsSaved')
			v-list-item-content
				v-list-item-title Clear biometrics data
				v-list-item-subtitle Delete your saved biometrics credentials from this device

			v-list-item-action
				v-btn(
					text
					color='error'
					@click='clearBiometrics'
				) Clear
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ChangePasswordDialog from './ChangePasswordDialog.vue'
import { AvailableResult, NativeBiometric } from 'capacitor-native-biometric'

@Component({
  components: {
    ChangePasswordDialog,
  },
  metaInfo: {
    title: 'Settings - Security',
  },
})
export default class Security extends Vue {
  changePasswordDialog = false
  biometricsSaved = false

  async mounted() {
    this.checkBiometricsSaved()
  }

  async checkBiometricsSaved() {
    const result: AvailableResult = await NativeBiometric.isAvailable()
    if (result.isAvailable) {
      try {
        // Check if biometrics are saved
        await NativeBiometric.getCredentials({
          server: 'worxstr.com',
        })
        this.biometricsSaved = true
      } catch (e) {
        this.biometricsSaved = false
      }
    }
  }

  async clearBiometrics() {
    await NativeBiometric.deleteCredentials({
      server: 'worxstr.com',
    })
    this.biometricsSaved = false
  }
}
</script>
