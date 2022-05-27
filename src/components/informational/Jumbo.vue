<template lang="pug">
v-container
  v-row.py-10
    v-col.my-8.d-flex.flex-column.justify-center.align-start(cols='12' :md='md')

      h3.text-h3.text-md-h2.font-weight-black.mb-2(
        :class='gradient'
      ) {{ title }}
      h6.text-h4.font-weight-black(v-if='subtitle') {{ subtitle }}

      
      v-btn.mt-6.mr-3.white--text(
        v-if='ctaText && ctaTo'
        elevation='0'
        :color='color'
        :to="{ name: ctaTo }"
        large
      ) {{ ctaText }}

    v-col(
      v-if='imageSrc'
      cols='12'
      :md='12 - md'
    )
      v-img(:src='imageSrc' width='100%')
      
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Title extends Vue {
  
  @Prop({ type: String }) title!: string
  @Prop({ type: String }) subtitle?: string
  @Prop({ type: String }) ctaText?: string
  @Prop({ type: String }) ctaTo?: string
  @Prop({ type: String }) color!: string
  @Prop({ type: String }) imageSrc?: string
  @Prop({ default: .6 }) ratio!: number

  get md() {
    return Math.round(12 * this.ratio)
  }

  get gradient() {
    let color, gradient = false
    switch (this.color) {
      case 'primary':
        color = 'secondary'
        gradient = true
        break
      case 'secondary':
        color = 'secondary'
        break
    }
    return gradient ? `gradient-text gradient-${color}` : `${color}--text`
  }

}
</script>