<template lang="pug">
  v-text-field(
    type="datetime-local"
    @input='updateValue'
    dense
    :value='raw'
    :label="label"
    :required='required'
    :color="color"
    :filled="filled"
    :outlined='outlined'
    :hide-details='hideDetails'
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
  @Prop(String) readonly color: string | undefined
  @Prop(String) readonly label: string | undefined
  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly outlined!: boolean
  @Prop({ default: false }) readonly hideDetails!: boolean


  get raw() {
    return dayjs(this.value).format('YYYY-MM-DDTHH:mm')
  }

  updateValue(value: string) {
    if (!value) return
    this.$emit('input', dayjs(value).utc().format('YYYY-MM-DDTHH:mm:ssZ'))
  }
}
</script>
