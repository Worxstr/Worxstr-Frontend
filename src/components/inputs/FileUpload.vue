<template lang="pug">

v-file-input(
  v-model='files'
  v-bind='$attrs'
  prepend-icon='mdi-paperclip'
  :placeholder="placeholder || 'Attach files...'"
  :accept='accept'
  chips
  show-size
  hide-details
  outlined
  @change='upload'
  :loading='uploading'
)

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { uploadFiles } from '@/services/files'

type FileType = 'image' | 'video' | 'audio' | 'file'

@Component
export default class FileUpload extends Vue {
  
  files: File[] = []
  uploading = false

  @Prop({ type: String }) placeholder?: string
  @Prop({ default: () => ['file'] }) types!: FileType[]

  get accept() {
    if (this.types.includes('file')) {
      return '*/*'
    }
    else {
      const types = []
      if (this.types.includes('image')) {
        types.push('image/*')
      }
      if (this.types.includes('video')) {
        types.push('video/*')
      }
      if (this.types.includes('audio')) {
        types.push('audio/*')
      }
      return types.join(',')
    }
  }

  async upload() {
    try {
      this.uploading = true
      console.log('uploading', this.files.length + ' files')
      const data = await uploadFiles(this.files)
      console.log(data)
      this.$emit('input', ['test'])
    }
    finally {
      this.uploading = false
    }
  }

}
</script>