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
  height: 400px;
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
::-webkit-scrollbar-thumb:horizontal {
  width: 4px;
  background-color: #cccccc;
}
::-webkit-scrollbar-track-piece {
  background-color: #fff;
}
::-webkit-scrollbar {
  width: 10px;
  height: 8px;
}
::-webkit-scrollbar-thumb:vertical {
  height: 50px;
  background-color: #999;
  outline: 2px solid #fff;
  outline-offset: -2px;
  border: 2px solid #fff;
}
::-webkit-scrollbar-thumb:hover {
  height: 50px;
  background-color: #9f9f9f;
}
</style>
