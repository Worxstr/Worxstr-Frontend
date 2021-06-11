<template lang="pug">
	div
		v-sheet.gradient.overlap
			v-container.py-16
				h3.text-h3.mb-16.font-weight-bold Pricing

		v-container.shift-down.mb-3
			v-row
				v-col(cols='12' sm='4' v-for='tier in pricingTiers')
					v-card.hover-effect(elevation='15')
						v-card-title {{ tier.name }}
						
						v-card-text
							p.mb-5(v-if='tier.price != null')
								span.mr-1.text-h4.font-weight-bold.secondary--text ${{ tier.price }}
								span / month

							ul
								li.mb-3.text-subtitle-1.font-weight-medium {{ tier.support }}
								
								li.mb-3.text-subtitle-1.font-weight-medium
									| {{ tier.contractors == Infinity ? 'Unlimited' : tier.contractors }} contractors
								
								li.mb-1.text-subtitle-1.font-weight-medium
									| ${{ tier.transactions | numberFormat }}/year/manager
									.text-body-2 in total transactions

						v-card-actions.justify-center
							v-btn(text color='secondary' v-if='tier.price == null') Contact sales
							v-btn(text color='secondary' v-else) Get {{ tier.name }}

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Pricing extends Vue {
	pricingTiers =[
		{
			price: 0,
			name: 'Free',
			contractors: 10,
			transactions: 75000,
			support: 'Free tier chat assistance'
		},
		{
			price: 100,
			name: 'Standard',
			contractors: 100,
			transactions: 150000,
			support: 'Standard support'
		},
		{
			price: null,
			name: 'Advanced',
			contractors: Infinity,
			transactions: 75000,
			support: '24/7 support'
		}
	]
}
</script>

<style lang="scss">
	.overlap {
		position: absolute;
    width: 100%;
	}
	.shift-down {
		padding-top: 160px !important;
	}

	.hover-effect {
		transform: scale(1);
		z-index: 1;
		transition: cubic-bezier(0.165, 0.84, 0.44, 1) transform .3s !important;
	}
	.hover-effect:hover {
		transform: scale(1.03);
		z-index: 2;
	}
</style>