<template lang="pug">

.d-flex.flex-column

  div(v-for='(item, i) in body' :key='i')

    jumbo(
      v-if='item.__component === "semantic.jumbo"'
      :color='computeColor(item)'
      v-bind='item'
      :image-src='imageUrl(item)'
      :ratio='.6'
    )

    feature-list(
      v-else-if='item.__component === "semantic.feature-list"'
      :color='computeColor(item)'
      v-bind='item'
      :features='item.featureListItems'
    )

    rich-text(
      v-else-if='item.__component === "semantic.rich-text"'
      :body='item.body'
    )

    feature(
      v-else-if='item.__component === "semantic.feature"'
      :color='computeColor(item)'
      v-bind='item'
      :image-src='imageUrl(item)'
    )

    testimonial(
      v-else-if='item.__component === "semantic.testimonial"'
      v-bind='item'
      :author-image-src='imageUrl(item, "authorImage")'
      :image-src='imageUrl(item)'
      :color='color'
    )

    carousel(
      v-else-if='item.__component === "semantic.carousel"'
      v-bind='item'
      :items="mapCarouselItems(item)"
    )


</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Jumbo from '@/components/informational/Jumbo.vue'
import FeatureList from '@/components/informational/FeatureList.vue'
import RichText from '@/components/informational/RichText.vue'
import Feature from '@/components/informational/Feature.vue'
import Testimonial from '@/components/informational/Testimonial.vue'
import Carousel from '@/components/informational/Carousel.vue'
import { getFeature, getIndustry } from '@/services/cms'

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

  @Prop({ type: String }) type!: string

  title = 'Feature'
  color = 'primary'
  body: any[] = []

  metaInfo() {
    return {
      title: this.title,
    }
  }

  @Watch('$route.params.contentId')
  onRouteChange() {
    this.init()
  }

  mounted() {
    this.init()
  }

  async init() {

    let endpoint
    switch (this.type) {
      case 'feature':
        endpoint = getFeature
        break
      case 'industry':
        endpoint = getIndustry
        break
    }

    if (!endpoint) return

    const { name, body, color } = await endpoint(this.$route.params.contentId)
    
    this.title = name
    this.body = body
    this.color = color
  }

  imageUrl(item: any, attributeName='image', size = 'medium') {
    const attrs = item[attributeName]?.data?.attributes
    if (!attrs?.formats) return attrs.url
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

  computeColor(item: any) {
    return item.color === 'default' ? '' : (item.color || this.color)
  }
}
</script>