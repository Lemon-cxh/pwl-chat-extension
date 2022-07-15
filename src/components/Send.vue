<template>
  <div class="send">
    <div>
      <el-popover
        placement="bottom-start"
        :width="150"
        trigger="manual"
        v-model:visible="visible"
      >
        <template #reference>
          <el-input
            size="large"
            placeholder="说点什么吧!"
            v-model="content"
            v-focus
            ref="contentInput"
            class="dark-mode"
            @paste.capture.prevent="pasteHandler"
            @blur="handleInputBlur"
            @keyup.enter="sendHandler"
          >
            <template #append>
              <el-button @click="sendHandler" :loading="disabled">
                <promotion v-if="!disabled" class="svg-icon" />
              </el-button>
            </template>
          </el-input>
        </template>
        <!-- @用户时的用户列表 -->
        <div class="at-box">
          <el-row
            v-for="item in userList"
            :key="item.userName"
            :label="item.userName"
            :value="item.userName"
          >
            <el-row class="at-item" @click="selectAt(item.userName)">
              <img class="at-image" :src="item.userAvatarURL" />
              <span class="at-text">{{ item.userName }}</span>
            </el-row>
          </el-row>
        </div>
      </el-popover>
    </div>
    <!-- 引用消息显示 -->
    <el-popover
      popper-class="quote-popover"
      placement="bottom-start"
      width="auto"
      trigger="manual"
      v-model:visible="quoteVisible"
    >
      <template #reference>
        <div style="width: 1px"></div>
      </template>
      <div id="quote-content" class="quote-content">
        <el-row class="quote-user">
          <div>引用 @{{ quoteForm.userName }}</div>
          <circle-close-filled
            class="svg-icon quote-close"
            @click="closeQuote"
          />
        </el-row>
        <span v-if="quoteForm.content" v-html="quoteForm.content"></span>
        <el-row v-else>{{ quoteForm.md }}</el-row>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { send, upload } from '../api/chat'
import { getUserName } from '../api/user'
import { mapGetters } from 'vuex'
import { getMessageMark } from '../utils/util'
import { Promotion, CircleCloseFilled } from '@element-plus/icons-vue'

export default {
  name: 'send',
  components: {
    Promotion,
    CircleCloseFilled,
  },
  inject: ['$message'],
  data() {
    return {
      content: '',
      cursor: 0,
      disabled: false,
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
  computed: {
    ...mapGetters(['key', 'discuss']),
    form() {
      return { content: this.content, apiKey: this.key }
    },
  },
  watch: {
    content(val) {
      let matchAt = val.match(/@([^\s]+?)$/)
      if (!matchAt) {
        this.visible = false
        return
      }
      getUserName({ name: matchAt[1] }).then((res) => {
        if (0 === res.code && res.data.length > 0) {
          this.userList = res.data
          this.visible = true
        }
      })
    },
  },
  methods: {
    pasteHandler(e) {
      if (e.clipboardData.types.some((e) => e === 'Files')) {
        let type = e.clipboardData.files[0].type
        upload(e.clipboardData.files[0]).then((res) => {
          let succMap = res.data.succMap
          for (let key in succMap) {
            this.content += `${type.startsWith('image') ? '!' : ''}[${key}](${
              succMap[key]
            })`
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
    handleInputBlur(e) {
      this.cursor = e.srcElement.selectionStart
    },
    sendHandler(event) {
      if (this.disabled) {
        return
      }
      this.content = this.content.trim()
      if (this.content === '') {
        return
      }
      if (event.ctrlKey) {
        this.handleInputBlur(event)
        this.buildContent(this.content, '<br/>')
        return
      }
      this.disabled = true
      this.send()
    },
    addContent(content) {
      this.buildContent(this.content, content)
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
        form.content = `${form.content}\n\n*引用* @${this.buildAtUser(
          quoteForm.userName
        )}:\n${quoteForm.md ? '> ' + quoteForm.md : quoteForm.content}\n`
      }
      if (this.discuss.enable) {
        form.content += '\n*`# ' + this.discuss.content + ' #`*'
      }
      form.content += getMessageMark()
      send(form).then((res) => {
        this.disabled = false
        if (0 === res.code) {
          this.quoteVisible = false
          this.content = ''
          return
        }
        this.$message.warning(res.msg)
      })
    },
    buildAtUser(userName) {
      return `<a href="${process.env.VUE_APP_BASE_URL}/member/${userName}" class="name-at" aria-label="${userName}" rel="nofollow">${userName}</a>`
    },
    buildContent(content, str) {
      this.content =
        content.substring(0, this.cursor) + str + content.substring(this.cursor)
    },
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
  color: white;
  max-width: 230px;
  max-height: 200px;
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
.quote-popover {
  background-color: #a3db92;
}
.quote-content * {
  max-width: 220px;
}
.quote-content a {
  color: white;
}
</style>
