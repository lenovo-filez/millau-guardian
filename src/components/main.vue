<template>
  <div style="height: 100%">
    <router-view ref="view"></router-view>
  </div>
</template>

<script>
export default {
  created() {
    console.log('created  main.vue')
  }
}
</script>