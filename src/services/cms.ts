/* eslint-disable @typescript-eslint/camelcase */

import { cms } from '@/util/axios'
import qs from 'qs'

type strapiResponse = {
  data: any
}

export async function getMenuItems() {
  const { data } = await cms.get<strapiResponse>('/menus', {
    params: {
      populate: '*',
    }
  })
  return data.data
}

export async function getBlogPosts({ commit }: any) {
  const { data } = await cms.get<strapiResponse>('/blog-posts', {
    params: {
      populate: 'authors,image,authors.photo',
    },
  })
  data.data.forEach((post: any) => {
    commit('ADD_BLOG_POST', post)
  })
}

export async function getBlogPost({ commit }: any, urlId: string) {
  const { data } = await cms.get<strapiResponse>('/blog-posts', {
    params: {
      populate: 'authors,image,body,authors.photo',
      'filters[url_id][$eq]': urlId,
    },
  })
  commit('ADD_BLOG_POST', data.data[0])
}

export async function getSupportTopics() {
  const { data } = await cms.get<strapiResponse>('/support-tags', {
    params: {
      populate: '*',
    },
  })
  return data.data
  // TODO: Add to store
}

export async function getSupportTag(tagId: string) {
  const { data } = await cms.get<strapiResponse>(`/support-tags/${tagId}`, {
    params: {
      populate: '*',
    },
  })
  // TODO: Add to store
  return data.data
}

export async function getSupportArticle(urlId: string) {
  const { data } = await cms.get<strapiResponse>('/support-articles', {
    params: {
      populate: '*',
      'filters[url_id][$eq]': urlId,
    },
  })
  return data.data[0]
  // TODO: Add to store
  // commit('ADD_SUPPORT_ARTICLE', data.data[0])
}

export async function searchSupportArticles(query: string) {
  const q = !query ? '' : qs.stringify({
    filters: {
      $or: [
        {
          title: {
            $containsi: query,
          },
        },
        {
          description: {
            $containsi: query,
          },
        },
      ],
    },
  }, {
    encodeValuesOnly: true,
  })
  const { data } = await cms.get<strapiResponse>(`/support-articles?${q}`)
  // TODO: Add to store
  return data.data
}

export async function getSupportArticles({ commit }: any) {
  const { data } = await cms.get<strapiResponse>('/support-articles', {
    params: {
      populate: 'authors,image,body,authors.photo',
    },
  })
  return data.data
  // TODO: Add to store
  // data.data.forEach((article: any) => {
  //   commit('ADD_SUPPORT_ARTICLE', article)
  // })
}

export async function getTeamMembers() {
  const { data } = await cms.get<strapiResponse>('/members', {
    params: {
      populate: 'photo,socials',
      sort: 'id',
    },
  })
  // TODO: Add to store
  return data.data
}

export async function getFeature(featureId: string) {
  const { data } = await cms.get<strapiResponse>('/features', {
    params: {
      'filters[url_id][$eq]': featureId,
      populate: 'body.image,body.authorImage,body.featureListItems,body.carouselItems,body.carouselItems.image',
    },
  })
  // TODO: Add to store
  return data?.data[0]?.attributes
}

export async function getIndustry(industryId: string) {
  const { data } = await cms.get<strapiResponse>('/industries', {
    params: {
      'filters[url_id][$eq]': industryId,
      populate: 'body.image,body.authorImage,body.featureListItems,body.carouselItems,body.carouselItems.image',
    },
  })
  // TODO: Add to store
  return data?.data[0]?.attributes
}