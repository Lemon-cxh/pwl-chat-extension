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
.content-background .chrome-extension-message::after {
  content: "";
  width: 12px;
  height: 12px;
  position: absolute;
  bottom: 0px;
  right: -16px;
  background-size: cover;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB0PSIxNjQ2OTg3MDAwMjM5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjcwNDgiIGRhdGEtZGFya3JlYWRlci1pbmxpbmUtZmlsbD0iIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+PHBhdGggZD0iTTI1OC4wMTYgNDQ3LjAwOEwxMTIgMTkyLjk5MlExODMuMDA4IDEwMi45NzYgMjg4IDUxLjQ4OFQ1MTIgMHExMzguMDE2IDAgMjU1LjQ4OCA2OHQxODUuNTA0IDE4My4wMDhINTM0Ljk3NnEtMTEuMDA4LTAuOTkyLTIzLjAwOC0wLjk5Mi05MC4wMTYgMC0xNjAuOTkyIDU1LjQ4OHQtOTIuOTkyIDE0MS41MDR6IG00MzYuOTkyLTEyMi4wMTZoMjk0LjAxNnEzNS4wMDggOTAuMDE2IDM1LjAwOCAxODcuMDA4IDAgMTAzLjAwOC00MCAxOTcuNTA0dC0xMDcuNDg4IDE2My4wMDgtMTYxLjUwNCAxMDkuNTA0LTE5Ni45OTIgNDIuMDE2bDIwOC45OTItMzYzLjAwOHE0Ny4wMDgtNjcuMDA4IDQ3LjAwOC0xNDguOTkyIDAtMTEwLjAxNi03OS4wMDgtMTg3LjAwOHpNMzI2LjAxNiA1MTJxMC03Ni45OTIgNTQuNDk2LTEzMS40ODhUNTEyIDMyNi4wMTZ0MTMxLjQ4OCA1NC40OTZUNjk3Ljk4NCA1MTJ0LTU0LjQ5NiAxMzEuNDg4VDUxMiA2OTcuOTg0dC0xMzEuNDg4LTU0LjQ5NlQzMjYuMDE2IDUxMnogbTI1NiAyNTIuOTkybC0xNDYuMDE2IDI1Mi45OTJxLTEyMi4wMTYtMTguMDE2LTIyMi4wMTYtODguOTkydC0xNTYuOTkyLTE4MC45OTJUMCA1MTJxMC0xMzUuMDA4IDY2LjAxNi0yNTEuMDA4bDIwOC45OTIgMzYyLjAxNnEzMiA2OCA5NiAxMDkuNTA0VDUxMiA3NzQuMDE2cTM2IDAgNzAuMDE2LTguOTkyeiIgcC1pZD0iNzA0OSIgZmlsbD0iIzhhOGE4YSIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1maWxsPSIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6IzVjNjI2NDsiPjwvcGF0aD48L3N2Zz4=')
}
.content-background .edge-extension-message::after {
  content: "";
  width: 12px;
  height: 12px;
  position: absolute;
  bottom: 0px;
  right: -16px;
  background-size: cover;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB0PSIxNjQ3MjIwNTcwMzc1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIyNjUiIGRhdGEtZGFya3JlYWRlci1pbmxpbmUtZmlsbD0iIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+PHBhdGggZD0iTTk2My44NCAyNjguOTZDODgxLjc0IDEwOC4zNiA3MDQuNTIgMTYgNTExLjgyIDE2IDI3NC4xIDE2IDc1LjAyIDE4My4zNiAyNi45NCA0MDcuMzJjNTItOTIuOTggMTcyLjQ0LTE1OC4yOCAyOTguOTItMTU4LjI4IDE1OC41NCAwIDI0Mi4xOCA5Ny44NiAyNDQuNSAxMDAuMzYgNDQgNDcuNiA2NiAxMDAuNzggNjYgMTY2LjIgMCAyMC44LTEwLjYyIDUxLjY0LTMwLjIyIDc3LjE0LTMuMTQgNC0xMi43OCA5LjY4LTEyLjc4IDIyIDAgMTAuMTIgNi41OCAxOS44NCAxOC4yOCAyOCA1NS43MiAzOC43NCAxNjAuNzQgMzMuNjIgMTYxLjAyIDMzLjYyQTIzMC43OCAyMzAuNzggMCAwIDAgODg5Ljg4IDY0NGEyMzcuODQgMjM3Ljg0IDAgMCAwIDExNy45LTIwNC44OGMxLTg2Ljg2LTMxLTE0NC42LTQzLjk0LTE3MC4xNnpNNDI1LjU0IDk1MS4zNGEzMDkuNzYgMzA5Ljc2IDAgMCAxLTkzLjI4LTkwYy02NS44OC05NC44NC02OC40OC0xOTEuMi00MC4yLTI3MkEzMTEgMzExIDAgMCAxIDQwNiA0MzEuNWMxMTgtOTAuNCAxODkuNjgtMTEuMyAxOTguMTItMmExNjAgMTYwIDAgMCAwLTkuNzgtMjAuMjhjLTE4LjQ4LTMxLjg2LTQ4LTcyLjgyLTExMy4xMi0xMDcuMDItNjcuNDQtMzUuMzgtMTQxLjE4LTM3LjE4LTE1NS4yOC0zNy4xOC03Ny40MiAwLTE1NS44IDI2LTIxNS4wNiA3MS4zOEM3MS4zNiAzNjYuNiAyNS41NCA0MTcuNDQgMTcuMiA0ODZjLTIuMTYgMjQuNjItNS41IDEyNS42IDQ2IDIzNi41NGE0OTYgNDk2IDAgMCAwIDQ5Ni42IDI4My4yMmMtNzYuMjQtMTMuMjQtMTMxLjctNTMuMjgtMTM0LjI2LTU0LjQyeiBtNTAxLjQ0LTE5Ni42NmExNS41MiAxNS41MiAwIDAgMC0xNS44NC0wLjQ2IDM2My4zMiAzNjMuMzIgMCAwIDEtNDAuODIgMTguMjQgMzk1LjA4IDM5NS4wOCAwIDAgMS0xMzkuMSAyNS4wNGMtMTgzLjM0IDAtMzQzLjA0LTEyNi4xMi0zNDMuMDQtMjg4YTEyMi4yNCAxMjIuMjQgMCAwIDEgMTMuMDQtNTMuNSAzMzcuNDQgMzM3LjQ0IDAgMCAwLTc3LjUyIDEwMGMtMjkuODQgNTguNzQtNjYgMTc2LjI2IDI2LjY2IDMwMy4zMiAxMy4wMiAxNy44MiA0NiA2MCAxMTIgOTUuMzQgNDcuMTQgMjUuMyA5OCAzOS4yMiAxNDMuNCAzOS4yMiA3MC4yOCAwIDIzMC44Ni02Ni44OCAzMjYtMjE3Ljc0YTE1LjUgMTUuNSAwIDAgMC00Ljc4LTIxLjQ2eiIgcC1pZD0iMjI2NiIgZmlsbD0iIzhhOGE4YSIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1maWxsPSIiIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLWZpbGw6IzVjNjI2NDsiPjwvcGF0aD48L3N2Zz4=')
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
