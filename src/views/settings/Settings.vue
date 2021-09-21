<template lang="pug">
	v-container.pb-16(fluid)
		change-password-dialog(:opened.sync="changePasswordDialog")
		add-funding-source-dialog(:opened.sync="addFundingSourceDialog")
		edit-funding-source-dialog(
			:opened.sync='editFundingSourceDialog'
			:fundingSource='selectedFundingSource'
		)
		remove-funding-source-dialog(
			:opened.sync='removeFundingSourceDialog'
			:fundingSource='selectedFundingSource'
		)
		beneficial-owners-dialog(:opened.sync="beneficialOwnersDialog")

		v-card.py-2(rounded)
			v-tabs(:vertical='$vuetify.breakpoint.smAndUp')

				v-tab.justify-start
					v-icon(left) mdi-account
					| Profile

				v-tab.justify-start
					v-icon(left) mdi-cash-multiple
					| Payments

				v-tab.justify-start
					v-icon(left) mdi-lock
					| Security

				v-tab.justify-start
					v-icon(left) mdi-palette
					| Preferences
				
				
				v-tab-item
					v-list
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
									roles(:roles='authenticatedUser.roles')
										
						v-list-item(two-line v-if="authenticatedUser.contractor_info")
							v-list-item-content
								v-list-item-subtitle.mb-2 Hourly wage
								v-list-item-title
									span(v-if='authenticatedUser.contractor_info.hourly_rate') {{ authenticatedUser.contractor_info.hourly_rate | currency }}
									span(v-else) Not set
										
						v-list-item(two-line v-if="authenticatedUser.manager_info")
							v-list-item-content
								v-list-item-subtitle.mb-2 Manager reference number
								v-list-item-title {{ authenticatedUser.manager_info.reference_number }}
								
				v-tab-item
					v-list

						v-list-item(two-line v-if='showBeneficialOwnersForm')
							v-list-item-content
								v-list-item-title Certify beneficial owners
							v-list-item-action
								v-btn(text color='primary' @click='beneficialOwnersDialog = true') Certify
						
						v-subheader.text-subtitle-2 Funding sources

						v-skeleton-loader(
							v-if='loadingFundingSources && !fundingSources.length'
							type='list-item-two-line'
						)

						div(v-else)
							v-list-item(two-line v-for='fundingSource in fundingSources' :key='fundingSource.id')
								v-list-item-content
									v-list-item-title {{ fundingSource.name }}
									v-list-item-subtitle {{ fundingSourceId(fundingSource._links.self.href) }}
								v-list-item-action
									v-btn(text color='primary' @click='editFundingSource(fundingSource)') Edit
								v-list-item-action.ml-0
									v-btn(text color='error' @click='removeFundingSource(fundingSource)') Remove
						
						v-list-item
							v-btn(text color='primary' @click='addFundingSourceDialog = true')
								v-icon(left) mdi-plus
								span Add funding source
						
				v-tab-item
					v-list
						
						v-list-item(two-line)
							v-list-item-content
								v-list-item-title Password
							v-list-item-action
								v-btn(text color='primary' @click="changePasswordDialog = true") Change

				v-tab-item
					v-list

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
import { mapState, mapGetters } from 'vuex'
import ChangePasswordDialog from './ChangePasswordDialog'
import BeneficialOwnersDialog from './BeneficialOwnersDialog'
import AddFundingSourceDialog from './AddFundingSourceDialog'
import EditFundingSourceDialog from './EditFundingSourceDialog'
import RemoveFundingSourceDialog from './RemoveFundingSourceDialog'
import Roles from '@/components/Roles.vue'

export default {
  name: 'settings',
  metaInfo: {
    title: 'Settings',
  },
  components: {
    BeneficialOwnersDialog,
    ChangePasswordDialog,
    AddFundingSourceDialog,
    EditFundingSourceDialog,
    RemoveFundingSourceDialog,
		Roles,
  },
  mounted() {
    if (this.$route.params.verifyBeneficialOwners == 'true') {
      this.beneficialOwnersDialog = true
    }
		if (this.$route.params.addFundingSource == 'true') {
			this.addFundingSourceDialog = true
		}
    this.loadFundingSources()
  },
  data: () => ({
    changePasswordDialog: false,
    ssnDialog: false,
    loadingFundingSources: false,
    addFundingSourceDialog: false,
    editFundingSourceDialog: false,
    removeFundingSourceDialog: false,
		beneficialOwnersDialog: false,
    selectedFundingSource: null,
    preferences: {
      darkMode: window.localStorage.getItem('darkMode') || 'System default',
    },
  }),
  computed: {
    ...mapState({
      authenticatedUser: (state) => state.authenticatedUser,
    }),
    ...mapGetters(['fundingSources']),

		showBeneficialOwnersForm() {
			// TODO: This is a hack to show the form for the first time
			// If these two fields exist on the object returned at /payments/user in _links object, then return true
			// certify-beneficial-ownership
			// verify-beneficial-owners
			return true
		}
  },
  methods: {
    async loadFundingSources() {
      this.loadingFundingSources = true
      try {
        await this.$store.dispatch('loadFundingSources')
      } finally {
        this.loadingFundingSources = false
      }
    },
    async editFundingSource(fundingSource) {
      this.selectedFundingSource = fundingSource
      this.editFundingSourceDialog = true
    },
    async removeFundingSource(fundingSource) {
      this.selectedFundingSource = fundingSource
      this.removeFundingSourceDialog = true
    },
    fundingSourceId(fundingSourceUrl) {
      return fundingSourceUrl.replace(
        'https://api-sandbox.dwolla.com/funding-sources/',
        ''
      )
    },
    updateDarkMode() {
      let dark
      switch (this.preferences.darkMode) {
        case 'System default':
          dark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
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
  },
}
</script>
