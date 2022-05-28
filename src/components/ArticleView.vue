<template lang="pug">
.article

  breadcrumbs(:items='breadcrumbs')

  div
    h4.mt-3.text-h4.font-weight-bold.mb-2 {{ title }}
    h6.text-body-1.mb-2 {{ description }}

    v-list-item.pl-0.mb-4
      v-list-item-avatar
        v-img(:src='authorImage')
    
      v-list-item-content
        v-list-item-title.text-body-2.font-weight-medium {{ authorName }}
        v-list-item-subtitle.text-caption {{ date | date('MMM DD, YYYY') }}
    
    v-row
      v-col(cols='12' md='9')
        v-card.soft-shadow
          v-img(v-if='image' :src='image' max-height='400' position='start center')
          div(v-for='section in body' :key='section.id')
            vue-markdown.markdown.pa-8.mb-10(
              v-if='section.__component == "article.blog-post-text"'
              :source='section.content'
            )

      v-col(cols='12' md='3')
        aside(style='position: sticky; top: 100px')
          .mb-3(v-for ='(section, i) in links' :key='i')
            h6.text-h6.mb-4 {{ section.title }}
            .d-flex.flex-column
              router-link.mb-2(
                v-for='(link, j) in section.links'
                :to='link.to'
              ) {{ link.label }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import VueMarkdown from 'vue-markdown'

type Link = {
  title: string
  links: {
    label: string
    to: {
      name: string
      params: object
      [key: string]: any
    }
  }[]
}

@Component({
  components: {
    VueMarkdown,
    Breadcrumbs,
  },
})
export default class ArticleView extends Vue {
  
  @Prop(String) title!: string
  @Prop(String) description!: string
  @Prop(String) authorName!: string
  @Prop(String) authorImage!: string
  @Prop(String) image!: string
  @Prop(String) date!: string
  @Prop(Object) previousRoute!: any
  @Prop(Array) body!: any[]
  @Prop(Array) links!: Link[]

  get breadcrumbs() {
    return [
      {to: this.previousRoute, text: this.previousRoute?.name},
      {text: this.title}
    ]
  }
}
</script>