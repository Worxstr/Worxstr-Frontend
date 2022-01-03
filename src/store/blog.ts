export type BlogPost = {
  id: string
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
      id: 'release-0.3',
      title: 'Release 0.3',
      description: "We're bringing you recurring scheduling and some new ways to describe your job's details.",
      image: 'https://i.imgur.com/KSy5lel.png',
      date: '2021-12-27',
      author: {
        name: 'Alex Wohlbruck',
        image: require('@/assets/images/team/alex.jpg'),
      },
      content: `### 0.3.0\nThis release is loaded with updates specifically for Karen Tonks of Time Genies, for which she requested many of these features.\n\n- Managers can now add rich text notes to jobs and shifts.\n- Assigned shifts can now include a task list, where the contractor can complete tasks while on the job and report those times completed to their manager.\n- The clock page has been redesigned as a dashboard, which will get more functionality in the future. Contractors can now see all their upcoming shifts, and there is a new shift detail page where you can see all the information for a shift.\n- Shifts can now be assigned with a recurring rule, so managers can batch-assign shifts for multiple days at a time.\n- Various bug fixes and UI enhancements\n <br>\n### 0.3.1\nWe are introducing more features for our schedule page, as well as a new blog page on the landing site, which you're reading now!\n\n- You can now click and drag to create a shift on the schedule.\n- You can drag events on the schedule to move them.\n- You can extend or shrink shifts on the schedule by clicking and dragging on the bottom edge.\n- You can duplicate a shift by right-clicking on it.\n- The schedule page now includes a title which shows the month(s) you are viewing.`,
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