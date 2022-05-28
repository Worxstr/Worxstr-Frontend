<template lang="pug">
v-container
  article-view(
    v-if='blogPost'
    :previous-route="{name: 'blog'}"
    :title='blogPost.attributes.title'
    :description='blogPost.attributes.description'
    :author-name='blogPost.attributes.authors.data[0].attributes.name'
    :author-image='blogPost.attributes.authors.data[0].attributes.photo.data.attributes.url'
    :date='blogPost.attributes.createdAt'
    :image='blogPost.attributes.image.data.attributes.url'
    :body='blogPost.attributes.body'
    :links='links'
  )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VueMarkdown from 'vue-markdown'
import { getBlogPost } from '@/services/cms'
import ArticleView from '@/components/ArticleView.vue'

@Component({
  components: {
    VueMarkdown,
    ArticleView,
  },
})
export default class BlogPost extends Vue {

  loadingPost = false

  async mounted() {
    this.loadingPost = true
    await getBlogPost(this.$store, this.$route.params.blogPostId)
    this.loadingPost = false
  }

  metaInfo() {
    return {
      title: this.blogPost ? `${this.blogPost?.attributes.title} | Blog` : 'Blog post',
    }
  }

  get blogPost() {
    return this.$store.getters.blogPost(this.$route.params.blogPostId)
  }

  get links() {
    return [
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