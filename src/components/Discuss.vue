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
      <el-button-group v-else>
        <el-button
          :type="type"
          plain
          size="small"
          @click="showInput()"
          style="padding-right: 3px"
        >
          #{{ discuss.content }}
        </el-button>
        <el-button :type="type" plain size="small" @click="click()">
          <comment class="svg-icon" />
        </el-button>
      </el-button-group>
    </template>
  </el-popconfirm>
</template>

<script>
import { Comment } from '@element-plus/icons-vue'
import { ObjectUtil } from '../utils/ObjectUtil'
import { send } from '../api/chat'
import { mapGetters } from 'vuex'

export default {
  name: 'discuss',
  components: {
    Comment,
  },
  emits: ['discussChange'],
  props: {
    discuss: {
      type: Object,
      default() {
        return { content: '', enable: false }
      },
    },
  },
  computed: {
    ...mapGetters(['key']),
    type() {
      return this.discuss.enable ? 'primary' : 'info'
    },
    form() {
      return {
        content: `[setdiscuss]${this.inputValue}[/setdiscuss]`,
        apiKey: this.key,
      }
    },
  },
  data() {
    return {
      visible: false,
      inputVisible: false,
      inputValue: '',
    }
  },
  methods: {
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
    },
    click() {
      this.$emit('discussChange')
    },
  },
}
</script>
<style scoped>
.input {
  max-width: 200px;
}
</style>
