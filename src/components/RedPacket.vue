<template>
  <el-popover
    placement="left-start"
    :width="220"
    v-model:visible="redPacketDialogVisible"
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
        <el-select
          v-model="redPacketForm.recivers"
          class="option"
          filterable
          remote
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="userListLoading"
        >
          <el-option
            v-for="item in userList"
            :key="item.userName"
            :label="item.userName"
            :value="item.userName"
          >
            <el-row class="option" type="flex">
              <img class="option-image" :src="item.userAvatarURL" />
              <span class="option-text">{{ item.userName }}</span>
            </el-row>
          </el-option>
        </el-select>
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
import { send } from '../api/chat'
import { getUserName } from '../api/user'
import { mapGetters } from 'vuex'
import {
  redPacketTypeMap,
  redPacketTypeArray,
  defaultType,
} from '../constant/RedPacketConstant'
import { inputRule, selectRule, numberRule } from '../constant/RuleConstant'
/**
 * 发送红包组件
 */
export default {
  name: 'redPacket',
  inject: ['$message'],
  data() {
    return {
      redPacketForm: {
        money: 32,
        count: redPacketTypeMap.get(defaultType).count,
        msg: redPacketTypeMap.get(defaultType).msg,
        type: defaultType,
        recivers: undefined,
        gesture: undefined,
      },
      redPacketDialogVisible: false,
      redPacketTypeMap: redPacketTypeMap,
      redPacketTypeArray: redPacketTypeArray,
      userList: [],
      userListLoading: false,
      rules: {
        money: numberRule('积分'),
        count: numberRule('个数'),
        msg: inputRule('内容'),
        type: selectRule('类型'),
        recivers: selectRule('你的偏爱'),
        gesture: selectRule('出拳'),
      },
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
    redPacketContent() {
      let redPacketForm = this.redPacketForm
      redPacketForm.recivers = redPacketForm.recivers
        ? [redPacketForm.recivers]
        : redPacketForm.recivers
      return {
        content: `[redpacket]${JSON.stringify(redPacketForm)}[/redpacket]`,
        apiKey: this.key,
      }
    },
  },
  methods: {
    redPacketHandler() {
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    },
    sendRedPacket() {
      this.validate(() => this.send())
    },
    validate(fun) {
      this.$refs['form'].validate((valid) => {
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
    remoteMethod(query) {
      if (query === '') {
        return
      }
      this.userListLoading = true
      getUserName({ name: query }).then((res) => {
        this.userList = res.data
        this.userListLoading = false
      })
    },
    redPacketTypeChange(value) {
      let map = redPacketTypeMap.get(value)
      this.redPacketForm.count = map.count
      this.redPacketForm.msg = map.msg
      this.redPacketForm.recivers = undefined
      this.redPacketForm.gesture = value === 'rockPaperScissors' ? 0 : undefined
    },
  },
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
