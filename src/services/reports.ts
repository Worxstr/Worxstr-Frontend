import { baseUrl } from '@/services/app'
import { download } from '@/util/helpers'

export enum ReportType {
  Payments = 'payments'
}

export enum PaymentsDataExportFormats {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  PDF = 'pdf'
}

export async function generateReport(
  type: ReportType,
  startDate: string,
  endDate: string,
  format: PaymentsDataExportFormats
) {
  let url = `${baseUrl.get()}/payments/export?report_type=${type}&format=${format}&start_date=${startDate}`
  if (endDate) {
    url += `&end_date=${endDate}`
  }
  download(url, `payments-export-${startDate}-${endDate}.${format}`)
}
