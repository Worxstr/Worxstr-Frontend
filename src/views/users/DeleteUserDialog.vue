<template lang="pug">
  
v-dialog(
  v-if="user"
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
  eager
)
  v-card.d-flex.flex-column
    v-card-title.headline
      span Delete {{ user | fullName }}?

    v-card-text This user will be permanently deactivated.

    v-spacer
    
    v-card-actions
      v-spacer
      v-btn(text, @click="closeDialog") Cancel
      v-btn(text, color="red", @click="deleteUser" :loading='loading') Delete
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { User } from '@/definitions/User'
import { deleteUser } from '@/services/users'

@Component
export default class DeleteUserDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop(Object) readonly user!: User

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async deleteUser() {
    this.loading = true
    await deleteUser(this.$store, this.user.id)
    this.$router.push({name: 'users'})
    this.loading = false
    this.closeDialog()
  }
}
</script>
