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
          src="@/../public/image/Christmas.png"
        />
      </el-row>
      <el-row
        :class="[{ 'own-chat': isOwn }, 'flex-column']"
        type="flex"
        style="max-width: calc(100% - 120px)"
      >
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
          :is-own="isOwn"
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
        <el-row class="footer">
          <span>{{ getTime(message.time) }}</span>
          <via v-if="!isOwn" :client="message.client" />
        </el-row>
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
      v-if="message.users?.length > 0"
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
import { isRedPacket } from '@/common/utils/util'
import { getMd } from '@/common/api/chatroom'
import { formatContent } from '@/common/utils/contentUtil'
/**
 * 消息组件
 */
export default {
  name: 'message-component',
  props: {
    message: Object,
    date: String,
    unlimitedRevoke: {
      type: Boolean,
      default: false
    },
    avatarPendant: Object,
    hideBlockquote: {
      type: Boolean,
      default: false
    }
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
      return formatContent(content, this.hideBlockquote)
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
  content: "";
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
  content: "";
  position: absolute;
  top: 4px;
  right: -14px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-left: 8px solid #fffbe6;
}
.footer {
  padding: 0 5px;
  color: #999999;
  display: flex;
  align-items: center;
  height: 16px;
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
.message-content img[alt="图片表情"] {
  max-width: 100%;
}
.message-content * {
  max-width: 100%;
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
  max-width: 100%;
}
.message-content iframe {
  border: none;
}

/* 音乐卡片样式 */
.music-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 12px;
  padding: 12px;
  margin: 8px 0;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.music-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.music-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.music-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.music-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.music-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  flex: 1;
}

.music-card audio {
  width: 100%;
}

/* 新天气卡片样式 */
.weather-card-2 {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 18px 12px 12px 12px;
  margin: 10px auto;
  max-width: 340px;
  text-align: center;
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}
.weather-city-2 {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.weather-status-2 {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}
.weather-forecast-2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
}
.weather-day-2 {
  flex: 1;
  margin: 0 2px;
  background: none;
  border-radius: 8px;
  padding: 0 2px;
}
.weather-date-2 {
  font-size: 13px;
  color: #888;
  margin-bottom: 2px;
}
.weather-icon-2 {
  font-size: 28px;
  margin-bottom: 2px;
}
.weather-desc-2 {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}
.weather-temp-max-2 {
  font-size: 15px;
  color: #f56c6c;
  font-weight: 600;
}

.weather-temp-min-2 {
  font-size: 13px;
  color: #409eff;
}

.weather-svg-2 {
  margin: 0 auto;
  width: 180px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.weather-svg-2 svg {
  width: 180px;
  height: 40px;
  display: block;
}
</style>
