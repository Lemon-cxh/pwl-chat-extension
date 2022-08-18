<template>
  <div>
    <el-row :class="[{ 'own-chat-item': isOwn }, 'chat-item']">
      <el-row :class="[{ 'own-avatar': isOwn }, 'avatar']">
        <el-avatar
          :id="'avatar_' + message.oId"
          alt="avatar"
          size="default"
          :src="message.userAvatarURL"
          @click="$emit('showUserCard', message.userName)"
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
          :o-id="message.oId"
          :content="message.content"
          @show-redpacket-info="showRedpacketInfo"
        />
        <!-- 内容消息 -->
        <div
          v-else
          :class="[
            isOwn ? 'own-content-background' : 'content-background',
            'message-content'
          ]"
        >
          <el-popover
            width="auto"
            placement="bottom"
            trigger="manual"
            :visible="visible"
          >
            <template #reference>
              <span
                :id="'message_' + message.oId"
                v-html="modifyContent(message.content)"
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
      :class="[{ 'own-plus-one-box': isOwn }, 'plus-one-box']"
    >
      <el-avatar
        v-for="(item, index) in message.users"
        :key="index"
        :src="item.userAvatarURL"
        :size="20"
        alt="avatar"
        class="plus-one-avatar"
        @click="$emit('showUserCard', item.userName)"
      />
      <el-row :class="[{ 'own-plus-one-text': isOwn }, 'plus-one-text']"
        >{{ message.users.length }} 人+1
      </el-row>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isRedPacket } from '../utils/util'
import { getMd } from '../api/chat'
/**
 * 消息组件
 */
export default {
  name: 'message-component',
  props: {
    message: Object,
    date: String,
    unlimitedRevoke: Boolean,
    avatarPendant: Object
  },
  emits: [
    'quote',
    'addContent',
    'collectImages',
    'showRedpacketInfo',
    'showUserCard',
    'sendMessage',
    'revokeMessage'
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
        content: ''
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isOwn() {
      return this.userInfo.userName === this.message.userName
    },
    isRedPacket() {
      return isRedPacket(this.message)
    }
  },
  methods: {
    getTime(time) {
      if (time.indexOf(this.date) === -1) {
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
      const message = this.message
      this.userName = `@${message.userName} `
      this.quoteForm = {
        oId: message.oId,
        userName: message.userName,
        md: message.md,
        content: message.content
      }
      this.imageUrl = imageUrl
      setTimeout(() => {
        this.visible = false
      }, 2000)
    },
    quote() {
      const form = this.quoteForm
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
    modifyContent(content) {
      // <em><code># Yui女装呢 #</code></em>
      return content.replaceAll(
        /(<em><code>#\s)(.{1,16})(\s#<\/code><\/em>)/g,
        '<span class="el-tag" style="margin: 1px 0;">$2</span>'
      )
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
    }
  }
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
  color: #999999;
  margin-bottom: 2px;
}
.nick-name {
  font-weight: bold;
}
.user-name {
  margin-left: 5px;
}
.message-content {
  color: black;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
  width: fit-content;
  word-wrap: break-word;
  max-width: 265px;
  position: relative;
}
.content-background {
  background-color: #a3db92;
}
.content-background::after {
  content: '';
  position: absolute;
  top: 4px;
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
  top: 4px;
  right: -14px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-left: 8px solid #fffbe6;
}
.time {
  padding: 0 5px;
  color: #999999;
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
  margin-left: 12px;
}
</style>
<style>
.el-popover.el-popper {
  min-width: 0px;
}
.message-content * {
  max-width: 265px;
  overflow: auto;
  margin: 0px;
}
.message-content hr {
  margin: 3px 0;
}
.message-content blockquote {
  margin-top: 5px;
  border-left: 3px solid #6e6e6e;
  padding-left: 5px;
}
.message-content blockquote * {
  max-width: 257px;
}
.message-content iframe {
  border: none;
}
</style>
