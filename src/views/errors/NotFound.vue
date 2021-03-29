<template lang="pug">
  v-container.d-flex.flex-column.justify-center(fill-height)
    v-icon.text-h2.ma-5 mdi-alert-circle-outline
    p.text-body-1 This page does not exist!
</template>

<script>
export default {
  name: 'Not found',
  metaInfo: {
    title: 'Not found'
  }
}
</script>