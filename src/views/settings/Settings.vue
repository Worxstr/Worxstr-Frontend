<template lang="pug">
v-container.pb-16(fluid)
  v-card.py-2(rounded)
    v-tabs(:vertical="$vuetify.breakpoint.mdAndUp", center-active)
      v-tab.justify-start
        v-icon(left) mdi-account
        | Me

      v-tab.justify-start
        v-icon(left) mdi-cash-multiple
        | Payments

      v-tab.justify-start
        v-icon(left) mdi-lock
        | Security

      v-tab.justify-start
        v-icon(left) mdi-palette
        | Preferences

      v-tab-item
        me

      v-tab-item
        payments

      v-tab-item
        security

      v-tab-item
        preferences
        
</template>

<script>
import Me from "./pages/me/Me.vue";
import Payments from "./pages/payments/Payments.vue";
import Security from "./pages/security/Security.vue";
import Preferences from "./pages/preferences/Preferences.vue";

export default {
  name: "settings",
  metaInfo: {
    title: "Settings",
  },
  components: {
    Me,
    Payments,
    Security,
    Preferences,
  },
  mounted() {
    if (this.$route.params.verifyBeneficialOwners == "true") {
      this.beneficialOwnersDialog = true;
    }
    if (this.$route.params.addFundingSource == "true") {
      this.addFundingSourceDialog = true;
    }
  },
};
</script>

<style lang="scss">
// Stupid left arrow won't go away even with hide-arrows prop
.v-slide-group__prev {
  display: none !important;
}
</style>