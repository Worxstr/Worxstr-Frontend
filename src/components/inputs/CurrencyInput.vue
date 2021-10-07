<template lang="pug">
  v-text-field(
    :class="{'text-h5': headerFont}"
    @input='updateValue'
    @keydown='keydown'
    @focus='focus'
    :value='rawValue'
    :rules='rules'
    ref='input'
    prefix='$'

    :required='required'
    :color='color'
    :suffix='suffix'
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
import { currency } from '@/util/inputValidation'

@Component
export default class CurrencyInput extends Vue {
  @Prop({ type: [Number, String], required: true, default: 0 }) value!: number | string
  @Prop(String) readonly color: string | undefined
  @Prop(String) readonly suffix: string | undefined

  @Prop({ default: false }) readonly headerFont!: boolean
  @Prop({ default: false }) readonly required!: boolean
  @Prop({ default: false }) readonly filled!: boolean
  @Prop({ default: false }) readonly dense!: boolean
  @Prop({ default: false }) readonly label!: boolean
  @Prop({ default: false }) readonly autofocus!: boolean
  @Prop({ default: false }) readonly outlined!: boolean
  @Prop({ default: false }) readonly disabled!: boolean

  rules = [currency]

  mounted() {
    if (typeof(this.value) === 'string')
      this.value = parseFloat(this.value)
  }

  getInput() {
    return (this.$refs.input as HTMLFormElement)?.$el.querySelector('input')
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
      this.setCaretPosition(caretIndex)
    }, 0)

    return (typeof(this.value) === 'string' ? parseFloat(this.value) : this.value).toFixed(2)
  }

  keydown(e: KeyboardEvent) {
    const input = this.getInput()

    const enteredCharacter = e.key.length == 1

    // Only allow numbers, period, and control characters
    if (enteredCharacter && !'1234567890.'.includes(e.key)) e.preventDefault()

    // If a zero is typed and the value is set to zero, move the cursor over
    if (e.key == '0' && input.value.charAt(input.selectionStart) == '0') {
      e.preventDefault()
      this.setCaretPosition(+1, true)
    }

    const decimalSplit = parseFloat(input.value).toString().split('.')

    // If the user is backspacing the decimal, simple move the cursor
    // If we don't do this, 1.00 becomes 100 which reformats to 100.00, which is unexpected
    if (
      e.key === 'Backspace' &&
      input.selectionStart == decimalSplit[0].length + 1
    ) {
      e.preventDefault()
      this.setCaretPosition(-1, true)
    }


    // If the decimal has been typed
    if (input.value.includes('.')) {
      // Do not allow a second decimal
      if (e.key === '.') {
        e.preventDefault()

        // If the decimal is the next character, move the cursor to after the decimal
        if (input.value.charAt(input.selectionStart) === '.') {
          this.setCaretPosition(+1, true)
        }
      }

      // Do not allow more than 2 decimal places
      if (
        enteredCharacter &&
        input.selectionStart > decimalSplit[0].length &&
        decimalSplit[1]?.length == 2
      )
        e.preventDefault()
    }
  }

  focus() {
    // If the current value is 0, set the cursor to the beginning of the input
    const val = typeof(this.value) === 'string' ? parseFloat(this.value) : this.value
    const cursorIndex = this.value == 0 ? 0 : val.toFixed(2).length
    this.setCaretPosition(cursorIndex)
  }

  // Move the cursor in the text input
  setCaretPosition(index: number, relative = false) {
    const input = this.getInput()
    const i = relative ? input.selectionStart + index : index
    input.setSelectionRange(i, i)
  }
}
</script>
