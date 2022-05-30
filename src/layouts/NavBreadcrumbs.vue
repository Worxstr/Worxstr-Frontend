<template lang="pug">
v-breadcrumbs.nav-breadcrumbs.pl-1.d-flex.flex-nowrap(
  :items="breadcrumbs",
  large,
  v-if="!$route.meta.landing"
  ref='scrollContainer'
)
  template(v-slot:item="{ item }")
    v-breadcrumbs-item.subtitle-1.font-weight-medium(
      :to="item.to",
      exact,
      :class="$vuetify.theme.dark ? 'white-text' : ''"
    )
      | {{ item.text | capitalize }}
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { lookup } from '@/util/helpers'

@Component
export default class Breadcrumbs extends Vue {

  @Watch('breadcrumbs')
  breadcrumbsChanged(newVal: any, oldVal: any) {
    // Scroll to right of container automatically
    const container: any = this.$refs.scrollContainer
    if (container?.$el)
      container.$el.scrollLeft = container.$el.scrollWidth
  }

  get breadcrumbs() {

    /* This generates breadcrumbs for the toolbar dynamically
       The route path is used to generate these.
       If a route path contains a parameter, ie. /jobs/:jobId, then
       the route metadata can be used to map the parameter name to an item
       in the store state. For example, the metadata
       meta: {
         paramMap: [{
           param: 'jobId',
           store: 'jobs',
           prop: 'name'
         }]
       }
       will replace the :jobId param with the 'name' property of the job in state.jobs
       that matches the id given.
       paramMap can also contain a prop 'propBuilder' that will specify how to build
       the text string
    */
   
    // ex. ['jobs', '114']
    const segments = this.$route.path
      .replace('/', '')
      .split('/')

    // ex. ['jobs', ':jobId]
    const matched = this.$route.matched[this.$route.matched.length - 1].path
      .replace('/', '')
      .split('/')

    return segments.map((pathSegment, i) => {

      let dynamicName
      try {
        // Extract the param name
        // ex. jobId
        const param = matched[i].replace(':', '')
        
        // Get param mapping from route metadata
        // ex. { param: 'jobId', store: 'jobs', prop: 'name' }
        const paramMap = this.$route.meta?.paramMap.find((m: any) => m.param === param)

        // Find the item in the store state
        const item = lookup(this.$store.state, paramMap.store)
          .byId[this.$route.params[param]]

        // Use the specified prop or propBuilder to get the name of the object
        dynamicName = paramMap.propBuilder
          ? paramMap.propBuilder(item)
          : lookup(item, paramMap.prop || 'name')
      }
      catch (e) {
        dynamicName = pathSegment
      }


      // Build link text and path
      const text = matched[i]?.includes(':') ? dynamicName : pathSegment
      const to = '/' + segments.slice(0, i + 1).join('/')

      // Check if the link exists. If not, we only send back the text with no link
      const link = this.$router.resolve(to)
      const hasActiveRoute = link?.resolved?.name !== 'notFound'
      const linkDisabled = link.route?.meta?.disableBreadcrumbs?.includes(text) || false

      if (hasActiveRoute && !linkDisabled) {
        return { text, to }
      }
      return { text }
    })
  }
}
</script>

<style lang="scss">
.nav-breadcrumbs {
  overflow-y: hidden;
  overflow-x: auto;
  
  li {
    white-space: nowrap;
  }
  .v-breadcrumbs__item--disabled {
    color: black !important;
  }
  .white-text .v-breadcrumbs__item--disabled {
    color: white !important;
  }
}
</style>