<template lang="pug">
v-sheet.testimonial(
  :style='`background-image: url(${imageSrc});`'
)
  v-container.d-flex.flex-column.py-16.gap-small

    blockquote.text-center
      h3.text-h3.mb-8.font-weight-black &ldquo;{{ primaryQuote }}&rdquo;
      p.body-1 &ldquo;{{ secondaryQuote }}&rdquo;

    v-divider

    .d-flex.flex-row.align-center.justify-center
      v-avatar(
        size='55'
        color='accent'
        dark
      )
        img(:src='authorImageSrc' :alt='authorName')

      .d-flex.flex-column.ml-3
        span.text-h6.font-weight-medium.mb-0 {{ authorName }}
        span.body-1.font-italic {{ authorTitle }}

  v-overlay(absolute :color='color')

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Testimonial extends Vue {
  
  @Prop({ type: String }) primaryQuote!: string
  @Prop({ type: String }) secondaryQuote?: string
  @Prop({ type: String }) authorName?: string
  @Prop({ type: String }) authorTitle?: string
  @Prop({ type: String }) authorImageSrc?: string
  @Prop({ type: String }) imageSrc?: string
  @Prop({ type: String }) color?: string

}
</script>

<style lang="scss">
  .testimonial {
    background-size: cover;
    background-position: center;
    position: relative;
    
    .container {
      position: relative;
      z-index: 6 !important;
    }
  }
</style>