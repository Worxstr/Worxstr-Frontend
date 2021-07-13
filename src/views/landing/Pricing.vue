<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-black Pricing

  v-container.shift-down.mb-3
    v-row
      v-col(cols="12", sm="4", v-for="tier in pricingTiers")
        v-card.hover-effect.test(elevation="15")
          v-card-title {{ tier.name | capitalize }}

          v-card-text.pb-0
            p(v-if="tier.price != null")
              span.mr-1.text-h4.font-weight-black(
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
            v-btn(
              text,
              :color="$vuetify.theme.dark ? 'secondary' : 'primary'",
              v-if="tier.name == 'Advanced'",
              :to="{ name: 'contact', params: { subject: 'My company is interested in the advanced plan' } }"
            ) Contact sales

            v-btn(
              text,
              :color="$vuetify.theme.dark ? 'secondary' : 'primary'",
              v-else,
              :to="{ name: 'signUp' }"
            ) {{ tier.price == null ? 'Contact sales' : 'Get started' }}
      
  .d-flex
    v-spacer
    arrows(type='smallGroup')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'

@Component({
  metaInfo: {
    title: "Pricing",
  },
  components: {
    Arrows
  }
})
export default class Pricing extends Vue {
  pricingTiers = [
    {
      price: 0,
      name: 'free',
      contractors: 10,
      support: 'Free tier chat assistance',
    },
    {
      price: 100,
      name: 'premium',
      contractors: 100,
      support: 'Standard support',
    },
    {
      price: null,
      name: 'enterprise',
      contractors: Infinity,
      support: '24/7 support',
    }
  ]
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