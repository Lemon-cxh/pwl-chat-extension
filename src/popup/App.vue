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
  margin-top: 5px;
}
.el-popover {
  --el-popover-bg-color: #333333 !important;
  --el-popover-padding: 5px !important;
}
.el-dialog {
  margin: 50px auto 0 !important;
}
.el-divider__text {
  color: white !important;
}
.el-popover.el-popper {
  background: var(--el-popover-bg-color) !important;
}
.el-popper.is-light .el-popper__arrow::before, .el-divider__text {
  background: #333333 !important;
}
.el-tabs__nav-wrap::after {
  content: none !important;
}
.content img {
  max-width: 200px;
}
.el-scrollbar {
  --el-scrollbar-bg-color: rgb(247, 149, 51) !important;
}
.el-scrollbar__thumb:hover {
  --el-scrollbar-hover-bg-color: rgb(247, 149, 51) !important;
}
.el-scrollbar__thumb {
  opacity: 1 !important;
}
p {
  margin: 0px;
}
.back-top {
  position: absolute;
  bottom: 25px;
  right: 20px;
  font-size: 36px;
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
.dark-mode {
  filter: invert(0.75) hue-rotate(180deg);
}
</style>
