<script setup lang="ts">
defineProps<{ iso2?: string }>()
</script>

<template>
  <span v-if="iso2" class="inline-block" :class="`fi fi-${iso2.toLowerCase()}`" />
</template>

<style scoped>
/* Adjust flag icon size to match text */
:deep(.fi) {
  width: 1em;
  height: 0.75em;
  line-height: 1;
}
</style>
