/* eslint-disable @typescript-eslint/camelcase */

import { BlogPost } from '@/store/blog'
import { cms } from '@/util/axios'

type blogPostsResponse = {
  data: BlogPost[]
}

export async function getBlogPosts({ commit }: any) {
  const { data } = await cms.get<blogPostsResponse>('/blog-posts', {
    params: {
      populate: 'authors,image,authors.photo',
    },
  })
  data.data.forEach(post => {
    commit('ADD_BLOG_POST', post)
  })
}

export async function getBlogPost({ commit }: any, urlId: string) {
  const { data } = await cms.get<blogPostsResponse>('/blog-posts', {
    params: {
      populate: 'authors,image,body,authors.photo',
      'filters[url_id][$eq]': urlId,
    },
  })
  commit('ADD_BLOG_POST', data.data[0])
}

export async function getTeamMembers() {
  const { data } = await cms.get<blogPostsResponse>('/members', {
    params: {
      populate: 'photo,socials'
    },
  })
  return data.data
}