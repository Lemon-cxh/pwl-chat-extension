<template>
  <el-popconfirm
    title="修改话题需要16积分,将自动从账户中扣除"
    :visible="visible"
    @confirm="confirmEvent"
    @cancel="cancel()"
  >
    <template #reference>
      <el-input
        v-if="inputVisible"
        ref="inputRef"
        size="small"
        class="input"
        maxlength="16"
        v-model.trim="inputValue"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button-group class="input" v-else>
        <el-button
          :type="type"
          class="button"
          plain
          size="small"
          @click="showInput()"
        >
          #{{ discuss.content }}
        </el-button>
        <el-button :type="type" plain size="small" @click="changeDiscuss()">
          <comment class="svg-icon" />
        </el-button>
      </el-button-group>
    </template>
  </el-popconfirm>
</template>

<script>
import { Comment } from '@element-plus/icons-vue'
import { ObjectUtil } from '@/common/utils/ObjectUtil'
import { send } from '@/popup/api/chatroom'
import { mapGetters, mapMutations } from 'vuex'
/**
 * 话题组件
 */
export default {
  name: 'discuss-component',
  components: {
    Comment
  },
  emits: ['discussChange'],
  computed: {
    ...mapGetters(['key', 'discuss']),
    type() {
      return this.discuss.enable ? 'primary' : 'info'
    },
    form() {
      return {
        content: `[setdiscuss]${this.inputValue}[/setdiscuss]`,
        apiKey: this.key
      }
    }
  },
  data() {
    return {
      visible: false,
      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    ...mapMutations(['changeDiscuss']),
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.inputRef.focus()
      })
    },
    handleInputConfirm() {
      if (!ObjectUtil.isEmpty(this.inputValue)) {
        this.visible = true
        return
      }
      this.inputVisible = false
    },
    cancel() {
      this.visible = false
      this.inputVisible = false
      this.inputValue = ''
    },
    confirmEvent() {
      send(this.form).then(() => {
        this.cancel()
      })
    }
  }
}
</script>
<style scoped>
.input {
  max-width: 230px;
}
.button {
  padding-right: 3px;
  max-width: calc(100% - 36px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.button:hover {
    cursor: pointer;
    text-overflow: inherit;
    overflow: visible;
    white-space: pre-line;
}
</style>
