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
  margin: 1px;
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
.loading-box {
  width: 100%;
  text-align: center;
}
.loading {
  animation: rotate 1s linear infinite;
  font-size: 30px;
  color: #f79533;
}
.content-background .extension-message::after {
  content: "";
  width: 12px;
  height: 12px;
  position: absolute;
  bottom: 16px;
  right: -16px;
  background-size: cover;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB0PSIxNjQ2OTg3MDAwMjM5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjcwNDgiIGRhdGEtZGFya3JlYWRlci1pbmxpbmUtZmlsbD0iIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+PHBhdGggZD0iTTI1OC4wMTYgNDQ3LjAwOEwxMTIgMTkyLjk5MlExODMuMDA4IDEwMi45NzYgMjg4IDUxLjQ4OFQ1MTIgMHExMzguMDE2IDAgMjU1LjQ4OCA2OHQxODUuNTA0IDE4My4wMDhINTM0Ljk3NnEtMTEuMDA4LTAuOTkyLTIzLjAwOC0wLjk5Mi05MC4wMTYgMC0xNjAuOTkyIDU1LjQ4OHQtOTIuOTkyIDE0MS41MDR6IG00MzYuOTkyLTEyMi4wMTZoMjk0LjAxNnEzNS4wMDggOTAuMDE2IDM1LjAwOCAxODcuMDA4IDAgMTAzLjAwOC00MCAxOTcuNTA0dC0xMDcuNDg4IDE2My4wMDgtMTYxLjUwNCAxMDkuNTA0LTE5Ni45OTIgNDIuMDE2bDIwOC45OTItMzYzLjAwOHE0Ny4wMDgtNjcuMDA4IDQ3LjAwOC0xNDguOTkyIDAtMTEwLjAxNi03OS4wMDgtMTg3LjAwOHpNMzI2LjAxNiA1MTJxMC03Ni45OTIgNTQuNDk2LTEzMS40ODhUNTEyIDMyNi4wMTZ0MTMxLjQ4OCA1NC40OTZUNjk3Ljk4NCA1MTJ0LTU0LjQ5NiAxMzEuNDg4VDUxMiA2OTcuOTg0dC0xMzEuNDg4LTU0LjQ5NlQzMjYuMDE2IDUxMnogbTI1NiAyNTIuOTkybC0xNDYuMDE2IDI1Mi45OTJxLTEyMi4wMTYtMTguMDE2LTIyMi4wMTYtODguOTkydC0xNTYuOTkyLTE4MC45OTJUMCA1MTJxMC0xMzUuMDA4IDY2LjAxNi0yNTEuMDA4bDIwOC45OTIgMzYyLjAxNnEzMiA2OCA5NiAxMDkuNTA0VDUxMiA3NzQuMDE2cTM2IDAgNzAuMDE2LTguOTkyeiIgcC1pZD0iNzA0OSIgZmlsbD0iIzhhOGE4YSIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1maWxsPSIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6IzVjNjI2NDsiPjwvcGF0aD48L3N2Zz4=')
}
@keyframes rotate {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
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
