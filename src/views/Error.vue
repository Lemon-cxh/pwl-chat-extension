<template>
  <div>
    <img src="../../public/image/Error.png" style="width: 440px" />
    <el-row class="text">服务维护中，请稍后再试</el-row>
  </div>
</template>

<script>
export default {
  name: 'error-component'
}
</script>

<style scoped>
.text {
  justify-content: center;
  font-size: 20px;
  color: white;
}
</style>
