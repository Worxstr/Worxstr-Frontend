<template lang="pug">
div
  v-sheet.gradient.overlap
    v-container.py-16
      h3.text-h3.font-weight-bold.mb-8 Support
      

  v-container.shift-down
    v-autocomplete.support-search(
      solo
      autofocus
      auto-select-first
      clearable
      placeholder='Search for help...'
      :items='allArticles'
      item-text='title'
      style='max-width: 600px'
      return-object
      @change='openArticle'
    )

    v-card.mt-2
      v-card-title Browse articles

      v-expansion-panels(accordion flat)
        v-expansion-panel(v-for='(category, i) in categories' :index='i')
          v-divider
          v-expansion-panel-header {{ category.title }}
          v-expansion-panel-content
            ul
              li.mb-2(v-for='article in category.articles' :index='article.id')
                router-link(:to="{name: 'supportArticle', params: {articleId: article.id}}") {{ article.title }} 

    .mt-12
      h4.text-h4.font-weight-black.mb-3 Can't find what you need?
      p
        router-link(:to="{name: 'contact'}") &nbsp;Contact us&nbsp;
        | for personalized help and assistance.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  metaInfo: {
    title: 'Support',
  }
})
export default class Support extends Vue {
  categories = [
    {
      title: 'Jobs',
      articles: [
        {
          title: 'Creating a new job',
          id: '1',
        },
        {
          title: 'Editing an existing job',
          id: '2',
        },
        {
          title: 'Adding shifts to a job',
          id: '11',
        },
        {
          title: 'Editing shifts on a job',
          id: '12',
        },
      ],
    },
    {
      title: 'Payments',
      articles: [
        {
          title: 'Approving and denying timecards',
          id: '3',
        },
        {
          title: 'Payouts',
          id: '4',
        },
      ],
    },
    {
      title: 'Scheduling',
      articles: [
        {
          title: 'Viewing your schedule',
          id: '5',
        },
      ],
    },
    {
      title: 'Managing your workforce',
      articles: [
        {
          title: 'Adding a contractor',
          id: '6',
        },
        {
          title: 'Adding a manager',
          id: '7',
        },
        {
          title: 'Viewing your workforce members',
          id: '8',
        },
      ],
    },
    {
      title: 'Messaging',
      articles: [
        {
          title: 'Creating a direct or group message',
          id: '9',
        },
        {
          title: 'Sending messages',
          id: '10',
        },
      ],
    },
  ]

  openArticle(article) {
    this.$router.push({ name: 'supportArticle', params: { articleId: article.id }})
  }

  get allArticles() {
    return this.categories
      .map((c) => c.articles)
      .reduce((a, b) => a.concat(b), [])
  }
}
</script>
