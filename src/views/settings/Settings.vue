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

		v-card.soft-shadow
			v-list.pa-0(rounded subheader)
				v-subheader.text-subtitle-1 Profile
				
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
				v-subheader.text-subtitle-1 Payments

			
				v-list-item(two-line v-if='showBeneficialOwnersForm')
					v-list-item-content
						v-list-item-title Verify beneficial owners
					v-list-item-action
						v-btn(text color='primary' @click='beneficialOwnersDialog = true') Verify
				
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
				
				v-divider
				v-subheader.text-subtitle-1 Security
				
				v-list-item(two-line)
					v-list-item-content
						v-list-item-title Password
					v-list-item-action
						v-btn(text color='primary' @click="changePasswordDialog = true") Change

				v-divider
				v-subheader.text-subtitle-1 Preferences

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
  },
  mounted() {
    // if (this.$route.params.openSSNDialog == 'true') {
      // this.ssnDialog = true
    // }
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
