<template lang="pug">

.d-flex.flex-column
  
  jumbo(
    :color='color'
    title='Payments'
    subtitle='The core of the Worxstr functionality.'
    cta-text='Start now'
    cta-to='signUp'
    image-src='https://picsum.photos/1201/900'
    :ratio='.6'
  )
    
  
  feature-list(
    :color='color'
    title='More ways to integrate'
    :features="[{icon: 'mdi-home',title:'Title',description:'Test'},{icon: 'mdi-home',title:'Title',description:'Test'},{icon: 'mdi-home',title:'Title',description:'Test'},{icon: 'mdi-home',title:'Title',description:'Test'}]"
  )

  rich-text(
    body='# Test\nReprehenderit nulla qui deserunt nulla duis ex non eu qui occaecat Lorem excepteur irure.\n- Item 1\n- Item 2\n- Item 3\n## Subtitle\nLaborum voluptate sunt reprehenderit veniam labore.\n### Title 3\nTest\n#### Title 4\nTest\n##### Title 5\nTest\n###### Title 6\nTest\n'
  )

  feature(
    :color='color'
    title='The world\'s most powerful and easy-to-use APIs'
    description='We agonize over the right abstractions so your teams don’t need to stitch together disparate systems or spend months integrating payments functionality.'
    cta-text='Learn more'
    cta-to='signUp'
    image-src='https://picsum.photos/1201/900'
    :reverse='false'
  )

  testimonial(
    primary-quote='I absolutely love Worxstr!'
    secondary-quote='I\'m a big fan of the product and the team behind it. I\'m very happy with the way it works and the way it integrates with other services.'
    name='Jackson Sippe'
    title='Cofounder of Worxstr'
    image-src='https://picsum.photos/1201/900'
    :color='color'
  )

  carousel(
    :items="[{src: 'https://picsum.photos/1205/900', caption:'Test caption'}]"
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

@Component({
  metaInfo: {
    title: 'Feature 1',
  },
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
  color = 'primary'
}
</script>