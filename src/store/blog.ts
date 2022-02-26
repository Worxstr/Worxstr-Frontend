export type BlogPost = {
  id: string
  title: string
  description: string
  image?: string
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
      id: 'release-0.4',
      title: 'Payments release (0.4)',
      description: 'Payments are getting a big update! Invoicing, data exporting, 2FA, and more coming soon.',
      image: 'https://i.imgur.com/2ihwZDf.png',
      date: '2022-02-07',
      author: {
        name: 'Alex Wohlbruck',
        image: require('@/assets/images/team/alex.jpg'),
      },
      content: '### 0.4.0\n- Shift lists now support multiselect for deleting batch shifts\n- Contractors can now create invoice payments to be approved by their managers.\n- Payments now have detailed standalone page where users can see all information related to a payment and its invoice item list.\n- Payments view now loads much faster.\n- Payment data can be exported as a file in CSV or JSON format.\n<br>'
    },
    {
      id: 'release-0.3',
      title: 'Scheduling release (0.3)',
      description: "We're bringing you recurring shifts, enhanced scheduling, and more!",
      image: 'https://i.imgur.com/KSy5lel.png',
      date: '2021-12-27',
      author: {
        name: 'Alex Wohlbruck',
        image: require('@/assets/images/team/alex.jpg'),
      },
      content: `### 0.3.0\n- Managers can now add rich text notes to jobs and shifts.\n- Assigned shifts can now include a task list, where the contractor can complete tasks while on the job and report those times completed to their manager.\n- The clock page has been redesigned as a dashboard, which will get more functionality in the future. Contractors can now see all their upcoming shifts, and there is a new shift detail page where you can see all the information for a shift.\n- Shifts can now be assigned with a recurring rule, so managers can batch-assign shifts for multiple days at a time.\n<br>\n### 0.3.1\nWe are introducing more features for our schedule page, as well as a new blog page on the landing site, which you're reading now!\n- You can now click and drag to create a shift on the schedule.\n- You can drag events on the schedule to move them.\n- You can extend or shrink shifts on the schedule by clicking and dragging on the bottom edge.\n- You can duplicate a shift by right-clicking on it.\n- The schedule page now includes a title which shows the month(s) you are viewing.\n<br>\n### 0.3.2\n- Push notification support is being tested.\n- Geolocation data is reported when the users loads job detail page.\n- Managers will be able to view contractor locations on the map from the job detail or user detail views.\n- Support form has been fixed.\n- Shift detail page now counts the time clocked in, and shows start and end times for the shift.\n<br>\n### 0.3.3\n- Schedule UI has been improved on mobile layouts.\n- A job's location can now be moved on the map for fine-tuning of the geofence.\n- Managers can now refresh a job's clock-in code.\n- Funding sources that are not supported by Plaid can now be added using micro-deposit verification.\n- You can now choose from any of 3 different ways to restrict clocking in to a job:\n  1. By location - the contractor must be at the job site.\n  2. By code - the contractor must enter the clock-in code.\n  3. By time - the current time must be within the scheduled time, plus a grace period window defined by the manager.\n- More push notification events have been added.\n- Schedule now has a month overview on the left panel.\n- Location will now only be reported when users are clocked in.\n- Lots of bug fixes, preparing for next release.`,
    },
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