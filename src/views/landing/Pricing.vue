<template lang="pug">
div
  v-sheet.gradient-secondary.overlap
    v-container.py-16
      h3.text-h3.font-weight-black Business pricing

  v-container.shift-down.mb-3
    v-row
      v-col(cols="12", sm="4", v-for="(tier, i) in pricingTiers" :key='i')
        v-card.hover-effect.soft-shadow(outlined :class='highlight(tier) ? "gradient-tertiary" : ($vuetify.theme.dark ? "dark-color" : "light-color")')
          v-card-title.text-h5 {{ tier.name | capitalize }}

          v-card-text.pb-0
            p(v-if="tier.description") {{ tier.description }}
            p(v-else)
              span.mr-1.text-h4.font-weight-black(
                class='accent--text'
              ) ${{ tier.price }}
              span / month

          div(:style="`background: rgba(255,255,255,${(highlight(tier) || $vuetify.theme.dark) ? '.1' : '.8'})`")
            v-card-text
              ul
                li.mb-3.text-subtitle-1.font-weight-medium {{ tier.support }}

                li.mb-3.text-subtitle-1.font-weight-medium
                  | {{ tier.contractors == Infinity ? 'Unlimited' : tier.contractors }} contractors

            v-card-actions.justify-center.pb-5
              v-btn(
                elevation='0'
                :color="highlight(tier) ? 'accent' : 'primary'",
                :to="tier.to"
              )
                span(:class="highlight(tier) ? 'black--text' : ''") {{ tier.buttonText }}

    .mt-12
      h4.text-h4.font-weight-black.mb-3 Need help deciding?
      p
        | Are you a contractor? Click
        router-link(:to="{ name: 'signUp' }") &nbsp;here&nbsp;
        | to create your account.
        br
        | Or, contact us
        router-link(:to="{ name: 'contact' }") &nbsp;here&nbsp;
        | for support.
      
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0' v-if='$vuetify.breakpoint.smAndUp')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'

type Tier = {
  name: string;
  price: number | null;
  description?: string;
  contractors: number;
  support: string;
  buttonText: string;
  to: {
    name: string;
    params: {
      [key: string]: string;
    };
  };
}

@Component({
  metaInfo: {
    title: "Pricing",
  },
  components: {
    Arrows
  }
})
export default class Pricing extends Vue {
  pricingTiers: Tier[] = [
    {
      price: 0,
      name: 'free',
      description: 'Free forever',
      contractors: 10,
      support: 'Free tier chat assistance',
      buttonText: 'Get free',
      to: {name: 'signUp', params: { subscriptionTier: 'free' }}
    },
    {
      price: 100,
      name: 'premium',
      contractors: 100,
      support: 'Standard support',
      buttonText: 'Get premium',
      to: {name: 'signUp', params: { subscriptionTier: 'premium' }}
    },
    {
      price: null,
      name: 'enterprise',
      description: 'Speak with sales',
      contractors: Infinity,
      support: '24/7 support',
      buttonText: 'Contact sales',
      to: {name: 'contact', params: { option: 'sales' }}
    }
  ]

  highlight(tier: Tier) {
    return tier.name == "premium"
  }
}
</script>

<style lang="scss">
.hover-effect {
  transform: scale(1);
  z-index: 1;
  transition: cubic-bezier(0.165, 0.84, 0.44, 1) transform 0.3s !important;
}
.hover-effect:hover {
  transform: scale(1.03);
  z-index: 2;
}
.test {
  background-color: var(--v-accent-lighten2)
}
</style>