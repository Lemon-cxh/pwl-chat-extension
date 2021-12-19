<template>
  <el-row class="avatar">
    <el-dropdown trigger="click">
      <el-badge :value="unreadCount"
                :hidden="unreadCount == 0">
        <el-avatar :src="userInfo.userAvatarURL"></el-avatar>
      </el-badge>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="openNotifications">
          通知
          <el-badge :value="unreadCount"
                    :hidden="unreadCount == 0" />
        </el-dropdown-item>
        <el-dropdown-item @click.native="logout">
          登出
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-row>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { countNotifications, makeReadAtNotifications } from "../api/user";
import { STORAGE } from "../constant/Constant";
import { setLocal } from "../utils/chromeUtil";

export default {
  name: "userInfo",
  data() {
    return {
      unreadCount: 0,
    };
  },
  computed: {
    ...mapGetters(["userInfo", "key"]),
    apiKey() {
      return { apiKey: this.key };
    },
  },
  created() {
    this.countNotifications();
  },
  methods: {
    ...mapMutations(["clearMessage"]),
    countNotifications() {
      countNotifications(this.apiKey).then((res) => {
        if (0 !== res.code) {
          return;
        }
        this.unreadCount = res.unreadNotificationCnt - res.unreadAtNotificationCnt;
        if (res.unreadAtNotificationCnt > 0) {
          makeReadAtNotifications(this.apiKey).then()
        }
      });
    },
    openNotifications() {
      window.open(process.env.VUE_APP_BASE_URL + "/notifications/commented");
    },
    logout() {
      chrome.extension.getBackgroundPage().closeSocket();
      setLocal({ [STORAGE.key]: "" });
      this.clearMessage();
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style scoped>
.avatar {
  width: 60px;
  height: 40px;
  margin-right: 5px;
}
</style>
<style>
.el-dropdown-menu {
  background-color: #333333;
  color: white;
}
.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: #8f8f8f;
}
</style>