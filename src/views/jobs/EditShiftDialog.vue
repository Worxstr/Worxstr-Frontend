<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="headline">Editing shift </v-card-title>

      <v-card-text>
        <v-select :items="employees" label="Employee" />
        <v-select :items="locations" label="Location" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn text color="green">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "editShiftDialog",
  props: {
    opened: Boolean,
  },
  data: () => ({
		employees: ['Employee One', 'Employee Two', 'Employee Three'],
		locations: ['Front of store', 'Back of store'],
  }),
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
  },
};
</script>