<template lang="pug">
  v-text-field(
    :value="phoneString",
    @input="updatePhone"
    :rules='rules'
    type="tel",
    label="Phone number",
    v-mask="'(###) ###-####'",
    dense,
    :required='required',
    :color="color",
    :filled="filled"
    :outlined='outlined',
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { phoneRules } from '@/plugins/inputValidation'

@Component
export default class PhoneInput extends Vue {

  @Prop({ type: String, required: true, }) readonly value!: string
  @Prop(String) readonly color: string | undefined
  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly outlined!: boolean

  rules = phoneRules

  get phoneString() {
    return this.value
  }

  updatePhone(value: string) {
    if (!value) return
    this.$emit('input', value)
  }
}
</script>
