<template>
  <el-select
    v-model="userList"
    multiple
    filterable
    allow-create
    remote
    style="width: 396px"
    placeholder="请输入用户名"
    :remote-method="remoteMethod"
    :loading="loading"
    @change="change"
  >
    <el-option
      v-for="item in list"
      :key="item.userName"
      :label="item.userName"
      :value="item.userName"
    >
      <el-row>
        <el-avatar :size="30" :src="item.userAvatarURL" />
        <span style="margin-left: 5px">{{ item.userName }}</span>
      </el-row>
    </el-option>
  </el-select>
</template>

<script>
import { getUserName } from '@/popup/api/user'
/**
 * 用户名联想的用户列表
 */
export default {
  name: 'user-select',
  emits: ['change'],
  props: {
    user: Array
  },
  data() {
    return {
      userList: this.user,
      loading: false,
      list: []
    }
  },
  methods: {
    remoteMethod(query) {
      getUserName({ name: query }).then((res) => {
        if (res.code === 0) {
          this.list = res.data
        }
      })
    },
    change() {
      this.$emit('change', this.userList)
    }
  }
}
</script>
