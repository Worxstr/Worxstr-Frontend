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

        v-card-text.pb-0
        
          v-select(
            label='File format'
            outlined
            dense
            v-model='format'
            :items='exportFormats'
            :item-text='(i) => i.label + " (." + i.name + ")"'
            item-value='name'
            full-width
          )
          
          v-select(
            label='Report type'
            outlined
            dense
            v-model='reportType'
            :items='reportTypes'
            item-text='label'
            item-value='name'
            full-width
          )
        
        v-divider

        v-date-picker(
          v-model='dateRange'
          range
          full-width
          :landscape='$vuetify.breakpoint.smAndUp'
          :max='today'
        )

        v-divider

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
          data-cy='generate-report-button'
        )
          | Download
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import { generateReport, PaymentsDataExportFormats, ReportType } from '@/services/reports'

@Component
export default class ExportDataDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean

  downloadStarted = false
  today = dayjs().format('YYYY-MM-DD')
  dateRange = [
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    this.today,
  ]
  format: PaymentsDataExportFormats = PaymentsDataExportFormats.XLSX
  reportType: ReportType = ReportType.Payments
  
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
      label: 'Excel spreadsheet',
    },
    // {
    //   name: PaymentsDataExportFormats.PDF,
    //   icon: 'mdi-file-pdf-box',
    //   label: 'Adobe PDF',
    // },
    {
      name: PaymentsDataExportFormats.CSV,
      icon: 'mdi-file-delimited-outline',
      label: 'Comma-separated values',
    },
    {
      name: PaymentsDataExportFormats.JSON,
      icon: 'mdi-code-json',
      label: 'Javascript object notation',
    },
  ]

  reportTypes: any = [
    {
      name: ReportType.Payments,
      label: 'Payments report',
    },
    {
      name: ReportType.Time,
      label: 'Attendance report',
    }
  ]

  async download() {
    this.downloadStarted = true
    await generateReport(
      this.reportType,
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