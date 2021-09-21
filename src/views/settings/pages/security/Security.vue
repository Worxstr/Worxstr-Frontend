<template lang="pug">
div
	change-password-dialog(:opened.sync="changePasswordDialog")

	v-list
		v-list-item(two-line)
			v-list-item-content
				v-list-item-title Password
			v-list-item-action
				v-btn(
					text,
					color="primary",
					@click="changePasswordDialog = true"
				) Change
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ChangePasswordDialog from "./ChangePasswordDialog.vue";

@Component({
	components: {
		ChangePasswordDialog,
	},
  metaInfo: {
    title: 'Settings - Security'
  }
})
export default class Security extends Vue {
	changePasswordDialog = false
}
</script>