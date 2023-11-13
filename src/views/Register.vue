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
      <el-form-item label="用户名" prop="userName">
        <el-input class="input" v-model.trim="form.userName" v-focus></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="userPhone">
        <el-input class="input" v-model.trim="form.userPhone"></el-input>
      </el-form-item>
      <el-form-item
        label="验证码"
        prop="captcha"
        v-if="!verify && !registerStatus"
      >
        <img class="captcha-img" :src="captchaUrl" @click="getCaptcha" />
        <el-input
          class="captcha-input"
          v-model.trim="form.captcha"
          placeholder="请输入验证码"
        >
        </el-input>
      </el-form-item>
      <el-form-item v-if="!verify && !registerStatus">
        <el-button type="primary" @click="onSubmit" class="button"
          >发送验证码</el-button
        >
      </el-form-item>
      <el-form-item label="短信验证码" prop="code" v-if="verify">
        <el-input class="input" placeholder="短信验证码" v-model.trim="code">
          <template #append>
            <el-button @click="onVerify">验证</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="密码" prop="userPassword" v-if="registerStatus">
        <el-input
          class="input"
          placeholder="密码"
          v-model.trim="form.userPassword"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item v-if="registerStatus">
        <el-radio-group v-model="form.userAppRole" style="margin-right: 30px">
          <el-radio label="0">程序员</el-radio>
          <el-radio label="1">设计师</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="registerStatus">
        <el-button type="primary" @click="onRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { register, verify, register2 } from '../api/register'
import md5 from 'js-md5'
export default {
  name: 'register-component',
  data() {
    return {
      captchaUrl: process.env.VUE_APP_BASE_URL + '/captcha',
      verify: false,
      registerStatus: false,
      code: '',
      form: {
        userName: '',
        userPhone: '',
        captcha: '',
        userId: '',
        userPassword: '',
        userAppRole: ''
      },
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        userPhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
        userPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },
  inject: ['$message'],
  methods: {
    getCaptcha() {
      this.captchaUrl =
        process.env.VUE_APP_BASE_URL + '/captcha?' + new Date().getTime()
    },
    onSubmit() {
      const data = { ...this.form }
      register(data).then((response) => {
        if (response.code !== 0) {
          this.$message.error(response.msg ? response.msg : response)
          this.getCaptcha()
          return
        }
        this.verify = true
      })
    },
    onVerify() {
      verify(this.code).then((response) => {
        if (response.code !== 0) {
          this.$message.error(response.msg ? response.msg : response)
          return
        }
        this.form.userId = response.userId
        this.registerStatus = true
        this.verify = false
      })
    },
    onRegister() {
      const that = this
      this.$refs.form.validate(async (v) => {
        if (!v) {
          return
        }
        const noHashedPassword = that.form.userPassword
        that.form.userPassword = md5(noHashedPassword)
        // iwpz: 桥接form body
        const userInfo = {
          userId: that.form.userId,
          userPassword: that.form.userPassword,
          userAppRole: that.form.userAppRole
        }
        register2(userInfo).then((response) => {
          if (response.code !== 0) {
            that.$message.error(response.msg ? response.msg : response)
            return
          }
          that.$router.push({
            name: 'Login',
            params: {
              nameOrEmail: that.form.userName,
              userPassword: noHashedPassword
            }
          })
        })
      })
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
.captcha-img {
  display: inline-block;
  width: 100px;
  height: 30px;
  left: 1px;
  border-radius: 3px 0 0 3px;
}
.captcha-input {
  display: inline-block;
  width: 150px;
}
.input {
  width: 250px;
}
.button {
  margin-left: 108px;
}
.center {
  margin-bottom: 50px;
  align-self: center;
}
</style>
