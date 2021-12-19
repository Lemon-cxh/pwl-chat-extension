<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "app",
};
</script>
<style>
#app {
  height: 500px;
  width: 400px;
}
body {
  background: #333333;
}
.el-dialog__wrapper .el-dialog__body{
  background: #333333;
  color: white;
}
.el-dialog__wrapper .el-dialog__header{
  background: #333333;
}
.el-dialog__wrapper .el-dialog__title {
  color: white;
}
.content img {
  max-width: 200px;
}
p {
  margin: 0px;
}
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgb(252, 197, 142);
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgb(247, 149, 51);
}
</style>
