<template>
  <div class="send">
    <div>
      <el-input
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
        <el-row>{{ quoteForm.content }}</el-row>
      </div>
      <div style="width: 1px" slot="reference"></div>
    </el-popover>
  </div>
</template>

<script>
import { send, upload } from '../api/chat'
import { mapGetters } from 'vuex'

export default {
  name: 'send',
  data() {
    return {
      content: '',
      quoteVisible: false,
      quoteForm: {
        userName: '',
        content: '',
      },
    }
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
        form.content +=
          '\n##### 引用 @' + quoteForm.userName + '\n> ' + quoteForm.content
      }
      send(this.form).then(() => {
        this.quoteVisible = false
        this.content = ''
      })
    },
  },
}
</script>
<style scoped>
.send {
  flex-grow: 1;
}
.quote-content {
  color: black;
  max-width: 230px;
  max-height: 100px;
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
</style>
