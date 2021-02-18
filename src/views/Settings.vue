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
							td SSN
							td.stretch {{ authenticatedUser.employee_info.ssn}}

					v-subheader Preferences
						
					table.settings-table
						tr
							td.stretch Dark mode
							td
								v-switch(
									v-model="$vuetify.theme.dark"
									inset
									dense
									persistent-hint
								)
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: "settings",
	computed: {
		...mapState(['authenticatedUser']),
	}
};
</script>

<style lang="scss">
	
	.settings-table {
		th, td {
			padding: 20px 20px;
		}
		td.stretch {
			width: 100%;
		}
	}

</style>