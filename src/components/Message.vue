<template>
  <div>
    <el-row type="flex" :class="(isOwn ? 'own-chat-item ' : '') + 'chat-item'">
      <el-row class="avatar">
        <el-avatar
          :id="'avatar_' + message.oId"
          :src="message.userAvatarURL"
          @click.native="$emit('showUserCard', message.userName)"
        ></el-avatar>
      </el-row>
      <el-row :class="(isOwn ? 'own-chat ' : '') + 'flex-column'" type="flex">
        <el-row class="name">
          <span class="nick-name">{{ message.userNickname }}</span>
          <span :class="message.userNickname ? 'user-name' : 'nick-name'">{{
            message.userName
          }}</span>
        </el-row>
        <!-- 红包消息 -->
        <red-packet-message
          v-if="isRedPacket"
          :oId="message.oId"
          :content="message.content"
          @showRedpacketInfo="showRedpacketInfo"
        />
        <!-- 内容消息 -->
        <div
          v-else
          :class="
            (isOwn ? 'own-content-background' : 'content-background') +
            ' content'
          "
        >
          <el-popover
            :ref="'popover_' + message.oId"
            placement="bottom"
            trigger="manual"
            v-model="visible"
          >
            <!-- 消息菜单 -->
            <el-row type="flex" class="flex-column menu">
              <el-row class="menu-item" @click.native="talkToHe">@他</el-row>
              <el-row class="menu-item" @click.native="quote">引用</el-row>
              <el-row class="menu-item" @click.native="plusOne">+1</el-row>
              <el-row
                class="menu-item"
                v-show="imageUrl"
                @click.native="collectImages"
                >收藏表情</el-row
              >
            </el-row>
            <span
              :id="'message_' + message.oId"
              slot="reference"
              v-html="message.content"
            ></span>
          </el-popover>
        </div>
        <el-row class="time">{{ getTime(message.time) }}</el-row>
      </el-row>
      <icon-svg v-if="message.users" class="plus-one" icon-class="plusOne" @click.native="plusOne"/>
    </el-row>
    <!-- 多少人+1显示 -->
    <el-row v-if="message.users" type="flex" :class="isOwn ? 'own-plus-one-box plus-one-box': 'plus-one-box'">
      <el-avatar
        v-for="(item, index) in message.users"
        :key="index"
        :src="item.userAvatarURL"
        :size="20"
        class="plus-opne-avatar"
      />
      <el-row :class="isOwn ? 'plus-one-text own-plus-one-text ' : 'plus-one-text'">{{message.users.length}} 人+1 </el-row>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RedPacketMessage from './RedPacketMessage.vue'

export default {
  name: 'message',
  props: {
    message: Object,
    date: String,
  },
  data() {
    return {
      visible: false,
      imageUrl: '',
      userName: '',
      quoteForm: {
        userName: '',
        content: '',
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isOwn() {
      return this.userInfo.userName === this.message.userName
    },
    isRedPacket() {
      return (
        this.message.content &&
        -1 !== this.message.content.indexOf('msgType":"redPacket')
      )
    },
  },
  components: { RedPacketMessage },
  methods: {
    getTime(time) {
      if (-1 === time.indexOf(this.date)) {
        return time
      }
      return time.slice(11)
    },
    showMessageMenu(imageUrl) {
      if (this.visible) {
        this.visible = false
        return
      }
      this.visible = true
      let message = this.message
      this.userName = '@' + message.userName + ' '
      this.quoteForm = {
        userName: message.userName,
        content: message.md ? message.md : message.content,
      }
      this.imageUrl = imageUrl
      setTimeout(() => {
        this.visible = false
      }, 2000)
    },
    plusOne() {
      this.$emit('sendMessage', this.message.md)
    },
    quote() {
      this.$emit('quote', this.quoteForm)
      this.closePopover()
    },
    talkToHe() {
      this.$emit('addContent', this.userName)
      this.closePopover()
    },
    collectImages() {
      this.$emit('collectImages', this.imageUrl)
      this.closePopover()
    },
    closePopover() {
      this.$refs['popover_' + this.message.oId].doClose()
    },
    showRedpacketInfo(info) {
      this.$emit('showRedpacketInfo', info)
    },
  },
}
</script>

<style scoped>
.chat-item {
  margin: 10px 0;
}
.own-chat-item {
  flex-direction: row-reverse;
}
.avatar {
  padding: 5px;
  width: 60px;
}
.flex-column {
  flex-direction: column;
}
.own-chat {
  align-items: flex-end;
}
.name {
  color: white;
  margin-bottom: 2px;
}
.nick-name {
  font-weight: bold;
}
.user-name {
  margin-left: 5px;
}
.content {
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
  width: fit-content;
  word-wrap: break-word;
  max-width: 265px;
}
.content-background {
  background-color: #a3db92;
}
.own-content-background {
  background-color: white;
}
.time {
  padding: 0 5px;
  color: white;
}
.menu {
  text-align: center;
}
.menu-item {
  height: 25px;
  line-height: 25px;
}
.plus-one-box {
  margin: -10px 60px 0 60px;
  max-width: 265px;
  align-self: center;
  flex-wrap: wrap;
}
.own-plus-one-box {
  flex-direction: row-reverse;
}
.plus-opne-avatar {
  margin-left: -2px;
  order: 10;
}
.plus-one-text {
  margin: 0 5px;
  line-height: 20px;
  color: white;
  font-size: 14px;
  order: 10;
}
.own-plus-one-text {
  order: 0;
}
.plus-one {
  font-size: 26px;
  color: yellow;
  align-self: center;
}
</style>
<style>
.el-popover {
  min-width: 0px;
}
iframe {
  max-width: 255px;
}
</style>
