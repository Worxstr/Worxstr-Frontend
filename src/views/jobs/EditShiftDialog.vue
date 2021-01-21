<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-form v-if="editedShift">
        <v-card-title class="headline">Editing shift </v-card-title>

        <v-card-text>
          <v-select
            v-model="editedShift.employee_id"
            :items="employees"
            :item-text="(e) => `${e.first_name} ${e.last_name}`"
            :item-value="'id'"
            label="Employee"
          />
          <v-text-field v-model="editedShift.site_location" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn text color="green" @click="updateShift">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "editShiftDialog",
  props: {
    opened: Boolean,
    employees: Array,
    shift: Object,
  },
  data: () => ({
    editedShift: null,
  }),
  watch: {
    opened(newVal, oldVal) {
      if (newVal == true) this.editedShift = Object.assign({}, this.shift);
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:opened", false);
    },
    updateShift() {
      this.$store.dispatch("updateShift", this.editedShift);
    },
  },
};
</script>