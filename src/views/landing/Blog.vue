<template lang="pug">
v-container.d-flex.flex-column.gap-medium.py-12

  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0')

  //- What is Worxstr?
  .d-flex.flex-column.justify-center.align-center
    h3.text-h3.font-weight-black.mb-4 The Worxstr Blog
    p Find out about the latest updates from Worxstr here. We post about new features, version updates, and news.

  v-row
    v-col(
      v-for='post in posts'
      :key='post.id'
      cols='12'
      md='6'
      lg='4'
      xl='3'
    )
      v-card.soft-shadow(:to="{name: 'blogPost', params: {blogPostId: post.attributes.url_id}}")
        v-img(v-if='post.attributes.image' :src='post.attributes.image.data.attributes.url')
        
        v-card-title.text-h6.font-weight-black {{ post.attributes.title }}

        v-card-text {{ post.attributes.description }}
    
        v-card-actions
          v-list-item.pl-2
            v-list-item-avatar
              v-img(:src='post.attributes.authors.data[0].attributes.photo.data.attributes.url')
          
            v-list-item-content
              v-list-item-title.text-body-2.font-weight-medium
                span(v-if='post.attributes.authors.data.length == 1') {{ post.attributes.authors.data[0].attributes.name }}
                span(v-else) {{ post.attributes.authors.data.map(author => author.attributes.name).join(', ') }}
              v-list-item-subtitle.text-caption {{ post.attributes.createdAt | date('MMM DD, YYYY') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'
import { getBlogPosts } from '@/services/cms'

@Component({
  metaInfo: {
    title: 'Blog',
  },
  components: {
    Arrows
  },
})
export default class Blog extends Vue {
  
  loadingPosts = true

  async mounted() {
    this.loadingPosts = true
    await getBlogPosts(this.$store)
    this.loadingPosts = false
  }

  get posts() {
    return this.$store.getters.blogPosts
  }

}
</script>