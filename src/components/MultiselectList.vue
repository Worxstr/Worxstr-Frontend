<template lang="pug">
div
  v-toolbar(flat color='transparent')
    v-checkbox.mr-2(
      v-if='showCheckboxes'
      hide-details
      :value.sync='anySelected'
      @change='selectAll'
      :indeterminate='partiallySelected'
    )

    v-toolbar-title.text-h6
      span(v-if='selectedItems.length')
        | {{selectedItems.length}} {{selectedItems.length == 1 ? itemName : `${itemName}s`}} selected

      span(v-else)
        slot(name='title')

    v-spacer

    span(v-show='anySelected')
      slot(name='item-actions')

    span(v-show='!anySelected')
      slot(name='actions')
      
  v-card.soft-shadow(outlined rounded)

    v-list
      v-skeleton-loader(
        v-if='loading && (!items.length)'
        v-for='(v, i) in [1,2,3,4,5,6]'
        :key='i'
        type="list-item-two-line"
      )

      v-list-item(
        v-for='(item, i) in items'
        :key='item.id'
      )
        v-list-item-icon.my-0.mr-2(v-if='showCheckboxes')
          v-checkbox(
            v-model='selectedItems'
            :value='item.id'
          )

        slot(name='content' :item='item')

</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class MultiselectList extends Vue {
  
  @Prop({ default: () => [] }) items!: any[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: true }) showCheckboxes!: boolean
  @Prop({ default: 'item' }) itemName!: string
  @Prop({ default: [] }) value!: number[]

  selectedItems: number[] = []

  @Watch('value')
  onValueChange(val: number[]) {
    this.selectedItems = val
  }

  @Watch('selectedItems')
  onselectedItemsChange(val: number[]) {
    this.$emit('input', val)
  }
  
  get oneSelected() {
    return this.selectedItems.length === 1
  }

  get anySelected() {
    return this.selectedItems.length > 0
  }

  get allSelected() {
    return this.selectedItems.length === this.items.length
  }

  get partiallySelected() {
    return this.anySelected && !this.allSelected
  }

  selectAll() {
    this.selectedItems = this.allSelected ? [] : this.items.map(shift => shift.id)
  }

}
</script>