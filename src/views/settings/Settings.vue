<template lang="pug">
	v-container.pb-16(fluid)
		change-password-dialog(:opened.sync="changePasswordDialog")
		SSNDialog(:opened.sync="ssnDialog")
		add-funding-source-dialog(:opened.sync="addFundingSourceDialog")

		v-card.soft-shadow
			v-list.pa-0(rounded subheader)
				v-subheader.text-subtitle-1.font-weight-medium Profile
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Name
						v-list-item-title {{ authenticatedUser | fullName }}
					v-list-item-action
						v-btn(text color='primary' @click="signOut") Sign out
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Organization
						v-list-item-title {{ authenticatedUser.organization_info.name }}
								
				v-list-item(two-line v-if="authenticatedUser.contractor_info")
					v-list-item-content
						v-list-item-subtitle.mb-2 Address
						v-list-item-title {{ authenticatedUser.contractor_info.address }}
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-subtitle.mb-2 Roles
						v-list-item-title
							div
								v-chip.mr-2(label v-for="(role, i) in authenticatedUser.roles" :key='i')
									| {{role.name | snakeToSpace | capitalize }}
						
				v-list-item(two-line v-if="authenticatedUser.contractor_info && !authenticatedUser.contractor_info.need_info")
					v-list-item-content
						v-list-item-title SSN
					v-list-item-action
						v-btn(text color='primary' @click="ssnDialog = true") Set SSN

				v-divider
				v-subheader.text-subtitle-1.font-weight-medium Payments

				v-list-item(two-line v-for='fundingSource in fundingSources' :key='fundingSource.id')
					v-list-item-content
						v-list-item-title {{ fundingSource.name }}
					v-list-item-action
						v-btn(text color='primary') Edit
					v-list-item-action.ml-0
						v-btn(text color='error') Remove
				
				v-list-item
					v-btn(text color='primary' @click='addFundingSourceDialog = true')
						v-icon(left) mdi-plus
						span Add funding source
				
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
import AddFundingSourceDialog from './AddFundingSourceDialog'

export default {
	name: "settings",
	metaInfo: {
		title: 'Settings',
	},
	components: { SSNDialog, ChangePasswordDialog, AddFundingSourceDialog },
	computed: {
			...mapState({
				authenticatedUser: state => state.authenticatedUser,
				fundingSources: state => state.payments.fundingSources
			}),
	},
	mounted() {
		if (this.$route.params.openSSNDialog == "true") {
			this.ssnDialog = true
		}
		this.loadFundingSources()
	},
	data: () => ({
		changePasswordDialog: false,
		ssnDialog: false,
		addFundingSourceDialog: false,
		preferences: {
			darkMode: window.localStorage.getItem('darkMode') || 'System default',
		},
	}),
	methods: {
		async loadFundingSources() {
			this.loadingPayments = true
			try {
				await this.$store.dispatch('loadFundingSources')
			}
			finally {
				this.loadingPayments = false
			}
		},
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
		},
		signOut() {
			this.$store.dispatch('signOut')
		},
	}
};
</script>