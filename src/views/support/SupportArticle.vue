<template lang="pug">

  v-container
    article-view(
      v-if='article'
      :previous-route="{name: 'support'}"
      :title='article.title'
      :description='article.description'
      :image='article'
      :body='article.body'
      :links='links'
    )

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueMarkdown from 'vue-markdown'
import ArticleView from '@/components/ArticleView.vue'
import { getSupportArticle } from '@/services/cms'

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
  loading = false

  async mounted() {
    this.loading = true
    this.article = (await getSupportArticle(this.$store, this.$route.params.articleId))?.attributes
    this.loading = false
  }

  get links() {
    return [
      // TODO: Add tags for related articles
      // {
      //   title: 'Related articles',
      //   links: [
      //     {
      //       label: 'Creating a new job',
      //       to: {
      //         name: 'supportArticle',
      //         params: {
      //           articleId: '1',
      //         },
      //       }
      //     },
      //     {
      //       label: 'Editing an existing job',
      //       to: {
      //         name: 'supportArticle',
      //         params: {
      //           articleId: '2',
      //         },
      //       }
      //     },
      //     {
      //       label: 'Adding shifts to a job',
      //       to: {
      //         name: 'supportArticle',
      //         params: {
      //           articleId: '11',
      //         },
      //       }
      //     },
      //     {
      //       label: 'Editing shifts on a job',
      //       to: {
      //         name: 'supportArticle',
      //         params: {
      //           articleId: '12',
      //         },
      //       }
      //     },
      //   ]
      // },
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
