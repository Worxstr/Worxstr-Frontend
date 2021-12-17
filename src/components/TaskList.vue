<template lang="pug">
.task-list
  v-checkbox.mt-1(
    v-for='task in tasks'
    :key='task.id'
    hide-details
    v-model='task.complete'
    @change='completeTask(task.id)'
    :disabled='loadingTask == task.id'
  )
    template(v-slot:label)
      v-sheet(v-if='task.description' outlined rounded style='width: 100%')
        v-card-text.px-4.py-2
          h5.text-subtitle-1 {{ task.title }}
          v-expand-transition
            div(v-show='!task.complete' v-html='task.description')

        v-fade-transition
          v-overlay(absolute opacity='.2' v-if='loadingTask == task.id')
            v-progress-circular(indeterminate size='30')
  
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Task } from '@/types/Jobs'
import { completeTask } from '@/services/jobs'

@Component
export default class TaskList extends Vue {

  @Prop({ default: [] }) tasks!: Task[]

  loadingTask: number | null = null

  async completeTask(taskId: number) {
    this.loadingTask = taskId
    try {
      await completeTask(this.$store, taskId)
    }
    finally {
      this.loadingTask = null
    }
  }
}
</script>