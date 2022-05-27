<template lang="pug">
v-sheet(:color='color' dark)
  v-container.py-16.text-center.text-sm-start
    v-row(:class='{ reverse }')
      v-col.d-flex.flex-column.justify-center.align-center.align-sm-start(cols='12' sm='6')
        h4.text-h4.mb-3.font-weight-black {{ title }}
        p.body-2 {{ description }}
        v-btn.mr-3(
          dark
          outlined
          color='accent'
          :to="{ name: ctaTo }"
        )
          span.white--text {{ ctaText }}
      
      v-col(cols='12' sm='6')
        v-img(:src='imageSrc' width='100%')
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
  @Prop({ default: false }) reverse!: boolean

}
</script>