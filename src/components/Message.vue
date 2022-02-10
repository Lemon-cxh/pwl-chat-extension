<template>
  <div>
    <el-row :class="[{ 'own-chat-item': isOwn }, 'chat-item']">
      <el-row
        :class="[{ 'own-avatar': isOwn }, 'avatar']"
        @click="$emit('showUserCard', message.userName)"
      >
        <el-avatar
          size="default"
          :id="'avatar_' + message.oId"
          :src="message.userAvatarURL"
        ></el-avatar>
        <img
          v-if="avatarPendant && avatarPendant.isChristmas"
          class="avatar-pendant"
          src="../../public/image/Christmas.png"
        />
      </el-row>
      <el-row :class="[{ 'own-chat': isOwn }, 'flex-column']" type="flex">
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
          @show-redpacket-info="showRedpacketInfo"
        />
        <!-- 内容消息 -->
        <div
          v-else
          :class="[
            isOwn ? 'own-content-background' : 'content-background',
            'message-content',
          ]"
        >
          <el-popover
            width="auto"
            placement="bottom"
            trigger="manual"
            v-model:visible="visible"
          >
            <template #reference>
              <span
                :id="'message_' + message.oId"
                v-html="message.content"
              ></span>
            </template>
            <!-- 消息菜单 -->
            <el-row class="flex-column menu">
              <el-row class="menu-item" @click="talkToHe">@他</el-row>
              <el-row class="menu-item" @click="quote">引用</el-row>
              <el-row
                v-if="message.md"
                class="menu-item"
                @click="$emit('sendMessage', message.md) && closePopover()"
                >+1</el-row
              >
              <el-row class="menu-item" v-show="imageUrl" @click="collectImages"
                >收藏表情</el-row
              >
              <el-row
                v-show="unlimitedRevoke || isOwn"
                class="menu-item"
                @click="$emit('revokeMessage', message) && closePopover()"
                >撤回</el-row
              >
            </el-row>
          </el-popover>
        </div>
        <el-row class="time">{{ getTime(message.time) }}</el-row>
      </el-row>
      <icon-svg
        v-if="message.users"
        class="plus-one"
        icon-class="plusOne"
        @click="$emit('sendMessage', message.md)"
      />
    </el-row>
    <!-- 多少人+1显示 -->
    <el-row
      v-if="message.users"
      type="flex"
      :class="[{'own-plus-one-box' : isOwn}, 'plus-one-box']"
    >
      <el-avatar
        v-for="(item, index) in message.users"
        :key="index"
        :src="item.userAvatarURL"
        :size="20"
        class="plus-one-avatar"
        @click="$emit('showUserCard', item.userName)"
      />
      <el-row
        :class="[{'own-plus-one-text': isOwn}, 'plus-one-text']"
        >{{ message.users.length }} 人+1
      </el-row>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isRedPacket } from '../utils/util'
import { getMd } from '../api/chat'

export default {
  name: 'message',
  props: {
    message: Object,
    date: String,
    unlimitedRevoke: Boolean,
    avatarPendant: Object,
  },
  emits: [
    'quote',
    'addContent',
    'collectImages',
    'showRedpacketInfo',
    'showUserCard',
    'sendMessage',
    'revokeMessage',
  ],
  data() {
    return {
      visible: false,
      imageUrl: '',
      userName: '',
      quoteForm: {
        oId: '',
        userName: '',
        md: '',
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
      return isRedPacket(this.message)
    },
  },
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
      this.userName = `@${message.userName} `
      this.quoteForm = {
        oId: message.oId,
        userName: message.userName,
        md: message.md,
        content: message.content,
      }
      this.imageUrl = imageUrl
      setTimeout(() => {
        this.visible = false
      }, 2000)
    },
    quote() {
      let form = this.quoteForm
      if (form.md) {
        this.$emit('quote', this.quoteForm)
        this.closePopover()
        return
      }
      getMd(form.oId).then((res) => {
        form.md = res.replace(/<!--.*?-->/g, '')
        this.$emit('quote', form)
        this.closePopover()
      })
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
      this.visible = false
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
.own-avatar {
  padding-left: 15px;
}
.avatar-pendant {
  position: absolute;
  top: -7px;
  right: 9px;
  width: 30px;
  height: 30px;
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
.message-content {
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
.content-background::after {
  content: '';
  position: absolute;
  top: 22px;
  left: -14px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-right: 8px solid #a3db92;
}
.own-content-background {
  background-color: #fffbe6;
}
.own-content-background::after {
  content: '';
  position: absolute;
  top: 22px;
  right: -14px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-left: 8px solid #fffbe6;
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
.plus-one-avatar {
  margin-left: -2px;
  box-shadow: -3px 3px 5px 1px rgb(0 0 0 / 40%);
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
.el-popover.el-popper {
  min-width: 0px;
}
.message-content * {
  max-width: 265px;
  overflow: auto;
}
</style>
