<template lang="pug">
  v-text-field(
    type="datetime-local"
    @input='updateValue'
    dense
    :value='raw'
    v-bind='$attrs'
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

  updateValue(value: string) {
    if (!value) return
    this.$emit('input', dayjs(value).utc().format('YYYY-MM-DDTHH:mm:ssZ'))
  }
}
</script>
