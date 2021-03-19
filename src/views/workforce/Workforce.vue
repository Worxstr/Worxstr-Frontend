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
			v-data-table(
				:headers="headers"
				:items="workforce"
				:loading="loading"
				@click:row="openUser"
			)
				template(v-slot:item.name="{ item }")
					span {{ item | fullName }}

				template(v-slot:item.phone="{ item }")
					span {{ item.phone | phone }}
			
</template>

<script>
import AddWorkforceMemberDialog from "./AddWorkforceMemberDialog";
import { userIs, ORGANIZATION_MANAGER } from "@/definitions/userRoles";
import { mapGetters } from "vuex";

export default {
  name: "workforce",
  metaInfo: {
    title: "Workforce",
  },
  components: { AddWorkforceMemberDialog },
  async mounted() {
		this.loading = true
    await this.$store.dispatch("loadWorkforce");
		this.loading = false
	},
  data: () => ({
		loading: false,
    addEmployeeDialog: false,
    addManagerDialog: false,
    headers: [
			{
				text: "ID",
				value: "id"
			},
      {
        text: "Name",
        value: "name",
      },
			{
				text: "Email",
				value: "email",
			},
			{
				text: "Phone",
				value: "phone",
			},
			{
				text: "Manager ID",
				value: "manager_id",
			}
    ],
  }),
  computed: {
    ...mapGetters(["workforce"]),
    userIsOrgManager() {
      return this.$store.state.authenticatedUser
        ? userIs(ORGANIZATION_MANAGER, this.$store.state.authenticatedUser)
        : false;
    },
  },
	methods: {
		openUser(user) {
			this.$router.push({name: 'user', params: {userId: user.id}})
		}
	},
};
</script>