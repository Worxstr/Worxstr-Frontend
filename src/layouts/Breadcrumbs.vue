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
        const paramMap = this.$route.meta?.paramMap
        // Extract the param name
        const param = matched[i].replace(':', '')

        // Get the path in the state of the object
        const defaultStatePath = segments[0]
        const customStatePath = paramMap[param]?.split('.') // Split the param map into an array of the nested state keys

        // Find the item in the store state
        let item = this.$store.state
        if (customStatePath) {
          // A custom path in the store was defined, ex. 'messages.conversations'
          customStatePath.forEach((key: string) => {
            item = item[key]
          })
        }
        else {
          // Use the first name in the path
          item = item[defaultStatePath]
        }
        item = item.byId[pathSegment]

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