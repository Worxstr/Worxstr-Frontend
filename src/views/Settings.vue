<template lang="pug">
	v-container.home
		v-toolbar(flat, color="transparent")
			v-toolbar-title.text-h5.font-weight-medium Settings
			
		v-card
			v-card-content
				v-list(rounded subheader)
					v-subheader My profile

					table.settings-table
						tr
							td Name
							td.stretch {{ authenticatedUser.first_name }} {{ authenticatedUser.last_name }}
						
						tr 
							td Organization
							td.stretch {{ authenticatedUser.organization_info.name }}

						tr(v-if="authenticatedUser.employee_info")
							td Address
							td.stretch {{ authenticatedUser.employee_info.address }}

						tr(v-if="authenticatedUser.employee_info")
							td Social Security number
							td {{ authenticatedUser.employee_info.ssn}}
							td.stretch
								div.d-flex(v-if="profile.editSSN") 
									v-text-field.input-large(dense hide-details label="SSN") 
									v-btn(text color='primary' @click="profile.editSSN = false") Save

								v-btn(v-else text color='primary' @click="profile.editSSN = true") Set SSN

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

export default {
  name: "settings",
	computed: {
		...mapState(['authenticatedUser']),
	},
	data: () => ({
		profile: {
			editSSN: false,
		},
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