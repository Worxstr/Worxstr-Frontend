import axios from 'axios'
import { showSnackbar } from '@/util/helpers'

export async function contactSales(form: {
  business_name?: string;
  contact_name: string;
  contact_title?: string;
  phone?: {
    country_code: string;
    area_code: string;
    phone_number: string;
  };
  email?: string;
  website?: string;
  num_managers?: number;
  num_contractors?: number;
  notes?: string;
}, type: 'sales' | 'support') {
  try {
    const { data } = await axios({
      method: 'POST',
      url: `contact/${type}`,
      data: form
    })
    showSnackbar({ text: "Thanks! We will get back to you shortly." })
    return data
  }
  catch (err) {
    return err
  }
}