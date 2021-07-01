<template lang="pug">
v-container
  add-workforce-member-dialog(
    :opened.sync="addContractorDialog",
    type="contractor"
  )
  add-workforce-member-dialog(:opened.sync="addManagerDialog", type="manager")

  portal(to="toolbarActions")
    div(v-if="$vuetify.breakpoint.smAndUp")
      v-btn(text, color="primary", @click="addContractorDialog = true")
        span Add contractor

      v-btn(
        text,
        color="primary",
        @click="addManagerDialog = true",
        v-if="userIsOrgManager"
      )
        span(v-if="$vuetify.breakpoint.smAndUp") Add manager

    v-menu(v-else)
      template(v-slot:activator="{ on, attrs }")
        v-btn(text, v-bind="attrs", v-on="on")
          v-icon(left) mdi-account-plus
          span Add member
      v-list
        v-list-item(@click="addContractorDialog = true")
          v-list-item-title Add contractor
        v-list-item(@click="addManagerDialog = true")
          v-list-item-title Add manager

  v-card
    v-data-table(
      :headers="headers",
      :items="workforce",
      :loading="loading",
      @click:row="openUser"
    )
      template(v-slot:item.name="{ item }")
        span {{ item | fullName }}

      template(v-slot:item.phone="{ item }")
        span {{ item.phone | phone }}

      //- template(v-slot:item.phone="{ item }")
      //- 	v-icon(small class="mr-2" @click="editUser(item)") mdi-pencil
      //- 	v-icon(small @click="deleteItem(item)") mdi-delete
</template>

<script>
import AddWorkforceMemberDialog from "./AddWorkforceMemberDialog";
import { userIs, UserRole } from "@/definitions/User";
import { mapGetters } from "vuex";

export default {
  name: "workforce",
  metaInfo: {
    title: "Workforce",
  },
  components: { AddWorkforceMemberDialog },
  async mounted() {
    this.loading = true;
    try {
      await this.$store.dispatch("loadWorkforce");
    } finally {
      this.loading = false;
    }
  },
  data: () => ({
    loading: false,
    addContractorDialog: false,
    addManagerDialog: false,
    headers: [
      {
        text: "ID",
        value: "id",
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
      },
    ],
  }),
  computed: {
    ...mapGetters(["workforce"]),
    userIsOrgManager() {
      return this.$store.state.authenticatedUser
        ? userIs(
            UserRole.OrganizationManager,
            this.$store.state.authenticatedUser
          )
        : false;
    },
  },
  methods: {
    openUser(user) {
      this.$router.push({ name: "user", params: { userId: user.id } });
    },
  },
};
</script>