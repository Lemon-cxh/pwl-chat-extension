<template>
  <el-select
    v-model="selectedUsers"
    :multiple="multiple"
    filterable
    :allow-create="allowCreate"
    remote
    :style="{ width: width }"
    :placeholder="placeholder"
    :remote-method="remoteMethod"
    :loading="loading"
    @change="handleChange"
    :class="customClass"
  >
    <el-option
      v-for="item in list"
      :key="item.userName"
      :label="item.userName"
      :value="item.userName"
    >
      <el-row>
        <el-avatar v-if="showAvatar" :size="30" :src="item.userAvatarURL" />
        <img v-else class="option-image" :src="item.userAvatarURL" />
        <span :style="{ marginLeft: showAvatar ? '5px' : '10px' }">{{ item.userName }}</span>
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
  emits: ['change', 'update:user'],
  props: {
    user: {
      type: [Array, String],
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    allowCreate: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '396px'
    },
    placeholder: {
      type: String,
      default: '请输入用户名'
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      list: []
    }
  },
  computed: {
    selectedUsers: {
      get() {
        // 处理单选和多选两种情况
        if (this.multiple) {
          // 多选模式：确保user是数组
          return Array.isArray(this.user) ? this.user : (this.user ? [this.user] : [])
        } else {
          // 单选模式：如果user是数组，取第一个元素；否则直接返回user
          return Array.isArray(this.user) ? (this.user.length > 0 ? this.user[0] : '') : this.user
        }
      },
      set(val) {
        this.handleChange(val)
      }
    }
  },
  methods: {
    remoteMethod(query) {
      if (query === '') {
        return
      }
      this.loading = true
      getUserName({ name: query }).then((res) => {
        if (res.code === 0) {
          this.list = res.data
        }
        this.loading = false
      })
    },
    handleChange(val) {
      // 根据multiple属性决定发出什么类型的值
      if (this.multiple) {
        // 多选模式：始终发出数组
        this.$emit('change', val)
        this.$emit('update:user', val)
      } else {
        // 单选模式：如果val是数组，取第一个元素；否则直接发出val
        const value = Array.isArray(val) ? (val.length > 0 ? val[0] : undefined) : val
        this.$emit('change', value)
        this.$emit('update:user', value)
      }
    }
  }
}
</script>

<style scoped>
.option-image {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}
</style>
