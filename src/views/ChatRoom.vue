<template>
  <div id="chatRoom">
    <!-- 活跃度，头像，输入框 -->
    <liveness />
    <el-row type="flex"
            class="user-box">
      <user-info/>
      <send ref="messageInput" />
    </el-row>
    <!-- 菜单按钮 -->
    <el-row type="flex" class="menu-row">
      <online :online="online"
              @showUserCard="showUserCard"/>
      <el-row type="flex"
            class="menu">
        <red-packet class="menu-item" />
        <emoji class="menu-item"
              @selectEmoji="selectEmoji" />
        <images ref="cloudImages"
                class="menu-item"
                @selectImage="selectImage" />
      </el-row> 
    </el-row>
    <!-- 消息列表 -->
    <div class="infinite-list-wrapper"
         style="overflow: auto; height: 420px">
      <div id="messageList"
           class="list"
           v-infinite-scroll="load"
           :infinite-scroll-disabled="loading">
        <div ref="inner"
             v-for="(item, index) in message"
             v-bind:key="index"
             class="infinite-list-item">
          <hint-message v-if="item.type && type.redPacketStatus === item.type"
                        :message="item"
                        @showUserCard="showUserCard"
                        @showRedpacketInfo="showRedpacketInfo" />
          <div v-else-if="!item.type || type.msg === item.type">
            <hint-message v-if="item.revoke"
                        :message="item" />
            <message :ref="'message_' + item.oId"
                   :message="item"
                   :date="date"
                   @showUserCard="showUserCard"
                   @collectImages="collectImages"
                   @talkToHe="talkToHe"
                   @quote="quote"
                   @showRedpacketInfo="showRedpacketInfo" />
          </div>
          
        </div>
        <div class="icon-box"><i class="el-icon-loading icon"
             v-if="loading"></i></div>
      </div>
    </div>
    <user-card :userInfo="userInfo"
               :dialogVisible="dialogVisible"
               @closeDialog="closeDialog" />
    <red-packet-info :info="redPacketInfo"
                     v-if="redPacketVisible"
                     @close='closeRedapcket'></red-packet-info>
  </div>
</template>

<script>
import Message from "../components/Message.vue";
import Liveness from "../components/Liveness.vue";
import UserInfo from "../components/UserInfo.vue";
import Online from "../components/Online.vue";
import Send from "../components/Send.vue";
import UserCard from "../components/UserCard.vue";
import HintMessage from "../components/HintMessage.vue";
import RedPacket from "../components/RedPacket.vue";
import RedPacketInfo from "../components/RedPacketInfo.vue";
import Emoji from "../components/Emoji.vue";
import Images from "../components/Images.vue";
import { EVENT, MESSAGE_TYPE } from "../constant/Constant"
import { getDate } from "../utils/util";
import { getUserInfo } from "../api/user";
import { mapGetters } from "vuex";

export default {
  name: "chatRoom",
  data() {
    return {
      port: null,
      loading: true,
      message: [],
      date: getDate(),
      dialogVisible: false,
      userInfo: {},
      redPacketInfo: {},
      online: {},
      redPacketVisible: false,
      type: MESSAGE_TYPE
    };
  },
  computed: {
    ...mapGetters(["key"]),
    apiKey() {
      return { apiKey: this.key };
    },
  },
  components: {
    Message,
    Liveness,
    UserInfo,
    Online,
    UserCard,
    HintMessage,
    RedPacket,
    RedPacketInfo,
    Emoji,
    Images,
    Send,
  },
  created() {
    let that = this;
    let port = chrome.runtime.connect();
    port.onMessage.addListener(function (msg) {
      switch (msg.type) {
        case EVENT.loadMessage:
          that.message = msg.message.message;
          that.online = msg.message.online;
          if (msg.message.length === 0) {
            that.load();
          } else {
            that.loading = false;
          }
          break;
        case EVENT.message:
          that.message.unshift(msg.message);
          break;
        case EVENT.more:
          that.message = that.message.concat(msg.message);
          that.loading = false;
          break;
        case EVENT.redPacketStatus:
          that.markRedPacket(msg.message)
          break;
        case EVENT.revoke:
          that.revoke(msg.message)
          break;
        case EVENT.online:
          that.online = msg.message
          break;
        default:
          break;
      }
    });
    this.port = port;
  },
  methods: {
    load() {
      this.loading = true;
      setTimeout(() => {
        this.more();
      }, 300);
    },
    more() {
      this.port.postMessage({ type: EVENT.getMore });
    },
    showUserCard(name) {
      getUserInfo(name, this.apiKey).then((res) => {
        let userInfo = res;
        if (userInfo.sysMetal) {
          userInfo.sysMetal = JSON.parse(userInfo.sysMetal);
        }
        this.userInfo = userInfo;
        this.dialogVisible = true;
      });
    },
    markRedPacket(oId) {
      let msg
      let that = this
      this.message.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          msg.got += 1
          that.$set(that.message[index], 'content', JSON.stringify(msg))
          return true;
        }
        return false;
      })
    },
    revoke(oId) {
      this.message.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          this.$set(this.message[index], 'revoke', true)
          return true;
        }
        return false;
      })
    },
    showRedpacketInfo(info) {
        this.redPacketVisible = true;
        this.redPacketInfo = info;
    },
    quote(quoteForm) {
      this.$refs.messageInput.quote(quoteForm);
    },
    talkToHe(userName) {
      this.$refs.messageInput.addContent(userName);
    },
    collectImages(url) {
      this.$refs.cloudImages.syncCloudImage(url);
    },
    selectEmoji(name) {
      this.$refs.messageInput.addContent(name);
    },
    selectImage(image) {
      this.$refs.messageInput.sendMessage("![image.png](" + image + ")");
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    closeRedapcket() {
      this.redPacketVisible = false;
    }
  },
};
</script>
<style scoped>
.user-box {
  padding: 5px;
}
.icon-box {
  width: 100%;
  text-align: center;
}
.icon {
  color: white;
  font-size: 26px;
}
.menu-row {
  height: 30px;
  justify-content: space-between;
}
.menu {
  font-size: 24px;
  line-height: 24px;
  justify-content: flex-end;
  align-items: center;
}
.menu-item {
  margin: 0 3px;
}
</style>