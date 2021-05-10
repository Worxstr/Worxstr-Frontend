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
import { Vue, Component } from 'vue-property-decorator'

@Component({
  props: {
    opened: Boolean,
    shift: Object,
    employeeName: String,
  }
})
export default class DeleteShiftDialog extends Vue {
  loading = false
  
  closeDialog() {
    this.$emit("update:opened", false);
  }
  
  async deleteShift() {
    this.loading = true
    await this.$store.dispatch("deleteShift", this.shift.id);
    this.loading = false
    this.closeDialog();
  }
}
</script>