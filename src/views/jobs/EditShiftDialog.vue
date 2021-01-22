<template lang="pug">
v-dialog(
  v-model="opened",
  :fullscreen="$vuetify.breakpoint.smAndDown",
  max-width="500",
  persistent
)
  v-card
    v-fade-transition
      v-overlay(v-if="loading", absolute, opacity=".2")
        v-progress-circular(indeterminate)

    v-form(
      v-if="editedShift",
      @submit.prevent="updateShift",
      ref="form"
      v-model="isValid"
    )
      v-toolbar(flat)
        v-toolbar-title {{ create ? 'Creating shift' : 'Editing shift' }}
        
      v-card-text
        v-select(
          v-model="editedShift.employee_id",
          :items="employees",
          :item-text="(e) => `${e.first_name} ${e.last_name}`",
          :item-value="'id'",
          :rules="rules.employee"
          outlined,
          dense,
          required
          label="Employee"
        )
        v-text-field(
          v-model="editedShift.site_location",
          label="Location",
          :rules="rules.location",
          outlined,
          dense
          required
        )
        v-row
          v-col
            time-input(
              required,
              v-model="editedShift.time_begin",
              label="Start time"
              :rules="rules.timeBegin"
            )
          v-col
            time-input(
              required,
              v-model="editedShift.time_end",
              label="End time"
              :rules="rules.timeEnd"
            )
      v-card-actions
        v-spacer
        v-btn(text, @click="closeDialog") Cancel
        v-btn(
          text,
          color="green",
          @click="updateShift",
          :disabled="!isValid"
        )
          | {{ create ? 'Create' : 'Save'}}
</template>

<script>
import TimeInput from "@/components/TimeInput.vue";

// TODO: Move these to reusable import
const exists = (errorString) => (value) => !!value || errorString;
const timeValidate = (errorString) => (value) => /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value)

export default {
  name: "editShiftDialog",
  props: {
    opened: Boolean,
    create: Boolean,
    employees: Array,
    shift: Object,
  },
  components: { TimeInput },
  data: () => ({
    editedShift: {},
    isValid: false,
    loading: false,
    rules: {
      employee: [exists("Employee required")],
      location: [exists("Location required")],
      timeBegin: [exists("Start time required"), timeValidate("Time invalid")],
      timeEnd: [exists("End time required"), timeValidate("Time invalid")],
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
      this.$refs.form.reset()
    },
    async updateShift() {
      this.loading = true
      
      if (this.create)
        await this.$store.dispatch("createShift", this.editedShift);
      else
        await this.$store.dispatch("updateShift", this.editedShift);
      
      this.loading = false      
      this.closeDialog()
    },
  },
};
</script>