import { api } from '@/util/axios'

export const uploadFiles = async (files: File[]) => {

  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  
  const response = await api.post('/api/file-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}