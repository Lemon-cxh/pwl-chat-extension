<template>
  <div id="app">
    <user-info/>
    <div class="infinite-list-wrapper"
         style="overflow: auto; height: 100%">
      <div class="list"
           v-infinite-scroll="load"
           :infinite-scroll-disabled="loading">
        <div ref="inner" v-for="(item, index) in message"
             v-bind:key="index"
             class="infinite-list-item">
          <message :message="item" :date="date" @showUserCard="showUserCard"></message>
          <!-- <hint-message v-else-if="item.type === 'redPacketStatus'" :message="item"/> -->
        </div>
      </div>
    </div>
    <user-card :userInfo="userInfo" :dialogVisible="dialogVisible" @closeDialog="closeDialog"/>
  </div>
</template>

<script>

import Message from "../components/Message.vue";
import UserInfo from "../components/UserInfo.vue";
import UserCard from "../components/UserCard.vue";
import { getDate } from "../utils/util";
import { getUserInfo } from "../api/user";
import {
  LOAD_MESSAGE_EVENT,
  MORE_EVENT,
  GET_MORE_EVENT,
  MESSAGE_EVENT,
} from "../constant/ConnectConstant";
import { mapGetters } from "vuex";

export default {
  name: "chatRoom",
  data() {
    return {
      port: null,
      loading: false,
      message: [],
      date: getDate(),
      dialogVisible: false,
      userInfo: {}
    };
  },
  computed: {
    ...mapGetters(["key"]),
    apiKey() {
      return {apiKey: this.key};
    },
  },
  components: { Message, UserInfo, UserCard},
  created() {
    let that = this;
    let port = chrome.runtime.connect();
    port.onMessage.addListener(function (msg) {
      switch (msg.type) {
        case LOAD_MESSAGE_EVENT:
          that.message = msg.message
          break;
        case MESSAGE_EVENT:
          that.message.unshift(msg.message);
          break;
        case MORE_EVENT:
          that.message = that.message.concat(msg.message);
          that.loading = false;
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
      this.more();
    },
    more() {
      this.port.postMessage({ type: GET_MORE_EVENT });
    },
    showUserCard(name) {
      getUserInfo(name, this.apiKey).then(res => {
        this.userInfo = res
        this.dialogVisible = true;
      })
    },
    closeDialog() {
      this.dialogVisible = false;
    }
  },
};
</script>
