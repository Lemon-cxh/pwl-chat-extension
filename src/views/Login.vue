<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" class="form">
      <img class="center" width="100px" src="icons/128.png"/>
      <el-form-item label="用户名" prop="nameOrEmail">
        <el-input class="input" v-model.trim="form.nameOrEmail" ref="nameOrEmail"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="userPassword">
        <el-input class="input" v-model.trim="form.userPassword" @keyup.enter.native="onSubmit" ref="userPassword" show-password></el-input>
      </el-form-item>
      <el-form-item label-width="140px">
        <el-button type="info" @click="register">注册</el-button>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getKey, getUserInfo } from '../api/login'
import { mapMutations } from 'vuex'
import md5 from 'js-md5'
import { setLocal, getLocal } from "../utils/chromeUtil"
import { STORAGE } from '../constant/Constant'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        nameOrEmail: '',
        userPassword: '',
      },
      rules: {
        nameOrEmail: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        userPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    let that = this;
    getLocal([STORAGE.nameOrEmail], function (result) {
      if (result[STORAGE.nameOrEmail]) {
        that.form.nameOrEmail = result[STORAGE.nameOrEmail];
        that.$refs.userPassword.focus()
        return
      }
      that.$refs.nameOrEmail.focus()
    })
  },
  methods: {
    ...mapMutations(['setUserInfo', 'setKey']),
    onSubmit() {
      let data = { ...this.form }
      data.userPassword = md5(data.userPassword)
      getKey(data).then((response) => {
        if (response.code !== 0) {
          this.$message.error(response.msg)
          return
        }
        getUserInfo({ apiKey: response.Key }).then((res) => {
          if (0 !== res.code) {
            this.$message.error(res)
            return
          }
          this.setKey(response.Key)
          this.setUserInfo(res.data)
          setLocal({ [STORAGE.key]: response.Key, [STORAGE.nameOrEmail]: this.form.nameOrEmail })
          chrome.extension.getBackgroundPage().openSocket();
          this.$router.push({name: 'ChatRoom'})
        })
      })
    },
    register() {
      window.open(process.env.VUE_APP_BASE_URL + '/register?r=Lemon');
    }
  },
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
  align-self: center;
}
</style>