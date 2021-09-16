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
    if (oldValue == 0 && input.selectionStart == 1) {
      this.$emit('input', parseInt(input.value.charAt(0)))
      return
    }

    let newValue = parseFloat(value)

    if (!newValue || isNaN(newValue)) newValue = 0

    this.$emit('input', newValue)
  }

  get rawValue() {
    const input = this.getInput()
    const caretIndex = input?.selectionStart

    // After formatting, set the caret back to the original position
    setTimeout(() => {
      input?.setSelectionRange(caretIndex, caretIndex)
    }, 0)

    return this.value.toFixed(2)
  }

  keydown(e: KeyboardEvent) {
    const input = this.getInput()

    const enteredCharacter = e.key.length == 1

    // Only allow numbers, period, and control characters
    if (enteredCharacter && !'1234567890.'.includes(e.key)) e.preventDefault()

    // If a zero is typed and the value is set to zero, move the cursor over
    if (e.key == '0' && input.value.charAt(input.selectionStart) == '0') {
      e.preventDefault()
      const caretIndex = input?.selectionStart
      input.setSelectionRange(caretIndex + 1, caretIndex + 1)
    }

    // If the decimal has been typed
    if (input.value.includes('.')) {
      // Do not allow a second decimal
      if (e.key === '.') {
        e.preventDefault()

        // If the decimal is the next character, move the cursor to after the decimal
        if (input.value.charAt(input.selectionStart) === '.') {
          const caretIndex = input?.selectionStart
          input.setSelectionRange(caretIndex + 1, caretIndex + 1)
        }
      }

      // Do not allow more than 2 decimal places
      if (enteredCharacter && parseFloat(input.value).toString().split('.')[1]?.length == 2)
        e.preventDefault()
    }
  }

  focus() {
    // If the current value is 0, set the cursor to the beginning of the input
    const cursorIndex = this.value == 0 ? 0 : this.value.toFixed(2).length
    this.getInput().setSelectionRange(cursorIndex, cursorIndex)
  }
}
</script>
