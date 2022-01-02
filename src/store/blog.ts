export type BlogPost = {
  id: '0.3.0'
  title: string
  description: string
  image: string
  date: string
  author: {
    name: string
    image: string
  }
  content: string
}

export interface BlogState {
  posts: BlogPost[]
}

export const initialState = (): BlogState => ({
  posts: [
    {
      id: '0.3.0',
      title: 'Release 0.3.0',
      description: "We're bringing you recurring scheduling and some new ways to describe your job's details.",
      image: 'https://i.imgur.com/KSy5lel.png',
      date: '2021-12-27',
      author: {
        name: 'Alex Wohlbruck',
        image: require('@/assets/images/team/alex.jpg'),
      },
      content: 'This release is loaded with updates specifically for Karen Tonks of Time Genies, for which she requested many of these features.\n- Managers can now add rich text notes to jobs and shifts.\n- Assigned shifts can now include a task list, where the contractor can complete tasks while on the job and report those times completed to their manager.\n- The clock page has been redesigned as a dashboard, which will get more functionality in the future. Contractors can now see all their upcoming shifts, and there is a new shift detail page where you can see all the information for a shift.\n- Shifts can now be assigned with a recurring rule, so managers can batch-assign shifts for multiple days at a time.\n- Various bug fixes and UI enhancements',
    }
  ]
})

const getters = {
  blogPost: (state: BlogState) => (blogPostId: string) => {
    return state.posts.find((post: BlogPost) => post.id === blogPostId)
  },
}

export default {
  state: initialState(),
  getters,
}