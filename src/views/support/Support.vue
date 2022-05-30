<template lang="pug">
div
  v-sheet.gradient-secondary.overlap
    v-container.py-16
      h3.text-h3.font-weight-black.mb-8 Support
      

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

    v-card.mt-2.soft-shadow
      v-card-title.text-h6 Browse support topics

      v-expansion-panels(accordion flat)
        v-expansion-panel(v-for='(topic, i) in topics' :key='i')
          v-divider
          v-expansion-panel-header {{ topic.attributes.name | snakeToSpace | capitalize }}
          v-expansion-panel-content
            .d-flex.flex-column
              router-link.mb-2(
                v-for='(article, i) in topic.attributes.support_articles.data'
                :key='i'
                :index='article.id'
                :to="{name: 'supportArticle', params: {articleId: article.attributes.url_id}}"
              ) {{ article.attributes.title }} 

    .mt-12
      h4.text-h4.font-weight-black.mb-3 Can't find what you need?
      p
        router-link(:to="{name: 'contact'}") &nbsp;Contact us&nbsp;
        | for personalized help and assistance.
</template>

<script lang="ts">
import { getSupportTopics } from '@/services/cms'
import { Component, Vue } from 'vue-property-decorator'

type SupportArticle = {
  id: number
  attributes: {
    title: string
    description: string
    url_id: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    [key: string]: any
  }
}

type Topic = {
  id: number
  attributes: {
    name: string
    createdAt: string
    updatedAt: string
    is_topic: boolean
    support_articles: {
      data: SupportArticle
    }
  }
}

@Component({
  metaInfo: {
    title: 'Support',
  },
})
export default class Support extends Vue {

  loading = false
  topics: Topic[] = []

  async mounted() {
    this.loading = true
    this.topics = await getSupportTopics()
    this.loading = false
  }

  openArticle(article: SupportArticle) {
    this.$router.push({ name: 'supportArticle', params: { articleId: article.id }})
  }
}
</script>
