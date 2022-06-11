<template>
  <div class="xiao-ice">
    <el-scrollbar height="96vh">
      <el-affix :offset="0">
        <el-input v-focus v-model="sendParams.msg" @keyup.enter="sendHandler" />
      </el-affix>
      <div class="message" v-for="item in message" :key="item.timeStamp">
        <span class="name">{{
          item.isSelf ? userInfo.userName : 'xiaoIce'
        }}</span>
        <span v-html="item.msg"></span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
var socket
export default {
  name: 'xiaoIce',
  props: {
    userInfo: Object,
  },
  data() {
    return {
      message: [],
      sendParams: {
        type: 'gameMsg',
        ck: '',
        msg: '',
      },
    }
  },
  created() {
    socket = new WebSocket('wss:game.yuis.cc/wss')
    socket.onmessage = (msg) => {
      let data = JSON.parse(msg.data)
      data.timeStamp = msg.timeStamp
      this.message.unshift(data)
      if (data.type === 'setCK') {
        this.sendParams.ck = data.ck
      }
    }
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'setUser',
          user: this.userInfo.userName,
        })
      )
    }
  },
  methods: {
    sendHandler() {
      this.message.unshift({
        msg: this.sendParams.msg,
        timeStamp: new Date().getTime(),
        isSelf: true,
      })
      let { ...data } = this.sendParams
      if (this.sendParams.msg.indexOf('登录 ') >= 0) {
        data.type = 'login'
      }
      socket.send(JSON.stringify(data))
      this.sendParams.msg = ''
    },
  },
}
</script>

<style scoped>
.xiao-ice {
  width: 300px;
}
.name {
  font-weight: bold;
  margin-right: 10px;
}
.message {
  margin: 3px;
}
.message p {
  margin: 0;
}
</style>
