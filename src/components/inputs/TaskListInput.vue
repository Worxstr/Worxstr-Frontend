<template lang="pug">
.task-list-input.my-16
    
  draggable.d-flex.flex-column.gap-small(
    v-model='localTasks'
    @change='update'
    v-bind='dragOptions'
    @start='drag = true'
    @end='drag = false'
  )
    
    //- transition-group(
    //-   type='transition'
    //-   :name="!drag ? 'flip-first' : null"
    //- )
    v-sheet(
      v-for='(task, i) in localTasks'
      :key='i'
      outlined
      rounded
      style='width: 100%; cursor: move;'
    )
      v-card-text.px-4.py-2
        h5.text-subtitle-1 {{ task.title }}
        v-expand-transition
          div(v-html='task.description')

  v-form(@submit.prevent='addTask' v-model='newTaskValid' ref='form')
      
    .d-flex.flex-column.gap-small(v-if='newTaskMode')
      v-text-field(
        v-model='newTask.title'
        label='Task title'
        outlined
        dense
        hide-details
        :rules='newTaskRules.title'
      )
      v-expand-transition
        richtext-field(
          v-if='newTask.title'
          placeholder='Task description'
          v-model='newTask.description'
        )

    .d-flex
      v-spacer
      v-btn(
        text
        color='primary'
        v-if='!newTaskMode'
        @click='newTaskMode = true'
      )
        v-icon(left) mdi-plus
        | New task

      v-btn(
        text
        color='primary'
        v-if='newTaskMode'
        @click='addTask'
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

  @Prop({ default: [] }) tasks!: Task[]
  @Prop({ default: false }) editable!: boolean
  @Prop({ default: false }) orderable!: boolean

  localTasks: Task[] = [{title: 'test', description: ''}, {title: 'test2', description: ''}]
  newTask: Task = {
    title: '',
    description: ''
  }

  drag = false
  editMode = false
  newTaskMode = false
  newTaskValid = false
  newTaskRules = {
    title: [exists('Task title required')],
  }

  get dragOptions() {
    return {
      animation: 200,
    };
  }


  async addTask() {
    const newTask = {...this.newTask}
    console.log(newTask)
    this.localTasks.push(newTask)

    this.update();

    (this.$refs.form as HTMLFormElement)?.reset()
    this.newTask.description = ''
    this.newTaskMode = false
  }

  update() {
    this.$emit('input', this.localTasks);
  }
  
}
</script>
