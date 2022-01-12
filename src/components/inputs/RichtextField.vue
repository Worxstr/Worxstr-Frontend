<template lang="pug">
tiptap-vuetify(
  v-bind='$attrs'
  :value='value'
  @input="input"
  :extensions='tiptapExtensions'
  :toolbar-attributes="{ color: $vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-4' }"
  :card-props="{ flat: true, outlined: true}"
)
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from 'tiptap-vuetify'

@Component({
  components: {
    TiptapVuetify,
  }
})
export default class RichtextField extends Vue {

  @Prop({ type: String, required: true }) readonly value?: string

  input(value: string) {
    this.$emit('input', value)
  }

  tiptapExtensions = [
    History,
    Blockquote,
    Link,
    Underline,
    Strike,
    Italic,
    Bold,
    Code,
    ListItem,
    BulletList,
    OrderedList,
    [Heading, {
      options: {
        levels: [1, 2, 3]
      }
    }],
    Paragraph,
    HorizontalRule,
    HardBreak
  ]
}
</script>