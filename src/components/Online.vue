<template>
  <el-popover placement="bottom" width="auto" trigger="click">
    <template #reference>
      <div tabindex="0" style="margin-right: 27px">
        <el-badge
          id="online-badge"
          type="success"
          :value="online.onlineChatCnt"
          :max="999"
          class="badge"
        >
          <icon-svg class="icon" icon-class="whale" />
        </el-badge>
      </div>
    </template>
    <el-row class="avatar-box">
      <el-avatar
        v-for="(item, index) in online.users"
        :key="index"
        :size="30"
        :src="item.userAvatarURL"
        class="avatar"
        @click="$emit('showUserCard', item.userName)"
      >
      </el-avatar>
    </el-row>
  </el-popover>
</template>

<script>
/**
 * 在线人数组件
 */
export default {
  name: 'online-component',
  props: {
    online: {
      type: Object,
      default() {
        return { onlineChatCnt: 0, users: [] }
      }
    }
  },
  emits: ['showUserCard'],
  data() {
    return {
      visible: false
    }
  }
}
</script>
<style scoped>
.icon {
  font-size: 30px;
  line-height: 30px;
}
.avatar-box {
  flex-wrap: wrap;
  max-height: 144px;
  max-width: 257px;
  overflow: auto;
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
