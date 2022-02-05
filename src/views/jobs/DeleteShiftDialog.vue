<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-card-title.headline Delete {{ shifts.length == 1 ? shiftName : `${shifts.length} shifts` }}?
    v-card-text {{ uniquePeople > 1 ? `${uniquePeople} people` : contractorName }} will no longer work {{ shifts.length == 1 ? 'this shift' : 'these shifts'}}.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text @click="closeDialog") Cancel
      v-btn(
        text
        color="error"
        @click="deleteShift"
        data-cy="confirm-delete-shift-button"
      ) Yes, Delete
      
    v-fade-transition
      v-overlay(v-if="loading" absolute opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script lang="ts">
import { Shift } from '@/types/Jobs';
import { Vue, Component, Prop } from 'vue-property-decorator'
import { deleteShifts } from '@/services/shifts'

@Component
export default class DeleteShiftDialog extends Vue {
  loading = false

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Array) readonly shiftIds!: number[]

  get shifts(): Shift[] {
    return this.$store.getters.shifts(this.shiftIds)
  }

  get shiftName(): string {
    const first = this.shifts[0]
    if (!first) return ''
    return first.site_location
  }

  get contractorName(): string {
    const first = this.shifts[0]
    if (!first) return ''
    return this.$store.getters.user(first.contractor_id)?.first_name || ''
  }

  get uniquePeople(): number {
    return this.shifts.reduce((acc: any[], shift: Shift) => {
      if (acc.indexOf(shift.contractor_id) === -1) {
        acc.push(shift.contractor_id)
      }
      return acc
    }, []).length
  }

  closeDialog() {
    this.$emit("update:opened", false)
  }
  
  async deleteShift() {
    this.loading = true
    try {
      await deleteShifts(
        this.$store,
        this.shiftIds,
      )
      console.log('close')
      this.closeDialog()
      this.$emit('deleted')
      // TODO:
      // if (this.$route.name === 'shift')
      //   this.$router.push({name: 'job', params: {jobId: jobId.toString()}})
    }
    finally {
      this.loading = false
    }
  }
}
</script>