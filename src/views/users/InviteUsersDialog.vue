<template lang="pug">
v-dialog(
  v-model="opened"
  :fullscreen="$vuetify.breakpoint.smAndDown"
  max-width="500"
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if="loading" absolute opacity=".2")
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent="addUser"
      ref="form"
      v-model="isValid"
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Invite contractors to {{ orgName }} 
      v-card-text
        v-text-field(
          autofocus
          label="First name"
          dense
          outlined
          v-model="first_name"
          :rules="rules.firstName"
          required
          :disabled='editMode'
        )
      
      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click="closeDialog") Cancel
        v-btn(text color="green" :disabled="!isValid" type="submit")
          | {{ editMode ? 'Save' : 'Add' }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { getMyOrganization } from '@/services/organizations'

@Component({
  components: {
  },
})
export default class InviteUsersDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean

  isValid = false
  loading = false

  rules = {
    // firstName: [exists('First name required')],
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    if (!opened) return

    (this.$refs.form as HTMLFormElement)?.reset()
  }

  async mounted() {
    await getMyOrganization(this.$store)
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  get orgName() {
    return this.$store.getters.myOrganization.name || 'your organization'
  }

}
</script>
