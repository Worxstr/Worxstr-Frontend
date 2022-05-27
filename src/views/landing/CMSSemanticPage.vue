<template lang="pug">

.d-flex.flex-column

  div(v-for='(item, i) in body' :key='i')

    jumbo(
      v-if='item.__component === "semantic.jumbo"'
      :color='color'
      v-bind='item'
      :image-src='imageUrl(item)'
      :ratio='.6'
    )

    feature-list(
      v-if='item.__component === "semantic.feature-list"'
      :color='color'
      v-bind='item'
      :features='item.featureListItems'
    )

    rich-text(
      v-if='item.__component === "semantic.rich-text"'
      :body='item.body'
    )

    feature(
      v-if='item.__component === "semantic.feature"'
      :color='color'
      v-bind='item'
      :image-src='imageUrl(item)'
    )

    testimonial(
      v-if='item.__component === "semantic.testimonial"'
      v-bind='item'
      :author-image-src='imageUrl(item, "authorImage")'
      :image-src='imageUrl(item)'
      :color='color'
    )

    carousel(
      v-if='item.__component === "semantic.carousel"'
      v-bind='item'
      :items="mapCarouselItems(item)"
    )


</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Jumbo from '@/components/informational/Jumbo.vue'
import FeatureList from '@/components/informational/FeatureList.vue'
import RichText from '@/components/informational/RichText.vue'
import Feature from '@/components/informational/Feature.vue'
import Testimonial from '@/components/informational/Testimonial.vue'
import Carousel from '@/components/informational/Carousel.vue'
import { getFeature } from '@/services/cms'

@Component({
  components: {
    Jumbo,
    FeatureList,
    RichText,
    Feature,
    Testimonial,
    Carousel,
  },
})
export default class CMSSemanticPage extends Vue {
  title = 'Feature'
  color = 'primary'
  body: any[] = []

  metaInfo() {
    return {
      title: this.title,
    }
  }

  async mounted() {
    const { name, body, color }= await getFeature(this.$route.params.featureId)
    
    this.title = name
    this.body = body
    this.color = color
  }

  imageUrl(item: any, attributeName='image', size = 'medium') {
    const attrs = item[attributeName]?.data?.attributes
    return attrs?.formats[size]?.url || attrs?.url
  }

  mapCarouselItems(item: any) {
    return item.carouselItems.map((carouselItem: any) => {
      return {
        src: this.imageUrl(carouselItem, 'image', 'large'),
        caption: carouselItem.caption,
      }
    })
  }
}
</script>