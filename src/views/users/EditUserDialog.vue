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
          | {{ editMode ? 'Edit' : 'Add' }}&nbsp;
          span(v-if='editedUser.first_name && editedUser.last_name') {{ editedUser.name }}
          span(v-else) {{ userIsManager ? 'manager' : userIsContractor ? 'contractor' : 'user' }}

      v-card-text

        v-text-field(
          v-if='!editMode'
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
          v-if='!editMode'
          label="Last name"
          dense
          outlined
          v-model="editedUser.last_name"
          :rules="rules.lastName"
          required
          :disabled='editMode'
        )
        v-text-field(
          v-if='!editMode'
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
          v-if='!editMode'
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
        )

        div(v-if='userIsManager')
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
            :rules="rules.roles"
          )

        div(v-if='userIsContractor')
          currency-input(
            suffix='/ hour'
            label='Hourly wage'
            dense
            outlined
            v-model.number='editedUser.contractor_info.hourly_rate'
            required
          )

          .d-flex
            p.mr-4 Assigned color
            v-menu(offset-y content-class='color-picker' v-if='editedUser && editedUser.contractor_info')
              template(v-slot:activator='{ on, attrs }')
                .mb-3(v-bind='attrs' v-on='on')
                  v-badge.soft-shadow(:color="editedUser.contractor_info.color || '#4285f4'" bordered)
                  
              v-color-picker(
                v-model='editedUser.contractor_info.color'
                show-swatches
                hide-canvas
                hide-sliders
                hide-inputs
                swatches-max-height='350'
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
import { Managers, User, userIs, UserRole, userRoles } from '@/types/Users'
import { exists, emailRules, currency } from '@/util/inputValidation'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import CurrencyInput from '@/components/inputs/CurrencyInput.vue'
import { addManager, loadManagers, updateContractor } from '@/services/users'
import { showToast } from '@/services/app'
import { deepCopy } from '@/util/helpers'
import { Manager } from 'socket.io-client'

@Component({
  components: {
    PhoneInput,
    CurrencyInput,
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
  managerRoles = userRoles.filter(r => Managers.includes(+r.id))

  rules = {
    firstName: [exists('First name required')],
    lastName: [exists('Last name required')],
    email: emailRules,
    currency: [(value: string) => !!value || 'Wage required', currency],
    directManager: [(value: string) => !!value || 'Direct manager required'],
    roles: [(roles: any) => console.log(roles)]
  }

  @Watch('opened')
  onOpened(opened: boolean) {
    if (!opened) return
    if (!this.editMode) (this.$refs.form as HTMLFormElement)?.reset()

    loadManagers(this.$store)
    
    if (this.user) {
      this.editMode = true
      this.editedUser = deepCopy(this.user)
      // this.editedUser = {
      //   ...this.user,
      // }
    }
    else {
      Vue.set(this.editedUser, 'roles', [
        {
          id: UserRole.Supervisor,
          name: 'contractor_manager',
        },
      ])
    }
  }

  mounted() {
    this.editedUser.manager_id = this.me?.id
  }

  get me() {
    return this.$store.getters.me
  }

  get managers() {
    return this.$store.state.users.managers
  }

  get userIsContractor() {
    return userIs(this.editedUser, UserRole.Contractor)
  }

  get userIsManager() {
    return userIs(this.editedUser, ...Managers)
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async addUser() {
    this.loading = true
    try {
      if (this.editMode) {
        if (this.userIsManager) {
          // updateManager()
        }

        if (this.userIsContractor) {
          await updateContractor(
            this.$store,
            {
              ...this.editedUser.contractor_info,
              direct_manager: this.editedUser.manager_id
            },
            this.editedUser.id,
          )
        }
      } else {
        if (this.userIsManager) {
          await addManager(this.$store, this.editedUser)
        }
      }

      showToast(this.$store, {
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
