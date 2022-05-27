<template lang="pug">

v-container
  v-row.py-10
    v-col.my-8.d-flex.flex-column.justify-center.align-start(cols='12' sm='7')
      //- h3.text-h3.text-md-h2.font-weight-black.mb-2
      //-   | The&nbsp;
      //-   span.gradient-text(:class="$vuetify.theme.dark ? 'gradient-secondary' : 'gradient-tertiary'") adaptive
      //-   | &nbsp;solution to contract labor management

      h3.text-h3.text-md-h2.font-weight-black.mb-2.gradient-text.gradient-primary Payments
      h6.text-h4.font-weight-black The core of the Worxstr functionality.

      
      v-btn.mt-6.mr-3.white--text(
        elevation='0'
        color="tertiary"
        :to="{ name: `signUp` }"
        large
      ) Start now

    v-col(cols='12' sm='5')
      v-img(src='https://picsum.photos/1200/900' width='100%')

    
  v-card.soft-shadow
    v-card-text.pa-10
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

  v-carousel(v-model='model')
    v-carousel-item(v-for='(image, i) in images' :key='i')
      v-img(:src='image' width='100%')

  v-card.soft-shadow
    v-card-text.pa-10
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

@Component
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