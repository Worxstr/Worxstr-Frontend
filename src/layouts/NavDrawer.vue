<template lang="pug">
v-navigation-drawer.d-flex.flex-column(
  app,
  :mini-variant="miniNav",
  mini-variant-width="68",
  permanent
)
  //- Logo and collapse button
  v-app-bar(flat, :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'")
    a(@click="miniNav = !miniNav", text)
      v-avatar.mb-1(tile, size="40")
        img(src="@/assets/logo.svg", alt="Worxstr logo")

    v-toolbar-title.ml-3.font-weight-medium Worxstr

    v-spacer

    v-btn(icon, @click.stop="miniNav = !miniNav")
      v-icon mdi-chevron-left

  v-divider

  //- Primary items
  v-list.pt-0(dense)
    v-tooltip(
      v-for="link in primaryNavLinks",
      :key="link.text",
      right,
      :disabled="!miniNav"
    )
      span {{ link.text | capitalize }}
      template(v-slot:activator="{ on, attrs }")
        v-list-item.py-1(
          link,
          :to="{ name: link.to }",
          active-class="primary--text",
          v-on="on",
          v-bind="attrs"
        )
          v-list-item-icon
            v-icon {{ link.icon }}

          v-list-item-content
            v-list-item-title {{ link.text | capitalize }}


  //- Secondary items
  template(v-slot:append)
    v-list(dense)
      v-divider

      v-tooltip(
        v-for="link in secondaryNavLinks",
        :key="link.text",
        right,
        :disabled="!miniNav"
      )
        span {{ link.text | capitalize }}
        template(v-slot:activator="{ on, attrs }")
          v-list-item.py-1(
            link,
            active-class="primary--text",
            :to="link.to ? { name: link.to } : null",
            @click="() => (link.click ? link.click() : '')"
          v-on="on",
          v-bind="attrs"
          )
            v-list-item-icon
              v-icon {{ link.icon }}

            v-list-item-content
              v-list-item-title {{ link.text | capitalize }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User, Role, UserRole } from '@/definitions/User'

@Component
export default class NavDrawer extends Vue {

  miniNav = false

  signOut(): void {
    this.$store.dispatch("signOut");
  }

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser
  }

  // TODO: Combine primary and secondary links
  // TODO: Primary links are duplicated in BottomNav.vue

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