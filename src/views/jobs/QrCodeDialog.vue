<template lang="pug">
v-dialog(
  v-model='opened'
  max-width='280'
  persistent
)
  v-toolbar.flex-grow-0(flat)
    v-toolbar-title.text-h6 {{ jobName }}
    v-spacer
    v-btn(
      icon
      @click='closeDialog'
    )
      v-icon mdi-close

  v-card.d-flex.flex-column
    v-card-title.headline {{ code }}
    v-card-text
      p.subtitle-1.py-0.my-0 
      p Have your contractor scan this to clock in to their shift.

    qrcode(
      :value='code'
      :options='{ width: 280 }'
    )
    v-spacer
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import VueQrcode from '@chenfengyuan/vue-qrcode'

@Component({
  components: {
    [VueQrcode.name]: VueQrcode
  }
})
export default class QrCodeDialog extends Vue {
  loading = false

  @Prop({ default: false }) readonly opened!: boolean
  @Prop(String) readonly code!: string
  @Prop(String) readonly jobName!: string

  closeDialog() {
    this.$emit('update:opened', false)
  }
}
</script>