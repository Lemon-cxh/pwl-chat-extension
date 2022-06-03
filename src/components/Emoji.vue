<template>
  <el-popover placement="bottom" width="211px" trigger="hover">
    <template #reference>
      <div tabindex="0">
        <icon-svg icon-class="emojiBtn" />
      </div>
    </template>
    <el-row class="emoji-box">
      <div
        v-for="(item, index) in emojis"
        :key="index"
        class="emoji"
        @click="selectEmoji(item.name)"
      >
        <img
          v-if="judgeEmojiIsImage(item.value)"
          :src="item.value"
          class="emoji"
        />
        <span v-else>{{ item.value }}</span>
      </div>
    </el-row>
  </el-popover>
</template>

<script>
import { getEmoji } from '../api/chat'
import { mapGetters } from 'vuex'

export default {
  name: 'emoji',
  emits: ['addContent'],
  data() {
    return {
      emojis: [],
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
  },
  created() {
    this.getEmoji()
  },
  methods: {
    getEmoji() {
      getEmoji(this.apiKey).then((res) => {
        if (0 === res.code) {
          let emojis = []
          res.data.forEach((e) => {
            for (let key in e) {
              emojis.push({ name: key, value: e[key] })
            }
          })
          this.emojis = emojis
        }
      })
    },
    selectEmoji(name) {
      this.$emit('addContent', `:${name}:`)
    },
    judgeEmojiIsImage(value) {
      return value.startsWith('http')
    },
  },
}
</script>

<style scoped>
.emoji-box {
  max-height: 204px;
  overflow: auto;
}
.emoji {
  width: 30px;
  height: 30px;
  font-size: 24px;
  line-height: 30px;
  margin: 2px;
}
</style>
