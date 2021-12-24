<template lang="pug">
  v-text-field(
    type="datetime-local"
    @input='updateValue'
    dense
    :value='raw'
    v-bind='attrsModified'
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

@Component
export default class DatetimeInput extends Vue {

  @Prop({ type: [String, Date], required: true }) readonly value?: string | Date

  get raw() {
    return dayjs(this.value).format('YYYY-MM-DDTHH:mm')
  }

  get attrsModified() {
    const attrs = this.$attrs
    delete attrs['data-cy']
    return attrs
  }

  updateValue(value: string) {
    if (!value) return
    this.$emit('input', dayjs(value).utc().format('YYYY-MM-DDTHH:mm:ssZ'))
  }
}
</script>
