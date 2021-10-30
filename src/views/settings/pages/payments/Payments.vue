<template lang="pug">
div
  add-funding-source-dialog(:opened.sync="addFundingSourceDialog")
  edit-funding-source-dialog(
    :opened.sync="editFundingSourceDialog",
    :fundingSource="selectedFundingSource"
  )
  remove-funding-source-dialog(
    :opened.sync="removeFundingSourceDialog",
    :fundingSource="selectedFundingSource"
  )
  beneficial-owners-dialog(:opened.sync="beneficialOwnersDialog")

  v-list

    v-subheader.text-subtitle-2 Dwolla account
    
    v-list-item
      v-list-item-content
        v-list-item-subtitle Dwolla customer ID
        v-list-item-title {{ customerId(me.dwolla_customer_url) }}

      v-list-item-action
        clipboard-copy(:text='customerId(me.dwolla_customer_url)')
    
    v-list-item(v-if='verificationStatus')
      v-list-item-content
        v-list-item-subtitle.mb-2 Identity verification status
        v-list-item-title
          v-chip(label :color='verificationStatus.color')
            | {{ verificationStatus.text }}
      
      v-list-item-action(v-if="verificationStatus.status != 'verified'")
        v-btn(text color='primary') Verify

    v-list-item(two-line, v-if="showBeneficialOwnersForm")
      v-list-item-content
        v-list-item-title Certify beneficial owners
      v-list-item-action
        v-btn(text, color="primary", @click="beneficialOwnersDialog = true") Certify

    v-subheader.text-subtitle-2 Funding sources

    v-skeleton-loader(
      v-if="loadingFundingSources && !fundingSources.length",
      type="list-item-two-line"
    )

    div(v-else)
      v-list-item(
        two-line,
        v-for="fundingSource in fundingSources",
        :key="fundingSource.id"
      )
        v-list-item-content
          v-list-item-title {{ fundingSource.name }}
          v-list-item-subtitle {{ fundingSourceId(fundingSource._links.self.href) }}
        v-list-item-action
          v-btn(text, color="primary", @click="editFundingSource(fundingSource)") Edit
        v-list-item-action.ml-0
          v-btn(text, color="error", @click="removeFundingSource(fundingSource)") Remove

    v-list-item
      v-btn(text, color="primary", @click="addFundingSourceDialog = true")
        v-icon(left) mdi-plus
        span Add funding source
</template>

<script lang="ts">
import { FundingSource } from "@/types/Payments"
import { Vue, Component } from "vue-property-decorator"
import AddFundingSourceDialog from "./AddFundingSourceDialog.vue"
import EditFundingSourceDialog from "./EditFundingSourceDialog.vue"
import RemoveFundingSourceDialog from "./RemoveFundingSourceDialog.vue"
import BeneficialOwnersDialog from "./BeneficialOwnersDialog.vue"
import ClipboardCopy from '@/components/ClipboardCopy.vue'
import { loadFundingSources } from "@/services/payments"
import { currentUserIs, UserRole } from "@/types/Users"
import { dwollaCustomerIdFromUrl, dwollaFundingSourceIdFromUrl } from "@/util/dwolla"

@Component({
	components: {
    AddFundingSourceDialog,
    EditFundingSourceDialog,
    RemoveFundingSourceDialog,
    BeneficialOwnersDialog,
    ClipboardCopy,
	},
  metaInfo: {
    title: 'Settings - Payments'
  }
})
export default class Payments extends Vue {

	loadingFundingSources = false
	addFundingSourceDialog = false
	editFundingSourceDialog = false
	removeFundingSourceDialog = false
	beneficialOwnersDialog = false
	selectedFundingSource: any = null

  verificationStatuses: {
    [key: string]: {
      color: string;
      text: string;
    };
  } = {
    verified: {
      color: 'success',
      text: 'Verified',
    },
    unverified: {
      color: 'warning',
      text: 'Unverified',
    },
    retry: {
      color: 'warning',
      text: 'Verification needed',
    },
    document: {
      color: 'blue',
      text: 'Documents needed',
    },
    suspended: {
      color: 'error',
      text: 'Suspended',
    },
    deactivated: {
      color: 'grey',
      text: 'Deactivated',
    },
  }

  mounted() {
    if (this.$route.params.verifyBeneficialOwners == "true") {
      this.beneficialOwnersDialog = true
    }
    if (this.$route.params.addFundingSource == "true") {
      this.addFundingSourceDialog = true
    }

    this.loadFundingSources()
  }
  
  get me() {
    return this.$store.getters.me
  }

	get fundingSources() {
		return this.$store.getters.fundingSources
	}

  get showBeneficialOwnersForm() {
    return currentUserIs(UserRole.OrganizationManager) &&
      !this.loadingFundingSources && 
      !this.$store.state.payments.beneficialOwnersCertified
  }

  get verificationStatus() {
    const status = this.me.organization_info.dwolla_customer_status
    return status ? {
      ...this.verificationStatuses[status],
      status
    } : null
  }

  customerId(customerUrl: string) {
    return dwollaCustomerIdFromUrl(customerUrl)
  }

	async loadFundingSources() {
		this.loadingFundingSources = true
		try {
			await loadFundingSources(this.$store)
		} finally {
			this.loadingFundingSources = false
		}
	}

	async editFundingSource(fundingSource: FundingSource) {
		this.selectedFundingSource = fundingSource
		this.editFundingSourceDialog = true
	}

	async removeFundingSource(fundingSource: FundingSource) {
		this.selectedFundingSource = fundingSource
		this.removeFundingSourceDialog = true
	}

	fundingSourceId(fundingSourceUrl: string) {
		return dwollaFundingSourceIdFromUrl(fundingSourceUrl)
	}
}
</script>