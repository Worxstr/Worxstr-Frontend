<template lang="pug">
	v-container
		add-workforce-member-dialog(:opened.sync="addEmployeeDialog" type="employee")
		add-workforce-member-dialog(:opened.sync="addManagerDialog" type="manager")

		v-toolbar(flat, color="transparent")
			v-toolbar-title.text-h5.font-weight-medium Workforce
			v-spacer
			v-btn(text @click="addEmployeeDialog = true") Add employee
			v-btn(text @click="addManagerDialog = true" v-if="userIsOrgManager") Add manager
		
		v-card
			v-card-content
				p.pa-5 Employees and managers go here
</template>

<script>
import AddWorkforceMemberDialog from './AddWorkforceMemberDialog'
import { userIs, ORGANIZATION_MANAGER } from '@/definitions/userRoles'

export default {
  name: "workforce",
  metaInfo: {
    title: 'Workforce'
  },
  components: { AddWorkforceMemberDialog },
  data: () => ({
    addEmployeeDialog: false,
    addManagerDialog: false,
  }),
  computed: {
    userIsOrgManager() {
      return this.$store.state.authenticatedUser ? userIs(ORGANIZATION_MANAGER, this.$store.state.authenticatedUser) : false
    }
  }
};
</script>