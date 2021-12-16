<template>
  <el-row type="flex"
          :class="(isOwn ? 'own-chat-item ' : '') + 'chat-item'">
    <el-row class="avatar">
      <el-avatar :src="message.userAvatarURL" @click.native="showUserCard"></el-avatar>
    </el-row>
    <el-row :class="(isOwn ? 'own-chat ' : '') + 'chat'"
            type="flex">
      <el-row class="name">{{ message.userNickname }}({{ message.userName }})</el-row>
      <red-packet v-if="isRedPacket(message.content)"
                  :oId="message.oId"
                  :content="message.content" />
      <div v-else
           :class="(isOwn ? 'own-content-background' : 'content-background') + ' content'">
        <span v-html="message.content"
              @click="messageHandler($event)"></span>
      </div>
      <el-row class="time">{{ getTime(message.time) }}</el-row>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from "vuex";
import RedPacket from "../components/RedPacket.vue";

export default {
  name: "message",
  props: {
    message: Object,
    date: String,
  },
  computed: {
    ...mapGetters(["userInfo"]),
    isOwn() {
      return this.userInfo.userName === this.message.userName;
    },
  },
  components: { RedPacket },
  methods: {
    isRedPacket(content) {
      return -1 !== content.indexOf('msgType":"redPacket');
    },
    getTime(time) {
      if (-1 === time.indexOf(this.date)) {
        return time;
      }
      return time.slice(11);
    },
    messageHandler(event) {
      if (event.target.tagName !== "IMG" || event.target.className === 'emoji') {
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
    showUserCard() {
      this.$emit('showUserCard', this.message.userName)
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
.chat {
  flex-direction: column;
}
.own-chat {
  align-items: flex-end;
}
.name {
  color: white;
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
</style>