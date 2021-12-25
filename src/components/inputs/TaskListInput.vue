<template lang="pug">
.task-list-input.d-flex.flex-column.gap-small

  draggable.d-flex.flex-column.gap-small(
    v-model='localTasks'
    @change='update'
    v-bind='{animation: 200}'
    @start='dragStart'
    @end='dragEnd'
    :disabled='!orderable'
    handle='.handle'
  )
    div(
      v-for='(task, i) in localTasks'
      :key='i'
      style='width: 100%;'
    )
      v-form.d-flex.flex-column.gap-small(
        v-if='editingTask === i'
        @submit.prevent='addTask'
        v-model='taskValid'
        ref='form'
        :class="{'mt-4': localTasks.length}"
      )
          
        .d-flex.flex-column.gap-small
          v-text-field(
            v-model='localTasks[editingTask].title'
            label='New task'
            placeholder='Task title'
            autofocus
            outlined
            dense
            hide-details
            :rules='taskRules.title'
          )
          v-expand-transition
            richtext-field(
              v-show='localTasks[editingTask].title'
              placeholder='Task description'
              v-model='localTasks[editingTask].description'
            )

        .d-flex
          v-btn(
            text
            color='primary'
            @click='addTask'
            :disabled='!taskValid'
          )
            v-icon(left) mdi-plus
            | Add another task

          v-btn(
            v-if='editingTask !== null'
            text
            color='primary'
            @click='exitEditMode'
          )
            v-icon(left) mdi-check
            | Done

      v-sheet.d-flex(
        v-else
        outlined
        rounded
      )
        v-card-text.px-4.py-2
          h5.text-subtitle-1 {{ task.title }}
          div(v-html='task.description')

        .d-flex.mt-1.mr-1
          v-btn(icon color='primary' @click='editTask(i)')
            v-icon mdi-pencil
          v-btn(icon color='error' @click='removeTask(i)')
            v-icon mdi-delete
          v-btn.handle(
            v-if='orderable'
            icon
            @click='removeTask(i)'
            style='cursor: move'
          )
            v-icon mdi-drag-horizontal

  .d-flex
    v-btn(
      text
      color='primary'
      @click='addTask'
      v-show='editingTask === null'
    )
      v-icon(left) mdi-plus
      | Add task

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { exists } from '@/util/inputValidation'
import RichtextField from '@/components/inputs/RichtextField.vue'
import draggable from 'vuedraggable'

type Task = {
  id?: number;
  title: string;
  description: string;
}

@Component({
  components: {
    RichtextField,
    draggable,
  }
})
export default class TaskListInput extends Vue {

  @Prop({ default: [] }) value!: Task[]
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) orderable!: boolean

  localTasks: Task[] = []
  drag = false
  editingTask: null | number = null
  taskValid = false
  taskRules = {
    title: [exists('Task title required')],
  }

  mounted() {
    this.localTasks = this.value
  }

  addTask() {
    this.localTasks = this.localTasks.filter((task: Task) => !!task.title)
    this.localTasks.push({
      title: '',
      description: ''
    })
    this.editingTask = this.localTasks.length - 1
    this.update()
  }

  editTask(i: number) {
    this.exitEditMode()
    this.editingTask = i
  }

  removeTask(i: number) {
    this.exitEditMode()
    this.localTasks.splice(i, 1)
    this.update()
  }

  exitEditMode() {
    this.localTasks = this.localTasks.filter((task: Task) => !!task.title)
    this.editingTask = null
  }

  dragStart() {
    this.exitEditMode()
    this.drag = true
  }

  dragEnd(event: any) {
    this.drag = false
    if (this.editingTask) this.editingTask = event.newIndex
  }

  update() {
    this.$emit('input', this.localTasks.filter((task: Task) => !!task.title));
  }
  
}
</script>
