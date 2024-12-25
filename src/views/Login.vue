<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="form"
    >
      <img class="center" width="200" src="icons/logo.png" />
      <el-form-item label="用户名" prop="nameOrEmail">
        <el-input
          class="input"
          v-model.trim="form.nameOrEmail"
          v-focus
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="userPassword">
        <el-input
          class="input"
          v-model.trim="form.userPassword"
          @keyup.enter="onSubmit"
          ref="userPassword"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="两步验证码" prop="mfaCode">
        <el-input
          class="input"
          v-model.trim="form.mfaCode"
          @keyup.enter="onSubmit"
          placeholder="未开启请留空"
        ></el-input>
      </el-form-item>
      <el-form-item label-width="140px">
        <el-button type="info" @click="register">注册</el-button>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getKey } from '../api/login'
import { mapMutations } from 'vuex'
import md5 from 'js-md5'
import { setLocal, getLocal } from '../utils/chromeUtil'
import { STORAGE, EVENT } from '../constant/Constant'

export default {
  name: 'login-component',
  data() {
    return {
      form: {
        nameOrEmail: '',
        userPassword: '',
        mfaCode: ''
      },
      rules: {
        nameOrEmail: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        userPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  inject: ['$message'],
  created() {
    const that = this

    const name = this.$route.params.nameOrEmail
    const password = this.$route.params.userPassword
    if (name != null && password != null) {
      that.form.nameOrEmail = name
      that.form.userPassword = password
      return
    }

    getLocal([STORAGE.account], function (result) {
      if (result[STORAGE.account]) {
        that.form.nameOrEmail = result[STORAGE.account].nameOrEmail
        that.$refs.userPassword.focus()
      }
    })
  },
  methods: {
    ...mapMutations(['setUserInfo', 'setKey']),
    onSubmit() {
      const data = { ...this.form }
      data.userPassword = md5(data.userPassword)
      getKey(data).then((response) => {
        if (response.code !== 0) {
          this.$message.error(response.msg ? response.msg : response)
          return
        }
        this.setKey(response.Key)
        setLocal({
          [STORAGE.key]: response.Key,
          [STORAGE.account]: data
        })
        /* global chrome */
        chrome.runtime.sendMessage({ type: EVENT.LOGIN })
        this.$router.push({ name: 'ChatRoom' })
      })
    },
    register() {
      this.$router.push({ name: 'Register' })
    }
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}
.input {
  width: 250px;
}
.center {
  margin-bottom: 50px;
  align-self: center;
}
</style>
