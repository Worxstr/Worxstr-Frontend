<template lang="pug">
  v-text-field(
    @input='updateValue'
    :value='raw'
    :rules='rules'
    type="tel",
    maxlength='14'
    label="Phone number",
    dense,
    :required='required',
    :color="color",
    :filled="filled"
    :outlined='outlined',
    :disabled='disabled'
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { phoneRules, phoneRulesOptional } from '@/plugins/inputValidation'

@Component
export default class PhoneInput extends Vue {

  @Prop({ type: Object, required: true, default: '' }) readonly value?: {
    countryCode: string;
    areaCode: string;
    phoneNumber: string;
  } | ''

  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly outlined!: boolean
  @Prop({ default: false }) readonly disabled!: boolean

  rules: any = phoneRulesOptional

  mounted() {
    if (this.required) this.rules = phoneRules
  }

  get raw() {
    if (!this.value) return ''
    const number1 = this.value.phoneNumber.slice(0,3)
    const number2 = this.value.phoneNumber.slice(3,7)

    let formatted = '('
    formatted += this.value.areaCode
    if (this.value.areaCode.length >= 3) formatted += ') '
    formatted += number1
    if (number1.length >= 3) formatted += '-'
    formatted += number2

    return formatted
  }

  updateValue(value: string) {
    if (!value) return
    
    const raw = value.replace(/\W/g, '')
    const countryCode = '1'
    const areaCode = raw.slice(0,3)
    const phoneNumber = raw.slice(3,10)

    this.$emit('input', {
      countryCode, areaCode, phoneNumber
    })
  }
}
</script>
