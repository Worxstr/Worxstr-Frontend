<template>
  <v-dialog
    v-model="opened"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="500"
    persistent
  >
    <v-card>
      <v-form
        v-if="editedShift"
        @submit.prevent="updateShift"
        v-model="isValid"
      >
        <v-toolbar flat>
          <v-toolbar-title> Editing shift </v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <v-select
            v-model="editedShift.employee_id"
            :items="employees"
            :item-text="(e) => `${e.first_name} ${e.last_name}`"
            :item-value="'id'"
            outlined
            dense
            label="Employee"
          />
          <v-text-field
            v-model="editedShift.site_location"
            label="Location"
            :rules="rules.location"
            outlined
            dense
          />

          <v-row>
            <v-col>
              <time-input
                required
                v-model="editedShift.time_begin"
                label="Start time"
              />
            </v-col>
            <v-col>
              <time-input
                required
                v-model="editedShift.time_end"
                label="End time"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn text color="green" @click="updateShift" :disabled="!isValid">
            Save
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import TimeInput from "@/components/TimeInput.vue";

export default {
  name: "editShiftDialog",
  props: {
    opened: Boolean,
    employees: Array,
    shift: Object,
  },
  components: { TimeInput },
  data: () => ({
    editedShift: null,
    isValid: false,
    rules: {
      location: [(value) => !!value || "Location required"],
    },
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