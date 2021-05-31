<template lang="pug">
	v-container.pb-16
		ChangePasswordDialog(:opened.sync="changePasswordDialog")
		SSNDialog(:opened.sync="ssnDialog")

		v-toolbar(flat, color="transparent")
			v-toolbar-title.text-h5.font-weight-medium Settings

		v-card
			v-list.pa-0(rounded subheader)
				v-subheader.text-subtitle-1.font-weight-medium Profile
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Name
						v-list-item-title {{ authenticatedUser | fullName }}
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Organization
						v-list-item-title {{ authenticatedUser.organization_info.name }}
								
				v-list-item(two-line v-if="authenticatedUser.employee_info")
					v-list-item-content
						v-list-item-subtitle.mb-2 Address
						v-list-item-title {{ authenticatedUser.employee_info.address }}
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Roles
						v-list-item-title
							div
								div(v-for='role in authenticatedUser.roles' style='display: inline-block; width: 300px; height: 100px; background: red; border: white 2px solid;')
								//- v-chip.mr-2(label v-for="role in authenticatedUser.roles")
								//- 	| {{role.name | snakeToSpace | capitalize }}
						
				v-list-item(two-line v-if="authenticatedUser.employee_info && !authenticatedUser.employee_info.need_info")
					v-list-item-content
						v-list-item-title SSN
					v-list-item-action
						v-btn(text color='primary' @click="ssnDialog = true") Set SSN

				v-divider
				v-subheader.text-subtitle-1.font-weight-medium Security
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-title Password
					v-list-item-action
						v-btn(text color='primary' @click="changePasswordDialog = true") Change

				v-divider
				v-subheader.text-subtitle-1.font-weight-medium Preferences

				v-list-item(two-line)
					v-list-item-content
						v-list-item-title Dark theme
					v-list-item-action
						v-select.fit(
							v-model="preferences.darkMode"
							:items="['System default', 'Light', 'Dark']"
							@change="updateDarkMode"
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
	metaInfo: {
		title: 'Settings',
	},
	components: { SSNDialog, ChangePasswordDialog },
	computed: {
		...mapState(['authenticatedUser']),
	},
	mounted() {
		if (this.$route.params.openSSNDialog == "true") {
			this.ssnDialog = true
		}
	},
	data: () => ({
		changePasswordDialog: false,
		ssnDialog: false,
		preferences: {
			darkMode: window.localStorage.getItem('darkMode') || 'System default',
		},
	}),
	methods: {
		updateDarkMode() {
			let dark
			switch (this.preferences.darkMode) {
				case 'System default':
					dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
					break 
				case 'Light':
					dark = false
					break
				case 'Dark':
					dark = true
					break
			}
			window.localStorage.setItem('darkMode', this.preferences.darkMode)
			this.$vuetify.theme.dark = dark
		}
	}
};
</script>