<template lang="pug">

.d-flex.flex-column
  v-container
    v-row.py-10
      v-col.my-8.d-flex.flex-column.justify-center.align-start(cols='12' sm='7')

        h3.text-h3.text-md-h2.font-weight-black.mb-2.gradient-text.gradient-primary Payments
        h6.text-h4.font-weight-black The core of the Worxstr functionality.

        
        v-btn.mt-6.mr-3.white--text(
          elevation='0'
          color="tertiary"
          :to="{ name: `signUp` }"
          large
        ) Start now

      v-col(cols='12' sm='5')
        v-img(src='https://picsum.photos/1201/900' width='100%')

    
  v-sheet(color='tertiary')
    v-container.py-16
      h4.text-h4.mb-8 More ways to integrate

      v-row.d-flex
        v-col.d-flex.flex-column.align-start.gap-xs(
          v-for='(icon, i) in ["mdi-home", "mdi-account", "mdi-cube", "mdi-wallet"]'
          cols='12'
          sm='6'
          md='4'
          lg='3'
          xl='2'
        )
          v-icon(size='35' color='accent') {{ icon }}
          h6.text-h6 Title
          p.body-1 Create a full payment page in just a few clicks and share the link with your customers.



  v-sheet
    v-container.py-16
      v-card-text
        h1.text-h4.mb-4 Payments or something
        .body-1
          p Laborum laboris deserunt incididunt non est. Magna aliqua anim consequat Lorem dolor voluptate ut. Ea exercitation laboris occaecat mollit mollit veniam exercitation culpa aute consectetur laborum id aliquip. Magna do fugiat ex velit.
          p Id ad duis est voluptate consectetur non nisi. Ad velit esse sunt cillum non minim minim quis id et consectetur amet qui veniam. Ullamco est duis exercitation proident do. Labore eiusmod ea Lorem ea fugiat sint ea officia sit commodo eu laboris fugiat laborum.

          ul
            li Item 1
            li Item 2
            li Item 3
            li Item 4


  v-sheet
    v-container.py-16
      v-row.d-flex.reverse
        v-col.d-flex.flex-column.justify-center.align-start(cols='12' sm='6')
          h4.text-h4.mb-3 The world's most powerful and easy-to-use APIs
          p.body-2 We agonize over the right abstractions so your teams don’t need to stitch together disparate systems or spend months integrating payments functionality.
          v-btn.mr-3(
            outlined
            color='accent'
            :to="{ name: `signUp` }"
          )
            span(:class="`${$vuetify.theme.dark ? 'white' : 'black'}--text`") Learn more
        
        v-col(cols='12' sm='6')
          v-img(src='https://picsum.photos/1204/900' width='100%')


  v-sheet(color='tertiary')
    v-container.py-16
      v-row
        v-col.d-flex.flex-column.justify-center.align-start(cols='12' sm='6')
          h4.text-h4.mb-3 The world's most powerful and easy-to-use APIs
          p.body-2 We agonize over the right abstractions so your teams don’t need to stitch together disparate systems or spend months integrating payments functionality.
          v-btn.mr-3(
            outlined
            color='accent'
            :to="{ name: `signUp` }"
          )
            span(:class="`${$vuetify.theme.dark ? 'white' : 'black'}--text`") Learn more
        
        v-col(cols='12' sm='6')
          v-img(src='https://picsum.photos/1200/900' width='100%')


  v-sheet
    v-container.py-16
      v-card-text
        h1.text-h4.mb-4 Payments or something
        .body-1
          p Laborum laboris deserunt incididunt non est. Magna aliqua anim consequat Lorem dolor voluptate ut. Ea exercitation laboris occaecat mollit mollit veniam exercitation culpa aute consectetur laborum id aliquip. Magna do fugiat ex velit.
          p Id ad duis est voluptate consectetur non nisi. Ad velit esse sunt cillum non minim minim quis id et consectetur amet qui veniam. Ullamco est duis exercitation proident do. Labore eiusmod ea Lorem ea fugiat sint ea officia sit commodo eu laboris fugiat laborum.

          ul
            li Item 1
            li Item 2
            li Item 3
            li Item 4

        h1.text-h5.my-4 Payments or something

        .body-1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
          p Nisi dolor ullamco commodo velit eu nostrud ex voluptate. Veniam commodo fugiat labore ut eiusmod est nostrud. Nostrud do dolor quis mollit dolore aute nulla do irure.

  v-sheet(style='background-image: url(https://picsum.photos/1200/900); background-size: cover; background-position: center; position: relative;')
    v-container.d-flex.flex-column.py-16.text-center.gap-small(style='position: relative; z-index: 6;')

      blockquote
        h3.text-h3.mb-8.font-weight-black &ldquo;I absolutely love Worxstr!&rdquo;
        p.body-1 &ldquo;It has helped me immensely in my business. By getting organized and having easy invoicing, scheduling, etc., I’ve had more time to focus on my clients and winning new contracts.&rdquo;

      v-divider

      .d-flex.flex-column
        span.text-h6.font-weight-medium.mb-0 Jackson Sippe
        span.body-1.font-italic Co-founder of Worxstr

    v-overlay(absolute color='tertiary')

  v-carousel(v-model='model')
    v-carousel-item(v-for='(image, i) in images' :key='i')
      v-img(:src='image' width='100%')


  v-sheet
    v-container.py-16
      v-card-text
        h1.text-h4.mb-4 Payments or something
        .body-1
          p Id ad duis est voluptate consectetur non nisi. Ad velit esse sunt cillum non minim minim quis id et consectetur amet qui veniam. Ullamco est duis exercitation proident do. Labore eiusmod ea Lorem ea fugiat sint ea officia sit commodo eu laboris fugiat laborum.

          ul
            li Item 1
            li Item 4

          p Nisi dolor ullamco commodo velit eu nostrud ex voluptate. Veniam commodo fugiat labore ut eiusmod est nostrud. Nostrud do dolor quis mollit dolore aute nulla do irure.

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  metaInfo: {
    title: 'Feature 1',
  }
})
export default class Feature extends Vue {
  model = 0
  images = [
    'https://picsum.photos/1200/901',
    'https://picsum.photos/1200/902',
    'https://picsum.photos/1200/903',
    'https://picsum.photos/1200/904',
    'https://picsum.photos/1200/905',
  ]
}
</script>