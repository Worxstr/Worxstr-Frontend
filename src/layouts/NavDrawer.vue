<template lang="pug">
v-navigation-drawer.d-flex.flex-column(
  v-if="!$route.meta.landing && $vuetify.breakpoint.mdAndUp",
  app,
  :mini-variant="miniNav",
  mini-variant-width="68",
  permanent
)
  v-app-bar(flat, :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'")
    a(@click="miniNav = !miniNav", text)
      v-avatar.mb-1(tile, size="40")
        img(src="@/assets/logo.svg", alt="Worxstr logo")

    v-toolbar-title.ml-3.font-weight-medium Worxstr

    v-spacer

    v-btn(icon, @click.stop="miniNav = !miniNav")
      v-icon mdi-chevron-left

  v-divider

  v-list.pt-0(dense)
    v-list-item.py-1(
      v-for="link in primaryNavLinks",
      :key="link.text",
      link,
      :to="{ name: link.to }",
      active-class="primary--text"
    )
      v-list-item-icon
        v-icon {{ link.icon }}

      v-list-item-content
        v-list-item-title {{ link.text | capitalize }}

  template(v-slot:append)
    v-list(dense)
      v-divider

      v-list-item.py-1(
        v-for="link in secondaryNavLinks",
        :key="link.text",
        link,
        active-class="primary--text",
        :to="link.to ? { name: link.to } : null",
        @click="() => (link.click ? link.click() : '')"
      )
        v-list-item-icon
          v-icon {{ link.icon }}

        v-list-item-content
          v-list-item-title {{ link.text | capitalize }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User } from '@/definitions/User'

@Component
export default class NavDrawer extends Vue {

  miniNav = false

  signOut(): void {
    this.$store.dispatch("signOut");
  }

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

  secondaryNavLinks = [
    {
      text: "Settings",
      icon: "mdi-cog",
      to: "settings",
    },
    {
      text: "Sign out",
      icon: "mdi-logout-variant",
      click: this.signOut,
      desktopOnly: true,
    },
  ]
}
</script>