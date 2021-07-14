<template lang="pug">
div
  v-sheet.gradient-primary.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold Pricing

  v-container.shift-down.mb-3
    v-row.mb-12
      v-col(cols="12", sm="4", v-for="tier in pricingTiers")
        v-card.hover-effect(elevation="15")
          v-card-title {{ tier.name | capitalize }}

          v-card-text.pb-0
            p(v-if="tier.price != null")
              span.mr-1.text-h4.font-weight-bold(
                :class="`${$vuetify.theme.dark ? 'secondary' : 'primary'}--text`"
              )
                span ${{ tier.price }}
              span / month
            p(v-else) Speak with sales

          v-divider

          v-card-text
            ul
              li.mb-3.text-subtitle-1.font-weight-medium {{ tier.support }}

              li.mb-3.text-subtitle-1.font-weight-medium
                | {{ tier.contractors == Infinity ? 'Unlimited' : tier.contractors }} contractors

          v-card-actions.justify-center
            v-btn.mb-3(
              :color="$vuetify.theme.dark ? 'secondary' : 'primary'",
              :to="{ name: tier.to }"
            ) {{ tier.buttonText }}

    div
      h4.text-h4.font-weight-black.mb-3 Need help deciding?
      p
        | Contact us
        router-link(:to="{name: 'contact'}") &nbsp;here&nbsp;
        | for support.
        //- | or visit our
        //- router-link(to="/support") &nbsp;support page
        //- | .
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  metaInfo: {
    title: "Pricing",
  },
})
export default class Pricing extends Vue {
  pricingTiers = [
    {
      price: 0,
      name: 'free',
      contractors: 10,
      support: 'Free tier chat assistance',
      to: 'sign-up',
      buttonText: 'Get free',
    },
    {
      price: 100,
      name: 'premium',
      contractors: 100,
      support: 'Standard support',
      to: 'sign-up',
      buttonText: 'Get premium',
    },
    {
      price: null,
      name: 'enterprise',
      contractors: Infinity,
      support: '24/7 support',
      to: 'contact',
      buttonText: 'Contact sales',
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
  transition: cubic-bezier(0.165, 0.84, 0.44, 1) transform 0.3s !important;
}
.hover-effect:hover {
  transform: scale(1.03);
  z-index: 2;
}
</style>