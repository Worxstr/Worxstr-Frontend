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
        v-toolbar-title.text-h6
          | {{ editMode ? 'Edit' : 'Add' }}
          | {{ userIsManager ? 'manager' : userIsContractor ? 'contractor' : 'user' }}

      v-card-text
        v-text-field(
          autofocus
          label="First name"
          dense
          outlined
          v-model="editedUser.first_name"
          :rules="rules.firstName"
          required
          :disabled='editMode'
        )
        v-text-field(
          label="Last name"
          dense
          outlined
          v-model="editedUser.last_name"
          :rules="rules.lastName"
          required
          :disabled='editMode'
        )
        v-text-field(
          label="Email"
          type="email"
          dense
          outlined
          :rules="rules.email"
          v-model="editedUser.email"
          required
          :disabled='editMode'
        )
        phone-input(
          v-model="editedUser.phone"
          outlined
          :disabled='editMode'
        )

        v-select(
          v-model="editedUser.manager_id"
          :items="managers.contractor"
          :item-text="(m) => `${m.first_name} ${m.last_name}`"
          :item-value="'id'"
          outlined
          dense
          required
          label="Direct manager"
          :rules="rules.directManager"
          :disabled='editMode'
        )

        div(v-if='userIsManager')
          v-subheader Manager info

          v-select(
            v-model="editedUser.roles"
            :items="managerRoles"
            :item-text='(r) => $options.filters.capitalize($options.filters.snakeToSpace(r.name))'
            :item-value='(r) => r'
            multiple
            outlined
            dense
            required
            label="Roles"
            :disabled='editMode'
          )

        div(v-if='userIsContractor')
          v-subheader Contractor info

          v-text-field(
            prefix="$"
            suffix="/ hour"
            label="Hourly wage"
            type="number"
            min="0.01"
            step="0.01"
            dense
            outlined
            :rules="rules.currency"
            v-model.number="editedUser.contractor_info.hourly_rate"
            required
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
import { Managers, User, userIs, UserRole } from '@/definitions/User'
import { exists, emailRules, currency } from '@/plugins/inputValidation'
import PhoneInput from '@/components/inputs/PhoneInput.vue'

@Component({
  components: {
    PhoneInput,
  },
})
export default class EditUserDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean
  @Prop(Object) readonly user: User | undefined

  isValid = false
  loading = false
  type: 'manager' | 'contractor' | null = null
  editMode = false

  editedUser: any = {}

  // TODO: Generate this from enum value in User.ts
  managerRoles = [
    {
      id: 2,
      name: 'organization_manager',
    },
    {
      id: 3,
      name: 'contractor_manager',
    },
  ]

  rules = {
    firstName: [exists('First name required')],
    lastName: [exists('Last name required')],
    email: emailRules,
    currency: [(value: string) => !!value || 'Wage required', currency],
    directManager: [(value: string) => !!value || 'Direct manager required'],
    // TODO: Add rule for user roles
    // roles: [(roles: any) => !!roles.length || 'Must select a role']
  }

  userRoles = Object.keys(UserRole)

  @Watch('opened')
  onOpened(opened: boolean) {
    if (opened) this.$store.dispatch('loadManagers')
    if (opened && this.user) {
      this.editMode = true
      this.editedUser = {
        ...this.user,
      }
    }
    if (!this.editMode) {
      Vue.set(this.editedUser, 'roles', [
        {
          id: UserRole.ContractorManager,
          name: 'contractor_manager',
        },
      ])
    }
  }

  mounted() {
    this.editedUser.manager_id = this.$store.state.authenticatedUser?.id
  }

  get managers() {
    return this.$store.state.managers
  }

  get userIsContractor() {
    return userIs(this.editedUser, UserRole.Contractor)
  }

  get userIsManager() {
    return userIs(this.editedUser, ...Managers)
  }

  closeDialog() {
    if (!this.editMode) (this.$refs.form as HTMLFormElement).reset()
    this.$emit('update:opened', false)
  }

  async addUser() {
    this.loading = true
    try {
      if (this.editMode) {
        if (this.userIsManager) {
          // await this.$store.dispatch('updateManager')
        }

        if (this.userIsContractor) {
          await this.$store.dispatch('updateContractor', {
            contractorInfo: this.editedUser.contractor_info,
            userId: this.editedUser.id,
          })
        }
      } else {
        if (this.userIsManager) {
          await this.$store.dispatch('addManager', {
            ...this.editedUser,
          })
        }
      }

      this.$store.dispatch('showSnackbar', {
        text: `
          ${this.editedUser.first_name}
          ${this.editedUser.last_name}
          ${this.editMode ? 'updated' : 'added'}
        `,
      })
      this.closeDialog()
    } finally {
      this.loading = false
    }
  }
}
</script>
