<template lang="pug">
v-navigation-drawer#nav.d-flex.flex-column(
  app,
  v-model='value'
  v-bind:value='value'
  v-on:input="$emit('input', $event)"
  :mini-variant="mini && $vuetify.breakpoint.mdAndUp",
  mini-variant-width="68",
  :permanent='$vuetify.breakpoint.mdAndUp'
  :temporary='$vuetify.breakpoint.smAndDown'
  :bottom='$vuetify.breakpoint.smAndDown'
)

  //- Logo and collapse button
  v-app-bar(flat, :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'")
    a(@click="mini = !mini", text)
      v-avatar.mb-1(tile, :size="mini ? 40 : 130")
        img(
          :src="require(`@/assets/logos/${mini ? 'icon' : $vuetify.theme.dark ? 'logotype-dark' : 'logotype'}.svg`)"
          alt="Worxstr logo"
        )

    v-spacer

    v-btn(icon, @click.stop="$vuetify.breakpoint.mdAndUp ? (mini = !mini) : (value = !value)")
      v-icon mdi-chevron-{{$vuetify.breakpoint.mdAndUp ? 'left' : 'down'}}

  v-divider

  //- Primary items
  v-list.py-0(dense)
    v-tooltip(
      v-for="link in primaryNavLinks",
      :key="link.text",
      right,
      :disabled="!mini"
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
            v-list-item-title.subtitle-2 {{ link.text | capitalize }}


  //- Secondary items
  template(v-slot:append)
    v-list.secondary-nav-items.pt-0(dense)
      v-divider

      v-tooltip(
        v-for="link in secondaryNavLinks",
        :key="link.text",
        right,
        :disabled="!mini"
      )
        span {{ link.text | capitalize }}
        template(v-slot:activator="{ on, attrs }")
          v-list-item.py-1(
            link,
            active-class="primary--text",
            :to="link.to ? link.to : null",
            @click="() => (link.click ? link.click() : '')"
          v-on="on",
          v-bind="attrs"
          )
            v-list-item-icon
              v-icon {{ link.icon }}

            v-list-item-content
              v-list-item-title.subtitle-2 {{ link.text | capitalize }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { User, Role, UserRole } from '@/definitions/User'

@Component
export default class NavDrawer extends Vue {

  mini = false
  @Prop({ default: false }) value!: boolean

  test() {
    console.log('toggeld')
  }

  signOut(): void {
    this.$store.dispatch("signOut");
  }

  get authenticatedUser(): User {
    return this.$store.state.authenticatedUser
  }

  // TODO: Combine primary and secondary links

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
      to: {
        name: 'settings'
      }
    },
    {
      text: 'Support',
      icon: 'mdi-help-circle-outline',
      to: {
        name: 'contact',
        params: {
          option: 'support'
        }
      }
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

<style lang="scss">
#nav.v-navigation-drawer--bottom{
  height: auto !important;
  max-height: 100%;
}

.secondary-nav-items {
  padding-bottom: env(safe-area-inset-bottom) !important;
}
</style>