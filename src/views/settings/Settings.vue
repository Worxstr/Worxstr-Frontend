<template lang="pug">
	v-container.home
		ChangePasswordDialog(:opened.sync="changePasswordDialog")
		SSNDialog(:opened.sync="ssnDialog")

		v-toolbar(flat, color="transparent")
			v-toolbar-title.text-h5.font-weight-medium Settings
			
		v-card
			v-card-content
				v-list(rounded subheader)
					v-subheader My profile

					table.settings-table
						tr
							td Name
							td.stretch {{ authenticatedUser | fullName }}
						
						tr 
							td Organization
							td.stretch {{ authenticatedUser.organization_info.name }}

						tr
							td Roles
							td.stretch
								v-chip.mx-1(label v-for="role in authenticatedUser.roles")
									| {{role.name | snakeToSpace | capitalize }}

						tr(v-if="authenticatedUser.employee_info")
							td Address
							td.stretch {{ authenticatedUser.employee_info.address }}

						tr(v-if="authenticatedUser.employee_info")
							td Social Security number
							td.stretch {{ authenticatedUser.employee_info.ssn}}
							td
								v-btn(text color='primary' @click="ssnDialog = true") Set SSN
					
					v-subheader Security
					
					table.settings-table
						tr
							td.stretch Change password
							td
								v-btn(text color='primary' @click="changePasswordDialog = true") Change
							

					v-subheader Preferences
						
					table.settings-table
						tr
							td.stretch Color theme
							td
								v-select.input-small(
									v-model="preferences.darkMode"
									disabled
									:items="['System default', 'Light', 'Dark']"
									dense
									hide-details
								)
</template>

<script>
import { mapState } from 'vuex'
import ChangePasswordDialog from './ChangePasswordDialog'
import SSNDialog from './SSNDialog'

export default {
  name: "settings",
	components: { SSNDialog, ChangePasswordDialog },
	computed: {
		...mapState(['authenticatedUser']),
	},
	mounted() {
		if (this.$route.params.openSSNDialog) {
			this.ssnDialog = true
		}
	},
	data: () => ({
		changePasswordDialog: false,
		ssnDialog: false,
		preferences: {
			darkMode: 'System default',
		},
	})
};
</script>

<style lang="scss">
	
	.settings-table {
		th, td {
			padding: 15px 20px;
			white-space: nowrap;
		}
		td.stretch {
			width: 100%;
		}
		.input-large {
			width: 250px;
		}
		.input-small {
			width: 150px;
		}
	}

</style>