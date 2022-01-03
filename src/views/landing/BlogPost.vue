<template lang="pug">
v-container.pt-8

  router-link(:to="{name: 'blog'}")
    v-icon.mb-1.mr-1(small) mdi-chevron-left
    span Blog home

  h4.mt-3.text-h4.font-weight-bold.mb-2 {{ blogPost.title }}
  h6.text-body-1.mb-2 {{ blogPost.description }}

  v-list-item.pl-0.mb-4
    v-list-item-avatar
      v-img(:src='blogPost.author.image')
  
    v-list-item-content
      v-list-item-title.text-body-2.font-weight-medium {{ blogPost.author.name }}
      v-list-item-subtitle.text-caption {{ blogPost.date | date('MMM DD, YYYY') }}
  
  v-row
    v-col(cols='12' md='9')
      v-card.soft-shadow
        v-img(v-if='blogPost.image' :src='blogPost.image' max-height='200')
        vue-markdown.pa-8.mb-10(:source='blogPost.content')

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

@Component({
  metaInfo: {
    title: 'Blog post',
  },
  components: {
    VueMarkdown,
  },
})
export default class BlogPost extends Vue {
  
  get blogPost() {
    return this.$store.getters.blogPost(this.$route.params.blogPostId)
  }

}
</script>