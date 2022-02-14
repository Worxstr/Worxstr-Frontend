<template lang="pug">
.lineitem-list-input.d-flex.flex-column

  v-form.d-flex.flex-column(
    v-model='lineitemValid'
    ref='form'
    :class="{'mt-4': localLineitems.length}"
  )
    draggable.d-flex.flex-column.gap-small(
      v-model='localLineitems'
      @change='update'
      v-bind='{animation: 200}'
      @start='dragStart'
      @end='dragEnd'
      :disabled='!orderable'
      handle='.handle'
    )
      .d-flex(v-for='(lineitem, i) in localLineitems' :key='i')
        .d-flex.gap-small.flex-grow-1
          v-text-field(
            v-model='lineitem.title'
            :label='`Item ${i + 1} name`'
            placeholder='Item title'
            autofocus
            outlined
            dense
            hide-details
            :rules='lineitemRules.title'
          )
          currency-input(
            v-model='lineitem.amount'
            label='Amount'
            outlined
            dense
            hide-details
          )
        
        .d-flex.ml-2
          v-btn(
            icon
            color='error'
            @click='removeLineitem(i)'
            :disabled='localLineitems.length === 1'
          )
            v-icon mdi-delete

          v-btn.handle(
            v-if='orderable && localLineitems.length !== 1'
            icon
            style='cursor: move'
          )
            v-icon mdi-drag-horizontal

  v-list-item.pl-0

    v-list-item-action
      v-btn(
        text
        color='primary'
        @click='addLineitem'
      )
        v-icon(left) mdi-plus
        | Add item

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { exists } from '@/util/inputValidation'
import RichtextField from '@/components/inputs/RichtextField.vue'
import CurrencyInput from './CurrencyInput.vue'
import draggable from 'vuedraggable'

type Lineitem = {
  id?: number
  title: string
  amount: number
}

@Component({
  components: {
    RichtextField,
    CurrencyInput,
    draggable,
  }
})
export default class InvoiceInput extends Vue {

  @Prop({ type: Array }) value!: Lineitem[]
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) orderable!: boolean

  localLineitems: Lineitem[] = []
  drag = false

  lineitemRules = {
    title: [exists('Lineitem title required')],
    amount: [exists('Lineitem amount required'), (v: number) => v > 0 || 'Invalid amount'],
  }

  mounted() {
    this.localLineitems = this.value
  }

  addLineitem() {
    this.localLineitems.push({
      title: '',
      amount: 0,
    })
    this.update()
  }

  removeLineitem(i: number) {
    this.localLineitems.splice(i, 1)
    this.update()
  }

  lineitemValid = true

  dragStart() {
    this.drag = true
  }

  dragEnd(event: any) {
    this.drag = false
  }

  update() {
    this.$emit('input', this.localLineitems)
  }
  
}
</script>
