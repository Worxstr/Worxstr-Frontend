<template lang="pug">
div
  v-sheet.gradient-secondary.overlap
    v-container.py-16
      h3.text-h3.font-weight-black Business pricing

      .d-flex.align-center.mt-2
        span.text-subtitle-1 Monthly
        v-switch.mt-0.mx-2(v-model='annual' color='accent' hide-details)
        span.text-subtitle-1 Annually

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
              span / manager / month
            
          div(:style="`background: rgba(255,255,255,${(highlight(tier) || $vuetify.theme.dark) ? '.1' : '.8'})`")
            v-card-text
              v-subheader.text-subtitle-1(v-if='i != 0' :class="highlight(tier) ? 'accent--text' : 'primary--text'")
                | Everything in {{ pricingTiers[i - 1].name | capitalize }}, and:
              ul
                li.mb-3.text-subtitle-1.font-weight-medium(v-for='(feature, i) in tier.features' :key='i')
                  | {{ feature }}

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
        | Are you a contractor?
        router-link(:to="{ name: 'signUp' }") &nbsp;Create your account
        | .
        br
        | Or,
        router-link(:to="{ name: 'contact' }") &nbsp;contact us&nbsp;
        | for support.
      
  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0' v-if='$vuetify.breakpoint.smAndUp')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'

type Tier = {
  name: string
  price: number | null
  description?: string
  features: string[]
  buttonText: string
  to: {
    name: string
    params: {
      [key: string]: string
    }
  }
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
  
  annual = true
  get pricingTiers(): Tier[] {
    return [
      {
        price: 0,
        name: 'free',
        description: 'Free forever',
        features: [
          'Up to 5 contractors',
          'Ticket-based support',
        ],
        buttonText: 'Get free',
        to: {name: 'signUp', params: { subscriptionTier: 'free' }}
      },
      {
        price: this.annual ? 16 : 20,
        name: 'standard',
        features: [
          'Up to 10 contractors',
          'Multiple managers per organization',
          'Chat-based support representative',
        ],
        buttonText: 'Get standard',
        to: {name: 'signUp', params: { subscriptionTier: 'standard' }}
      },
      {
        price: null,
        name: 'enterprise',
        description: 'Speak with sales',
        features: [
          'Unlimited contractors',
          'Dedicated account manager',
        ],
        buttonText: 'Contact sales',
        to: {name: 'contact', params: { option: 'sales' }}
      }
    ]
  }

  highlight(tier: Tier) {
    return tier.name == 'standard'
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