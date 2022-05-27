<template lang="pug">
v-sheet
  v-container.py-16
    v-card-text
      vue-markdown.markdown(:source='body')

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VueMarkdown from 'vue-markdown'

@Component({
  components: {
    VueMarkdown
  }
})
export default class RichText extends Vue {
  @Prop({ default: '' }) body!: string
}
</script>
