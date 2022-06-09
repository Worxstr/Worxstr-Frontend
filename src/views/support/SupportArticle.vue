<template lang="pug">

  v-container
    article-view(
      v-if='article'
      :previous-route="{name: 'support'}"
      :title='article.title'
      :description='article.description'
      :body='article.body'
      :links='links'
    )

</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import VueMarkdown from 'vue-markdown'
import ArticleView from '@/components/ArticleView.vue'
import { getSupportArticle, getSupportTag } from '@/services/cms'

@Component({
  components: {
    VueMarkdown,
    ArticleView,
  },
})
export default class SupportArticle extends Vue {
  
  metaInfo() {
    return {
      title: this.article?.title || 'Support',
    }
  }

  article: any = null
  related: any = []
  loading = false

  @Watch('$route.params.articleId')
  onArticleIdChange() {
    this.init()
  }

  mounted() {
    this.init()
  }

  async init() {
    this.loading = true
    this.article = (await getSupportArticle(this.$route.params.articleId))?.attributes
    this.loading = false
    this.related = await getSupportTag(this.article?.support_tags?.data[0].id)
  }

  get links() {
    const tags = this.related?.attributes?.support_articles?.data.map((article: any) => {
      return {
        label: article.attributes.title,
        to: {
          name: 'supportArticle',
          params: {
            articleId: article.attributes.url_id,
          }
        },
      }
    }) || []

    return [
      // TODO: Add tags for related articles
      {
        title: 'Related articles',
        links: tags,
      },
      {
        title: 'More resources',
        links: [
          {
            label: 'Contact us',
            to: { name: 'contact' },
          },
          {
            label: 'Pricing',
            to: { name: 'pricing' },
          },
        ],
      },
    ]
  }
}
</script>
