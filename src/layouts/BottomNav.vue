<template lang="pug">
  transition(name="slide-fade")
    v-bottom-navigation(app, color="indigo", grow, v-if="show")
      v-btn(
        v-for="link in primaryNavLinks",
        :key="link.to",
        :value="link.text",
        :to="{ name: link.to }"
      )
        span {{ link.text | capitalize }}
        v-icon {{ link.icon }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { User, UserRole, Role } from '@/definitions/User'

@Component
export default class BottomNav extends Vue {

  @Prop({ default: true }) readonly show!: boolean

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser
  }

  get primaryNavLinks() {
    return this.$router.options.routes
      ?.filter((route) => {
        const meta = route.meta;

        if (!meta) return false;

        const icon = !!meta.icon;
        const restrict = !!meta.restrict;

        const userHasRequiredRole = !!meta.restrict?.some((role: UserRole) =>
          this.authenticatedUser?.roles?.map((r: Role) => r.id).includes(role)
        );

        return (icon && !restrict) || (icon && userHasRequiredRole);
      })
      .map((route) => ({
        text: route.name,
        icon: route.meta.icon,
        to: route.name,
      }))
  }
}
</script>