<template lang="pug">
v-breadcrumbs.nav-breadcrumbs.pl-1.d-flex.flex-nowrap(
  :items="breadcrumbs",
  large,
  v-if="!$route.meta.landing"
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
import { Component, Vue } from 'vue-property-decorator'

// Find a nested object by dot-syntax string
// ex. lookup(obj, 'a.b.c') => obj.a.b.c
function lookup(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined
  }, obj)
}

@Component
export default class Breadcrumbs extends Vue {
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

      return {
        text: matched[i]?.includes(':') ? dynamicName : pathSegment,
        to: '/' + segments.slice(0, i + 1).join('/'),
      }
    })
  }
}
</script>

<style lang="scss">
.nav-breadcrumbs {
  overflow: hidden;
  
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