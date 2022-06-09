<template lang="pug">
v-container
  v-row.py-10
    v-col.my-8.d-flex.flex-column.justify-center.align-start(cols='12' :md='md')

      h3.text-h3.text-md-h2.font-weight-black.pb-2(
        :class='gradient'
      ) {{ title }}
      h6.text-h4.font-weight-black(v-if='subtitle') {{ subtitle }}
      
      v-btn.mt-6.mr-3.white--text(
        v-if='ctaText && ctaTo'
        elevation='0'
        :color='color'
        :to="ctaTo"
        large
      ) {{ ctaText }}

    v-col.d-flex.flex-column.align-center(
      v-if='imageSrc'
      cols='12'
      :md='12 - md'
    )
      v-img(:src='imageSrc' :width='imageWidth')
      
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Jumbo extends Vue {
  
  @Prop({ type: String }) title!: string
  @Prop({ type: String }) subtitle?: string
  @Prop({ type: String }) ctaText?: string
  @Prop({ type: Object }) ctaTo?: {
    name: string
    params: any
  }
  @Prop({ type: String }) color!: string
  @Prop({ type: String }) imageSrc?: string
  @Prop({ default: .5 }) ratio!: number

  get md() {
    return Math.round(12 * this.ratio)
  }

  get gradient() {
    let color
    let gradient = false
    switch (this.color) {
      case 'primary':
        color = 'secondary'
        gradient = true
        break
      case 'secondary':
        color = 'secondary'
        break
    }
    return gradient ? `gradient-text gradient-${color}` : `${this.color}--text`
  }

  get imageWidth() {
    if (!this.imageSrc) return '100%'
    return this.$vuetify.breakpoint.smAndDown
      ? '60%'
      : (this.$vuetify.breakpoint.mdAndDown ? '100%' : '80%')
  }

}
</script>