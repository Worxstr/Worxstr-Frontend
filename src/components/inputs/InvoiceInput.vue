<template lang="pug">
.lineitem-list-input.d-flex.flex-column.gap-small

  draggable.d-flex.flex-column.gap-small(
    v-model='localLineitems'
    @change='update'
    v-bind='{animation: 200}'
    @start='dragStart'
    @end='dragEnd'
    :disabled='!orderable'
    handle='.handle'
  )
    div(
      v-for='(lineitem, i) in localLineitems'
      :key='i'
      style='width: 100%;'
    )
      v-form.d-flex.flex-column(
        v-if='editingLineitem === i'
        @submit.prevent='addLineitem'
        v-model='lineitemValid'
        ref='form'
        :class="{'mt-4': localLineitems.length}"
      )
          
        .d-flex.flex-column.flex-sm-row.gap-small
          v-text-field(
            v-model='localLineitems[editingLineitem].title'
            label='Item name'
            placeholder='Item title'
            autofocus
            outlined
            dense
            hide-details
            :rules='lineitemRules.title'
          )
          currency-input(
            v-model='localLineitems[editingLineitem].amount'
            label='Amount'
            outlined
            dense
            hide-details
          )

        .d-flex
          v-btn(
            v-if='editingLineitem !== null'
            text
            color='success'
            @click='exitEditMode'
            :disabled='!lineitemValid'
          )
            v-icon(left) mdi-check
            | Save item

          v-btn(
            text
            color='primary'
            @click='addLineitem'
            :disabled='!lineitemValid'
          )
            v-icon(left) mdi-plus
            | Add another item

      v-sheet.d-flex(
        v-else
        outlined
        rounded
      )
        v-card-text.px-4.py-2
          h5.text-subtitle-1 {{ lineitem.title }}
          div(v-html='lineitem.description')

        .d-flex.mt-1.mr-1

          h5.text-subtitle-1.mt-1.mr-2 {{ lineitem.amount | currency }}

          v-btn(icon color='primary' @click='editLineitem(i)')
            v-icon mdi-pencil

          v-btn(icon color='error' @click='removeLineitem(i)')
            v-icon mdi-delete

          v-btn.handle(
            v-if='orderable'
            icon
            @click='removeLineitem(i)'
            style='cursor: move'
          )
            v-icon mdi-drag-horizontal

  .d-flex
    v-btn(
      text
      color='primary'
      @click='addLineitem'
      v-show='editingLineitem === null'
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

  @Prop({ default: [] }) value!: Lineitem[]
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) orderable!: boolean

  localLineitems: Lineitem[] = []
  drag = false
  editingLineitem: null | number = null
  lineitemValid = false
  lineitemRules = {
    title: [exists('Lineitem title required')],
    amount: [exists('Lineitem amount required'), (v: number) => v > 0 || 'Invalid amount'],
  }

  mounted() {
    this.localLineitems = this.value
  }

  addLineitem() {
    this.localLineitems = this.localLineitems.filter((lineitem: Lineitem) => !!lineitem.title)
    this.localLineitems.push({
      title: '',
      description: ''
    })
    this.editingLineitem = this.localLineitems.length - 1
    this.update()
  }

  editLineitem(i: number) {
    this.exitEditMode()
    this.editingLineitem = i
  }

  removeLineitem(i: number) {
    this.exitEditMode()
    this.localLineitems.splice(i, 1)
    this.update()
  }

  exitEditMode() {
    this.localLineitems = this.localLineitems.filter((lineitem: Lineitem) => !!lineitem.title)
    this.editingLineitem = null
    this.update()
  }

  dragStart() {
    this.exitEditMode()
    this.drag = true
  }

  dragEnd(event: any) {
    this.drag = false
    if (this.editingLineitem) this.editingLineitem = event.newIndex
  }

  update() {
    this.$emit('input', this.localLineitems.filter((lineitem: Lineitem) => !!lineitem.title));
  }
  
}
</script>
