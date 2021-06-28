<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold.mb-8 Support
      

  v-container.shift-down
    v-autocomplete.support-search(solo placeholder='Search for help...' style='max-width: 600px')

    v-card.mt-2
      v-card-title Browse articles

      v-expansion-panels(accordion flat)
        v-expansion-panel(v-for='(category, i) in categories' :index='i')
          v-divider
          v-expansion-panel-header {{ category.title }}
          v-expansion-panel-content
            ul
              li.mb-2(v-for='article in category.articles' :index='article.id')
                router-link(to='/') {{ article.title }} 

    .mt-12
      h4.text-h4.font-weight-black.mb-3 Can't find what you need?
      p
        router-link(to="/contact") &nbsp;Contact us&nbsp;
        | for personalized help and assistance.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Support extends Vue {
  categories = [
    {
      title: 'Jobs',
      articles: [
        {
          title: 'Some article 1 blah',
          id: '1'
        },
        {
          title: 'Some article 2 blah',
          id: '2'
        },
        {
          title: 'Some article 11 blah',
          id: '11'
        },
        {
          title: 'Some article 12 blah',
          id: '12'
        },
      ]
    },
    {
      title: 'Payments',
      articles: [
        {
          title: 'Some article 3 blah',
          id: '3'
        },
        {
          title: 'Some article 4 blah',
          id: '4'
        },
      ]
    },
    {
      title: 'Scheduling',
      articles: [
        {
          title: 'Some article 5 blah',
          id: '5'
        },
        {
          title: 'Some article 6 blah',
          id: '6'
        },
      ]
    },
    {
      title: 'Managing your workforce',
      articles: [
        {
          title: 'Some article 7 blah',
          id: '7'
        },
        {
          title: 'Some article 8 blah',
          id: '8'
        },
      ]
    },
    {
      title: 'Messaging',
      articles: [
        {
          title: 'Some article 9 blah',
          id: '9'
        },
        {
          title: 'Some article 10 blah',
          id: '10'
        },
      ]
    }
  ]
}
</script>