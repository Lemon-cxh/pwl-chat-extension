<template>
  <el-popover
    placement="left-start"
    :width="220"
    :visible="redPacketDialogVisible"
    @show="redPacketHandler"
  >
    <template #reference>
      <icon-svg
        icon-class="redPacketBtn"
        @click="redPacketDialogVisible = !redPacketDialogVisible"
      />
    </template>
    <el-form
      ref="form"
      :rules="rules"
      :model="redPacketForm"
      size="small"
      class="form"
    >
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="redPacketForm.type"
          class="option"
          @change="redPacketTypeChange"
        >
          <el-option
            v-for="item in redPacketTypeArray"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="积分" prop="money">
        <el-input-number
          v-model="redPacketForm.money"
          :min="32"
        ></el-input-number>
      </el-form-item>
      <el-form-item
        v-if="
          'specify' !== redPacketForm.type &&
          'rockPaperScissors' !== redPacketForm.type
        "
        prop="count"
        label="个数"
      >
        <el-input-number
          v-model="redPacketForm.count"
          :min="1"
        ></el-input-number>
      </el-form-item>
      <el-form-item
        label="出拳"
        v-if="'rockPaperScissors' === redPacketForm.type"
        prop="gesture"
      >
        <el-radio-group v-model="redPacketForm.gesture">
          <el-radio :label="0">石头</el-radio>
          <el-radio :label="1">剪刀</el-radio>
          <el-radio :label="2">布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="专属"
        v-if="'specify' === redPacketForm.type"
        prop="recivers"
      >
        <user-select
          :user="redPacketForm.recivers"
          :multiple="false"
          class="option"
          placeholder="请输入关键词"
          @change="(val) => (redPacketForm.recivers = val)"
        />
      </el-form-item>
      <el-form-item label="内容" prop="msg">
        <el-input
          class="option"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          v-model.trim="redPacketForm.msg"
        ></el-input>
      </el-form-item>
      <el-form-item label-width="65px">
        <el-button type="primary" @click="sendRedPacket">发 送</el-button>
      </el-form-item>
    </el-form>
  </el-popover>
</template>

<script>
import { send } from '@/popup/api/chatroom'
import { mapGetters } from 'vuex'
import {
  RED_PACKET_TYPE,
  RED_PACKET_MAP,
  defaultType
} from '@/common/constant/RedPacketConstant'
import {
  inputRule,
  selectRule,
  numberRule
} from '@/common/constant/RuleConstant'
import UserSelect from '@/popup/components/UserSelect.vue'

export default {
  name: 'redPacket',
  components: {
    UserSelect
  },
  inject: ['$message'],
  data() {
    return {
      redPacketForm: {
        money: 32,
        count: RED_PACKET_MAP.get(defaultType).count,
        msg: RED_PACKET_MAP.get(defaultType).msg,
        type: defaultType,
        recivers: undefined,
        gesture: undefined
      },
      redPacketDialogVisible: false,
      redPacketTypeMap: RED_PACKET_MAP,
      redPacketTypeArray: RED_PACKET_TYPE,
      rules: {
        money: numberRule('积分'),
        count: numberRule('个数'),
        msg: inputRule('内容'),
        type: selectRule('类型'),
        recivers: selectRule('你的偏爱'),
        gesture: selectRule('出拳')
      }
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
    redPacketContent() {
      const redPacketForm = { ...this.redPacketForm }
      redPacketForm.recivers = redPacketForm.recivers
        ? [redPacketForm.recivers]
        : redPacketForm.recivers
      return {
        content: `[redpacket]${JSON.stringify(redPacketForm)}[/redpacket]`,
        apiKey: this.key
      }
    }
  },
  methods: {
    redPacketHandler() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    sendRedPacket() {
      this.validate(() => this.send())
    },
    validate(fun) {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        fun()
      })
    },
    send() {
      send(this.redPacketContent).then((res) => {
        if (res.code === 0) {
          this.redPacketDialogVisible = false
          return
        }
        this.$message.info(res.msg)
      })
    },
    handleUserChange(users) {
      // 由于UserSelect是多选的，我们只取第一个值
      this.redPacketForm.recivers =
        users && users.length > 0 ? users[0] : undefined
    }
  }
}
</script>

<style scoped>
.form {
  padding: 20px;
}
.option {
  width: 130px;
  color: white;
  align-items: center;
}
.option-image {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}
</style>
<style>
.el-select-dropdown {
  background-color: #333333;
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item.is-disabled:hover,
.el-select-dropdown__item:hover,
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected.hover,
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected {
  background-color: #8f8f8f;
}
</style>
