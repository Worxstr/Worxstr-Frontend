<template lang="pug">

v-carousel(v-model='model')
  v-carousel-item(v-for='(item, i) in items' :key='i' :src='item.src')

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

type item = {
  src: string
  caption: string
}

@Component
export default class Carousel extends Vue {
  
  @Prop ({ type: Array }) items!: item[]

  model = 0

}
</script>