<template>
  <el-popover placement="left-start"
              width="211"
              trigger="click">
    <el-row type="flex"
            class="emoji-box">
      <div class="emoji"
           v-for="(item, index) in emojis"
           :key="index"
           @click="selectEmoji(item.name)">
        <img v-if="judgeEmojiIsImage(item.value)"
             :src="item.value"
             class="emoji" />
        <span v-else>{{item.value}}</span>
      </div>
    </el-row>
    <icon-svg slot="reference"
              icon-class="emojiBtn" />
  </el-popover>
</template>

<script>
import { getEmoji } from "../api/chat";
import { mapGetters } from "vuex";

export default {
  name: "emoji",
  data() {
    return {
      emojis: [],
    };
  },
  computed: {
    ...mapGetters(["key"]),
    apiKey() {
      return { apiKey: this.key };
    },
  },
  created() {
    this.getEmoji();
  },
  methods: {
    getEmoji() {
      getEmoji(this.apiKey).then((res) => {
        if (0 === res.code) {
          let emojis = [];
          let key;
          res.data.forEach((e) => {
            for (key in e) {
              emojis.push({ name: key, value: e[key] });
            }
          });
          this.emojis = emojis;
        }
      });
    },
    selectEmoji(name) {
      this.$emit("addContent", ':' + name + ':');
    },
    judgeEmojiIsImage(value) {
      return value.startsWith("http");
    },
  },
};
</script>

<style scoped>
.emoji-box {
  flex-wrap: wrap;
  max-height: 204px;
  overflow: auto
}
.emoji {
  width: 30px;
  height: 30px;
  font-size: 24px;
  line-height: 30px;
  margin: 2px;
}
</style>