<template lang="pug">
v-sheet(:color='color')
  v-container.py-16.text-center.text-sm-start
    h4.text-h4.mb-8.font-weight-black {{ title }}

    v-row.d-flex
      v-col.d-flex.flex-column.gap-xs.align-sm-start(
        v-for='(feature, i) in features'
        :cols='cols'
        :sm='sm'
        :md='md'
        :lg='lg'
        :xl='xl'
      )
        v-icon(size='35' :color='feature.iconColor || iconColor || "accent"')
          | {{ feature.icon }}
        h6.text-h6 {{ feature.title }}
        p.body-1 {{ feature.description }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

type Feature = {
  icon: string
  title: string
  description?: string
  iconColor?: string
}

@Component
export default class FeatureList extends Vue {
  
  @Prop ({ type: String }) title!: string
  @Prop ({ type: Array }) features!: Feature[]
  @Prop ({ type: String }) color!: string
  @Prop ({ type: String }) iconColor?: string

  // xs screen column span
  get cols() {
    return 12
  }

  // sm screen column span
  get sm() {
    switch (this.features.length) {
      case 1:
        return 12
      case 2:
        return 6
      case 3:
      default:
        return 4
    }
  }

  // md screen column span
  get md() {
    switch (this.features.length) {
      case 1:
        return 12
      case 2:
        return 6
      case 3:
        return 4
      case 4:
        return 3
      default:
        return 2
    }
  }

  get lg() {
    switch (this.features.length) {
      case 1:
        return 12
      case 2:
        return 6
      case 3:
        return 4
      case 4:
        return 3
      case 6:
        default:
        return 2
    }
  }

  get xl() {
    switch (this.features.length) {
      case 1:
        return 12
      case 2:
        return 6
      case 3:
        return 4
      case 4:
        return 3
      case 6:
        return 2
      default:
        return 1
    }
  }
}
</script>