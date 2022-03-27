<template lang="pug">
v-container.pt-8

  router-link(:to="{name: 'blog'}")
    v-icon.mb-1.mr-1(small) mdi-chevron-left
    span Blog home

  div(v-if='blogPost')
    h4.mt-3.text-h4.font-weight-bold.mb-2 {{ blogPost.attributes.title }}
    h6.text-body-1.mb-2 {{ blogPost.attributes.description }}

    v-list-item.pl-0.mb-4
      v-list-item-avatar
        v-img(:src='blogPost.attributes.authors.data[0].attributes.photo.data.attributes.url')
    
      v-list-item-content
        v-list-item-title.text-body-2.font-weight-medium {{ blogPost.attributes.authors.data[0].attributes.name }}
        v-list-item-subtitle.text-caption {{ blogPost.date | date('MMM DD, YYYY') }}
    
    v-row
      v-col(cols='12' md='9')
        v-card.soft-shadow
          v-img(v-if='blogPost.attributes.image' :src='blogPost.attributes.image.data.attributes.url' max-height='400' position='start center')
          
          div(v-for='section in blogPost.attributes.body' :key='section.id')
            vue-markdown.pa-8.mb-10(:source='section.content')

      v-col(cols='12' md='3')
        aside(style='position: sticky; top: 100px')
          .mb-3           
            h6.text-h6.mb-4 More resources
            .d-flex.flex-column
              router-link.mb-2(:to="{name: 'contact'}") Contact us
              router-link.mb-2(:to="{name: 'pricing'}") Pricing
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VueMarkdown from 'vue-markdown'
import { getBlogPost } from '@/services/cms'

@Component({
  components: {
    VueMarkdown,
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

}
</script>