export type Post = {
  id: '0.3.0'
  title: string
  description: string
  image: string
  date: string
  author: {
    name: string
    image: string
  }
}

export interface BlogState {
  posts: Post[]
}

export const initialState = (): BlogState => ({
  posts: [
    {
      title: 'Release 0.3',
      description: "We're bringing you recurring scheduling and some new ways to describe your job's details.",
      image: 'https://i.imgur.com/pydrhMZ.png',
      date: '2021-12-27',
      author: {
        name: 'Alex Wohlbruck',
        image: require('@/assets/images/team/alex.jpg'),
      },
    }
  ]
})

const mutations = {
}

export default {
  state: initialState(),
  mutations,
}