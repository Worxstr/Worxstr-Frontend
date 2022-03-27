import Vue from 'vue'

type Format = {
  url: string
  ext: string
  hash: string
  mime: string
  name: string
  path: string
  size: number
  width: number
  height: number
}

type S3Image = {
  data: {
    id: number
    attributes: {
      name: string
      alternativeText: string
      caption: string
      width: number
      height: number
      formats: {
        small: Format
        medium: Format
        thumbnail: Format
      }
      hash: string
      ext: string
      mime: string
      size: number
      url: string
      previewUrl: string
      provider: string
      provider_metadata: {
        width: number
        height: number
        fileName: string
      }
      createdAt: string
      updatedAt: string
    }
  }
}

type Social = {
  url: string
  icon: string
}

export type Author = {
  id: number
  attributes: {
    name: string
    title: string
    about: string
    createdAt: string
    updatedAt: string
    photo: S3Image
    socials: Social[]
  }
}

export type BlogPost = {
  id: number
  attributes: {
    title: string
    url_id: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    description: string
    image?: S3Image
    body: any[] // TODO
    authors: {
      data: Author[]
    }
  }
}

export interface BlogState {
  posts: {
    all: string[]
    byId: {
      [key: string]: BlogPost
    }
  }
}

export const initialState = (): BlogState => ({
  posts: {
    all: [],
    byId: {},
  },
})

const mutations = {
  ADD_BLOG_POST(state: BlogState, post: BlogPost) {
    const id = post.attributes.url_id

    Vue.set(state.posts.byId, id, {
      ...state.posts.byId[id],
      ...post,
    })
    if (!state.posts.all.includes(id)) state.posts.all.push(id)
  },
}

const getters = {
  blogPost: (state: BlogState) => (urlId: string) => {
    console.log(urlId, state)
    return state.posts.byId[urlId]
  },

  blogPosts: (state: BlogState) => {
    return state.posts.all.map(id => state.posts.byId[id])
  },
}

export default {
  state: initialState(),
  getters,
  mutations,
}