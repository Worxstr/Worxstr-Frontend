<template lang="pug">
div
  //- v-model='value'
  v-text-field(
    v-model='value'
    v-mask="short ? '####' : '###-##-####'"
    type='tel'
    :label="short ? 'SSN (Last 4 digits)' : 'Full SSN'"
    :placeholder="short ? '1234' : '123-45-6789'"
    maxlength='11'
    :rules='allRules'
    required
    outlined
    dense
  )
</template>

<script lang="ts">
import { shortSsnRules, ssnRules } from '@/util/inputValidation'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component
export default class SsnInput extends Vue {
  @Prop({ type: String }) initialValue!: string
  @Prop({ default: false }) short!: boolean
  @Prop({ type: String }) label!: string
  @Prop({ type: Boolean }) hideDetails!: boolean
  @Prop({ type: Boolean, default: true }) required!: boolean

  value = ''

  @Watch('value')
  onValueChange(newValue: string) {
    this.$emit('input', newValue)
  }

  get allRules() {
    return this.short ? shortSsnRules : ssnRules
  }
}
</script>