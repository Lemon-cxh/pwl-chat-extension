<template>
  <el-row type="flex"
          :class="(isOwn ? 'own-chat-item ' : '') + 'chat-item'">
    <el-row class="avatar">
      <el-avatar :id="'avatar_' + message.oId"
                 :src="message.userAvatarURL"
                 @click.native="showUserCard"></el-avatar>
    </el-row>
    <el-row :class="(isOwn ? 'own-chat ' : '') + 'flex-column'"
            type="flex">
      <el-row class="name">
        <span class="nick-name">{{ message.userNickname}}</span>
        <span :class="message.userNickname ? 'user-name' : 'nick-name'">{{message.userName}}</span>
      </el-row>
      <red-packet-message v-if="isRedPacket"
                          :oId="message.oId"
                          :content="message.content" 
                          @showRedpacketInfo="showRedpacketInfo"/>
      <div v-else
           :class="(isOwn ? 'own-content-background' : 'content-background') + ' content'">
        <el-popover :ref="'popover_' + message.oId"
                    placement="bottom"
                    v-model="visible">
          <el-row type="flex"
                  class="flex-column menu">
            <el-row class="menu-item"
                    @click.native="talkToHe">@他</el-row>
            <el-row class="menu-item"
                    @click.native="quote">引用</el-row>
            <el-row class="menu-item"
                    v-show="isImage"
                    @click.native="collectImages">收藏表情</el-row>
          </el-row>
          <span :id="'message_' + message.oId"
                slot="reference"
                v-html="message.content"
                @click="messageHandler($event)"></span>
        </el-popover>
      </div>
      <el-row class="time">{{ getTime(message.time) }}</el-row>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from "vuex";
import RedPacketMessage from "./RedPacketMessage.vue";

export default {
  name: "message",
  props: {
    message: Object,
    date: String,
  },
  data() {
    return {
      visible: false,
      isImage: false,
      imageUrl: "",
      userName: "",
      quoteForm: {
        userName: "",
        content: "",
      },
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    isOwn() {
      return this.userInfo.userName === this.message.userName;
    },
    isRedPacket() {
      return this.message.content && -1 !== this.message.content.indexOf('msgType":"redPacket');
    }
  },
  components: { RedPacketMessage },
  mounted() {
    this.setContextmenu()
  },
  renderTriggered() {
    this.setContextmenu()
  },
  methods: {
    setContextmenu() {
      let message = this.message;
      if (this.isOwn || this.isRedPacket) {
        return;
      }
      let that = this;
      document.getElementById("message_" + message.oId).oncontextmenu = (e) => {
        that.visible = true;
        if (e.target.nodeName === "IMG" && e.target.className !== "emoji") {
          that.isImage = true;
          that.imageUrl = e.target.currentSrc;
        }
        this.userName = "@" + message.userName + " ";
        this.quoteForm = {
          userName: message.userName,
          content: message.md,
        };
        return false;
      };
    },
    getTime(time) {
      if (-1 === time.indexOf(this.date)) {
        return time;
      }
      return time.slice(11);
    },
    messageHandler(event) {
      if (
        event.target.tagName !== "IMG" ||
        event.target.className === "emoji"
      ) {
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let message = {
          src: event.target.src,
          width: event.target.naturalWidth,
          height: event.target.naturalHeight,
        };
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
    },
    quote() {
      this.$emit("quote", this.quoteForm);
      this.closePopover()
    },
    talkToHe() {
      this.$emit("talkToHe", this.userName);
      this.closePopover()
    },
    collectImages() {
      this.$emit("collectImages", this.imageUrl);
      this.closePopover()
    },
    showUserCard() {
      this.$emit("showUserCard", this.message.userName);
    },
    closePopover() {
      this.$refs['popover_' + this.message.oId].doClose();
    },
    showRedpacketInfo(info) {
      this.$emit('showRedpacketInfo', info)
    }
  },
};
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
  max-width: 100%;
  width: fit-content;
  word-wrap: break-word;
  max-width: 310px;
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
</style>
<style>
.el-popover {
  min-width: 0px;
}
</style>