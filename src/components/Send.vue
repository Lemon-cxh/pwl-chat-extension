<template>
  <div class="send">
    <div>
      <el-popover
        placement="bottom-start"
        width="150"
        trigger="manual"
        v-model="visible"
      >
        <div class="at-box">
          <el-row
            v-for="item in userList"
            :key="item.userName"
            :label="item.userName"
            :value="item.userName"
          >
            <el-row
              class="at-item"
              type="flex"
              @click.native="selectAt(item.userName)"
            >
              <img class="at-image" :src="item.userAvatarURL" />
              <span class="at-text">{{ item.userName }}</span>
            </el-row>
          </el-row>
        </div>
        <el-input
          slot="reference"
          placeholder="说点什么吧!"
          v-model="content"
          ref="contentInput"
          class="input-with-select"
          @paste.native.capture.prevent="pasteHandler"
          @keyup.enter.native="sendHandler"
        >
          <el-button
            slot="append"
            icon="el-icon-s-promotion"
            @click="sendHandler"
          ></el-button>
        </el-input>
      </el-popover>
    </div>
    <el-popover
      popper-class="quote-popover"
      placement="bottom-start"
      trigger="manual"
      v-model="quoteVisible"
    >
      <div id="quote-content" class="quote-content">
        <el-row type="flex" class="quote-user">
          <div>引用 @{{ quoteForm.userName }}</div>
          <i class="el-icon-circle-close quote-close" @click="closeQuote" />
        </el-row>
        <span v-if="quoteForm.content" v-html="quoteForm.content"></span>
        <el-row v-else>{{ quoteForm.md }}</el-row>
      </div>
      <div style="width: 1px" slot="reference"></div>
    </el-popover>
  </div>
</template>

<script>
import { send, upload } from '../api/chat'
import { getUserName } from '../api/user'
import { mapGetters } from 'vuex'

export default {
  name: 'send',
  data() {
    return {
      content: '',
      visible: false,
      userList: [],
      quoteVisible: false,
      quoteForm: {
        userName: '',
        md: '',
        content: '',
      },
    }
  },
  watch: {
    content(val) {
      let matAt = val.match(/@([^\s]+?)$/)
      if (!matAt) {
        this.visible = false
        return
      }
      getUserName({ name: matAt[1] }).then((res) => {
        if (0 === res.code && res.data.length > 0) {
          this.userList = res.data
          this.visible = true
        }
      })
    },
  },
  computed: {
    ...mapGetters(['key']),
    form() {
      return { content: this.content, apiKey: this.key }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.$refs.contentInput.focus()
    })
  },
  methods: {
    pasteHandler(e) {
      if (e.clipboardData.types.some((e) => e === 'Files')) {
        upload(e.clipboardData.files[0]).then((res) => {
          let succMap = res.data.succMap
          for (let key in succMap) {
            this.content += '![' + key + '](' + succMap[key] + ')'
          }
        })
      } else {
        this.content += e.clipboardData.getData('Text')
      }
    },
    selectAt(userName) {
      let content = this.content
      let index = content.lastIndexOf('@')
      this.content = content.substr(0, index + 1) + userName + ' '
      this.visible = false
      this.$refs.contentInput.focus()
    },
    sendHandler(event) {
      if (this.content === '') {
        return
      }
      if (event.ctrlKey) {
        this.content += '<br/>'
        return
      }
      this.send()
    },
    addContent(content) {
      this.content += content
      this.$refs.contentInput.focus()
    },
    quote(quoteForm) {
      if (quoteForm.userName) {
        this.quoteForm = quoteForm
        this.$refs.contentInput.focus()
        this.quoteVisible = true
      }
    },
    closeQuote() {
      this.quoteForm = {}
      this.quoteVisible = false
    },
    sendMessage(content) {
      send({ content: content, apiKey: this.key }).then()
    },
    send() {
      let form = this.form
      if (this.quoteVisible) {
        let quoteForm = this.quoteForm

        form.content =
          '**引用** **@' + this.buildAtUser(quoteForm.userName) + 
          '**\n> ' +
          (quoteForm.md ? quoteForm.md : quoteForm.content) +
          '\n\n并说:' +
          form.content
      }
      send(form).then(() => {
        this.quoteVisible = false
        this.content = ''
      })
    },
    buildAtUser(userName) {
      return '<a href="' + process.env.VUE_APP_BASE_URL + '/member/' + userName + '" class="name-at" aria-label="' + userName + '" rel="nofollow">' + userName + '</a>'
    }
  },
}
</script>
<style scoped>
.send {
  flex-grow: 1;
}
.at-box {
  max-height: 200px;
  overflow: auto;
}
.at-item {
  width: 130px;
  color: white;
  align-items: center;
}
.at-image {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}
.quote-content {
  color: black;
  max-width: 230px;
  max-height: 120px;
  overflow: auto;
}
.quote-user {
  height: 20px;
  line-height: 20px;
  font-weight: bold;
  justify-content: space-between;
}
.quote-close {
  margin-left: 10px;
  font-size: 20px;
}
</style>
<style>
.el-popover {
  padding: 5px;
  background-color: #333333;
}
.quote-popover {
  background-color: #a3db92;
}
.quote-content * {
  max-width: 220px;
}
</style>
