<template lang="pug">

v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='550'
  persistent
)
  v-card.d-flex.flex-column
    v-fade-transition
      v-overlay(v-if='loading' absolute opacity='.2')
        v-progress-circular(indeterminate)

    v-form.flex-grow-1.d-flex.flex-column(
      @submit.prevent='download'
      ref='form'
    )
      v-toolbar.flex-grow-0(flat)
        v-toolbar-title.text-h6 Export payments data
      
      v-divider
      
      template(v-if='!downloadStarted')
        v-date-picker(
          v-model='dateRange'
          range
          full-width
          :landscape='$vuetify.breakpoint.smAndUp'
        )

        v-divider

        v-card-text.py-0

          v-radio-group.my-0(v-model='format')
            v-radio.mb-0(v-for='(format, i) in exportFormats' :key='format.name' :value='format.name')
              template(v-slot:label)
                v-icon {{ format.icon }}
                v-list-item
                  v-list-item-content
                    v-list-item-title .{{format.name}}
                    v-list-item-subtitle {{format.description}}

      v-slide-y-transition
        template(v-if='downloadStarted')
          v-card-text
            v-alert(
              type='success'
              outlined
            ) Your download has started

      v-spacer

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(
          :disabled='downloadStarted'
          color='primary'
          text
          type='submit'
          data-cy='export-data-button'
        )
          | Download
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import { exportPayments } from '@/services/payments'
import { PaymentsDataExportFormats } from '@/types/Payments'

@Component
export default class ExportDataDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean

  downloadStarted = false
  dateRange = [
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]
  format: PaymentsDataExportFormats = PaymentsDataExportFormats.XLSX
  
  @Watch('opened')
  onOpened(newVal: boolean) {
    if (newVal) {
      this.downloadStarted = false
    }
  }

  closeDialog() {
    this.$emit("update:opened", false)
  }

  exportFormats: any = [
    {
      name: PaymentsDataExportFormats.XLSX,
      icon: 'mdi-microsoft-office',
      description: 'Excel spreadsheet',
    },
    // {
    //   name: PaymentsDataExportFormats.PDF,
    //   icon: 'mdi-file-pdf-box',
    //   description: 'Adobe PDF',
    // },
    {
      name: PaymentsDataExportFormats.CSV,
      icon: 'mdi-file-delimited-outline',
      description: 'Comma-separated values',
    },
    {
      name: PaymentsDataExportFormats.JSON,
      icon: 'mdi-code-json',
      description: 'Javascript object notation',
    },
  ]

  async download() {
    this.downloadStarted = true
    await exportPayments(
      this.dateRange[0],
      this.dateRange[1],
      this.format
    )
    setTimeout(() => {
      this.closeDialog()
    }, 1500)
  }
}
</script>