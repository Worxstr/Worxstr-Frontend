<template lang="pug">
v-container.d-flex.flex-column.gap-medium.py-12

  arrows(type='smallGroup' style='position: absolute; bottom: 0; right: 0')

  //- What is Worxstr?
  v-sheet
    .d-flex.flex-column.justify-center.align-center
      h3.text-h3.font-weight-black.mb-8 The Worxstr Blog
      p Find out about the latest updates from Worxstr here. We post about new features, version updates, and news.

  v-row
    v-col(
      v-for='(post, i) in posts'
      :key='i'
      cols='12'
      md='6'
      lg='4'
      xl='3'
    )
      v-card.soft-shadow
        v-img(v-if='post.image' :src='post.image')
        
        v-card-title.text-h6.font-weight-black
          router-link(:to="{name: 'blogPost', params: {blogPostId: post.id}}")
            | {{ post.title }}

        v-card-text {{ post.description }}
    
        v-card-actions
          v-list-item.grow
            v-list-item-avatar
              v-img(:src='post.author.image')
          
            v-list-item-content
              v-list-item-title.text-body-2.font-weight-medium {{ post.author.name }}
              v-list-item-subtitle.text-caption {{ post.date | date('MMM DD, YYYY') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'

@Component({
  metaInfo: {
    title: 'Blog',
  },
  components: {
    Arrows
  },
})
export default class Blog extends Vue {
  
  get posts() {
    return this.$store.state.blog.posts
  }

}
</script>