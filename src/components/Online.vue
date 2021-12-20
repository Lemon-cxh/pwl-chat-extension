<template>

  <el-popover placement="bottom"
              width="288"
              trigger="manual"
              v-model="visible">
    <el-row type="flex"
            class="avatar-box">
      <el-avatar class="avatar"
           v-for="(item, index) in online.users"
           :key="index"
           :size="30"
           :src="item.userAvatarURL"
           @click.native="showUserCard(item.userName)">
      </el-avatar>
    </el-row>
    <el-badge slot="reference" id="online-badge"
              type="success"
              :value="online.onlineChatCnt"
              class="badge">
      <icon-svg 
                class="icon"
                @click.native="visible = !visible"
                icon-class="whale" />
    </el-badge>
  </el-popover>
</template>

<script>
export default {
  name: "online",
  props: {
    online: {
      type: Object,
      default() {
        return { onlineChatCnt: 0, users: [] };
      },
    },
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    showUserCard(userName) {
      this.$emit("showUserCard", userName);
    },
  }
};
</script>
<style scoped>
.icon {
  font-size: 30px;
  line-height: 30px;
}
.avatar-box {
  flex-wrap: wrap;
  max-height: 144px;
  overflow: auto
}
.avatar {
  margin: 3px;
}
</style>
<style>
#online-badge .el-badge__content.is-fixed {
  top: 15px;
  right: 0px;
}
</style>