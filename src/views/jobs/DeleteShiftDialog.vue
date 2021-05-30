<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-card-title.headline Delete shift {{shift.id}}?
    v-card-text {{ employeeName }} will no longer work this shift.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="deleteShift") Yes, Delete
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script lang="ts">
import { Shift } from '@/definitions/Job';
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class DeleteShiftDialog extends Vue {
  loading = false

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Object) readonly shift: Shift | undefined
  @Prop(String) readonly employeeName: string | undefined

  closeDialog() {
    this.$emit("update:opened", false);
  }
  
  async deleteShift() {
    this.loading = true
    if (this.shift)
      await this.$store.dispatch("deleteShift", {
        shiftId: this.shift.id,
        jobId: this.$route.params.jobId
      });
    this.loading = false
    this.closeDialog();
  }
}
</script>