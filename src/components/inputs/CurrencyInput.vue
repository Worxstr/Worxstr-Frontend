<template lang="pug">
  v-text-field.text-h5(
    @input='updateValue'
    @keydown='keydown'
    @focus='focus'
    :value='rawValue'
    :rules='rules'
    ref='input'
    type='text'
    prefix='$'

    :required='required'
    :color="color"
    :filled="filled"
    :dense='dense'
    :label='label'
    :autofocus='autofocus'
    :outlined='outlined'
    :disabled='disabled'
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { currency } from '@/plugins/inputValidation'

@Component
export default class CurrencyInput extends Vue {
  @Prop({ type: Number, required: true, default: 0 }) readonly value!: number
  @Prop(String) readonly color: string | undefined

  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly dense!: boolean
  @Prop({ default: false }) readonly label!: boolean
  @Prop({ default: false }) readonly autofocus!: boolean
  @Prop({ default: false }) readonly outlined!: boolean
  @Prop({ default: false }) readonly disabled!: boolean

  rules = [currency]

  getInput() {
    return (this.$refs.input as any)?.$el.querySelector('input')
  }

  updateValue(value: string) {
    const oldValue = this.value
    const input = this.getInput()

    // If input is set to 0.00, ignore it and set the new value to the character typed
    if (oldValue == 0) {
      this.$emit('input', parseInt(input.value.charAt(0)))
      return
    }

    let newValue = parseFloat(value)

    if (isNaN(newValue)) newValue = 0

    this.$emit('input', newValue)
  }

  get rawValue() {
    const input = this.getInput()
    const caretIndex = input?.selectionStart

    setTimeout(() => {
      input?.setSelectionRange(caretIndex, caretIndex)
    }, 0)

    return this.value.toFixed(2)
  }

  keydown(e: KeyboardEvent) {
    const input = this.getInput()

    const enteredCharacter = e.key.length == 1

    if (enteredCharacter && !'1234567890.'.includes(e.key))
      e.preventDefault()

    if (input.value.includes('.')) {
      if (e.key === '.') {
        e.preventDefault()
        const caretIndex = input?.selectionStart
        input.setSelectionRange(caretIndex + 1, caretIndex + 1)
      }

      if (
        enteredCharacter &&
        input.selectionStart == input.value.length
       ) {
        e.preventDefault()
      }
    }
  }

  focus() {
    this.getInput().setSelectionRange(0, 0)
  }
}
</script>
