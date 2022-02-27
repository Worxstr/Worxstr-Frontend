<template lang="pug">
.lineitem-list-input.d-flex.flex-column

  .d-flex.flex-column
    draggable.d-flex.flex-column.gap-small(
      v-model='localLineitems'
      @change='update'
      v-bind='{animation: 200}'
      @start='dragStart'
      @end='dragEnd'
      :disabled='!orderable'
      handle='.handle'
    )
      .d-flex(v-for='(lineitem, i) in allLineitems' :key='i')
        .d-flex.flex-column.flex-sm-row.gap-small.flex-grow-1
          v-text-field.flex-2(
            v-model='lineitem.description'
            :label='`Item ${i + 1}`'
            placeholder='Item description'
            :autofocus='autofocus'
            outlined
            dense
            hide-details
            :rules='lineitemRules.description'
            :readonly='i === fixedLineitems.length - 1'
          )
          currency-input.flex-1(
            v-model='lineitem.amount'
            :label='`Item ${i + 1} amount`'
            outlined
            dense
            hide-details
            :rules='lineitemRules.amount'
            :readonly='i === fixedLineitems.length - 1'
          )
        
        .d-flex.ml-2.align-center
          v-btn(
            v-if='allLineitems.length !== 1'
            icon
            color='error'
            @click='removeLineitem(i - fixedLineitems.length)'
            :disabled='i === fixedLineitems.length - 1'
          )
            v-icon mdi-delete

          v-btn.handle(
            v-if='orderable && allLineitems.length !== 1'
            :disabled='i <= fixedLineitems.length - 1'
            style='cursor: move'
            icon
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { exists } from '@/util/inputValidation'
import RichtextField from '@/components/inputs/RichtextField.vue'
import CurrencyInput from './CurrencyInput.vue'
import draggable from 'vuedraggable'

type Lineitem = {
  id?: number
  description: string
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

  @Prop({ default: [] }) fixedLineitems!: Lineitem[] // Pass in optional fixed lineitems
  @Prop({ type: Array }) value!: Lineitem[]
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) orderable!: boolean
  @Prop({ default: false }) autofocus!: boolean

  localLineitems: Lineitem[] = []
  drag = false

  get allLineitems() {
    return [
      ...this.fixedLineitems,
      ...this.localLineitems,
    ]
  }

  lineitemRules = {
    description: [exists('Lineitem description required')],
    amount: [exists('Lineitem amount required'), (v: number) => v > 0 || 'Invalid amount'],
  }

  mounted() {
    this.localLineitems = this.value
  }

  lastVal: any = null
  @Watch('fixedLineitems')
  onFixedLineitemsChanged(val: Lineitem[]) {
    if (JSON.stringify(val) !== JSON.stringify(this.lastVal)) {
      this.update()
    }
    this.lastVal = val
  }

  addLineitem() {
    this.localLineitems.push({
      description: '',
      amount: 0,
    })
    this.update()
  }

  removeLineitem(i: number) {
    this.localLineitems.splice(i, 1)
    this.update()
  }

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
