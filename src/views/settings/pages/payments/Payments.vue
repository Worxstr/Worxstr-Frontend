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
import { FundingSource } from "@/definitions/Payments"
import { Vue, Component } from "vue-property-decorator"
import AddFundingSourceDialog from "./AddFundingSourceDialog.vue"
import EditFundingSourceDialog from "./EditFundingSourceDialog.vue"
import RemoveFundingSourceDialog from "./RemoveFundingSourceDialog.vue"
import BeneficialOwnersDialog from "./BeneficialOwnersDialog.vue"

@Component({
	components: {
    AddFundingSourceDialog,
    EditFundingSourceDialog,
    RemoveFundingSourceDialog,
    BeneficialOwnersDialog,
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

  mounted() {
    if (this.$route.params.verifyBeneficialOwners == "true") {
      this.beneficialOwnersDialog = true
    }
    if (this.$route.params.addFundingSource == "true") {
      this.addFundingSourceDialog = true
    }

    this.loadFundingSources()
  }

	get fundingSources() {
		return this.$store.getters.fundingSources
	}

  get showBeneficialOwnersForm() {
    return !this.loadingFundingSources && !this.$store.state.payments.beneficialOwnersCertified
  }

	async loadFundingSources() {
		this.loadingFundingSources = true
		try {
			await this.$store.dispatch("loadFundingSources")
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
		return fundingSourceUrl.replace(
			"https://api-sandbox.dwolla.com/funding-sources/",
			""
		)
	}
}
</script>