<template lang="pug">
v-sheet(:color='color' :dark='dark')
  v-container.py-16.text-center.text-sm-start
    v-row(:class='{ reverse }')
      v-col.d-flex.flex-column.justify-center.align-center.align-sm-start(cols='12' sm='6')
        h4.text-h4.mb-3.font-weight-black {{ title }}
        p.body-1 {{ description }}
        v-btn.mr-3(
          v-if='ctaText && ctaTo'
          dark
          outlined
          color='accent'
          :to="ctaTo"
        )
          span(:class='buttonTextColor') {{ ctaText }}
      
      v-col.d-flex.flex-column.align-center(cols='12' sm='6')
        v-img.mt-6.mt-md-0(:src='imageSrc' :width="imageWidth")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Feature extends Vue {
  
  @Prop({ type: String }) title!: string
  @Prop({ type: String }) description!: string
  @Prop({ type: String }) ctaText!: string
  @Prop({ type: Object }) ctaTo?: {
    name: string
    params: any
  }
  @Prop({ type: String }) imageSrc!: string
  @Prop({ default: '' }) color?: string
  @Prop({ type: Boolean }) dark?: boolean
  @Prop({ default: false }) reverse!: boolean

  get imageWidth() {
    return this.imageSrc.includes('svg')
      ? (this.$vuetify.breakpoint.xs ? '50%' : (this.$vuetify.breakpoint.mdAndDown ? '100%' : '65%') )
      : '100%'
  }

  get buttonTextColor() {
    console.log(this.dark, this.$vuetify.theme.dark)
    return this.dark === null || this.dark === undefined
      ? (this.$vuetify.theme.dark ? 'white--text' : 'black--text')
      : (this.dark ? 'white--text' : 'black--text')
  }

}
</script>