<template lang="pug">
  v-breadcrumbs.py-0.pl-1(
    :items="breadcrumbs",
    large,
    v-if="!$route.meta.landing"
  )
    template(v-slot:item="{ item }")
      v-breadcrumbs-item(:to="item.to", exact :class="$vuetify.theme.dark ? 'white-text' : ''")
        | {{ item.text | capitalize }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Breadcrumbs extends Vue {
  get breadcrumbs() {

    /* This generates breadcrumbs for the toolbar dynamically
       The route path is used to generate these.
       If a route path contains a parameter, ie. /jobs/:jobId, then
       the route metadata can be used to map the parameter name to an item
       in the store state. For example, the metadata
       meta: {
         paramMap: {
           jobId: 'jobs',
           prop: 'name'
         }
       }
       will replace the :jobId param with the 'name' property of the job in state.jobs
       that matches the id given.
       paramMap can also contain a prop 'propBuilder' that will specify how to build
       the text string
    */

    const segments = this.$route.path
      .replace('/', '')
      .split('/')

    const matched = this.$route.matched[this.$route.matched.length - 1].path
      .replace('/', '')
      .split('/')

    return segments.map((pathSegment, i) => {
      let dynamicName
      try {
        // Get param mapping from route metadata
        const paramMap = this.$route.meta.paramMap
        // Extract the param name
        const param = matched[i].replace(':', '')
        // Find the item in the store state
        const item = this.$store.state[paramMap[param] || segments[0]].byId[pathSegment]
        // Use the specified prop or propBuilder to get the name of the object
        dynamicName = paramMap.propBuilder ? paramMap.propBuilder(item) : item[paramMap.prop || 'name']
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