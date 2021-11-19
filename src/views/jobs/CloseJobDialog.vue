<template lang="pug">
v-dialog(
  v-if='job'
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card.d-flex.flex-column
    v-card-title.headline Close {{job.name}}?
    v-card-text This cannot be undone.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="closeJob") Yes, Close
      
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Job } from '@/types/Jobs'
import { closeJob } from '@/services/jobs'

@Component
export default class CloseJobDialog extends Vue {
  loading = false

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Object) readonly job!: Job
  @Prop(String) readonly contractorName: string | undefined

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async closeJob() {
    this.loading = true
    try {
      await closeJob(this.$store, this.job.id)
      this.closeDialog()
      this.$router.push({name: 'jobs'})
    }
    finally {
      this.loading = false
    }
  }
}
</script>