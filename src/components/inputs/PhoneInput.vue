<template lang="pug">
  v-text-field(
    @input='updateValue'
    :value='raw'
    :rules='rules'
    type="tel"
    maxlength='14'
    label="Phone number"
    dense
    :required='required'
    :color="color"
    :filled="filled"
    :outlined='outlined'
    :disabled='disabled'
    :autofocus='autofocus'
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { phoneRules, phoneRulesOptional } from '@/plugins/inputValidation'

type PhoneObject = {
  countryCode: string;
  areaCode: string;
  phoneNumber: string;
}

@Component
export default class PhoneInput extends Vue {
  @Prop({ type: [Object, String], required: true, default: '' })
  value!: PhoneObject | string | ''

  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly outlined!: boolean
  @Prop({ default: false }) readonly disabled!: boolean
  @Prop({ default: false }) readonly autofocus!: boolean

  rules: Function[] | undefined = phoneRulesOptional

  mounted() {
    if (typeof this.value === 'string' && this.value)
      this.value = this.phoneStringToObject(this.value)
    if (this.required) this.rules = phoneRules
  }

  phoneStringToObject(value: string): PhoneObject {
    if (!value) return { countryCode: '', areaCode: '', phoneNumber: '' }
    value = value.replace(/[^0-9]/g, '')

    const raw = value.replace(/\W/g, '')
    const countryCode = '1'
    const areaCode = raw.slice(0, 3)
    const phoneNumber = raw.slice(3, 10)

    return {
      countryCode,
      areaCode,
      phoneNumber,
    }
  }

  get raw() {
    if (!this.value) return ''
    if (typeof this.value == 'string') {
      this.updateValue(this.value)
      return this.value
    }

    const number1 = this.value.phoneNumber.slice(0, 3)
    const number2 = this.value.phoneNumber.slice(3, 7)

    let formatted = '('
    formatted += this.value.areaCode

    if (this.value.areaCode.length >= 3) formatted += ') '

    formatted += number1

    if (number1.length >= 3) formatted += '-'

    formatted += number2

    return formatted
  }

  updateValue(value: string) {
    this.$emit('input', this.phoneStringToObject(value))
  }
}
</script>
