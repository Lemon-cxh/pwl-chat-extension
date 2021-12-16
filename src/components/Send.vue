<template>
  <div>
    <el-input placeholder="说点什么吧!"
              v-model="content"
              class="input-with-select"
              @paste.native.capture.prevent="handlePaste"
              @keyup.enter.native="send">
      <el-dropdown slot="append"
                   split-button
                   type="primary"
                   @command="handleCommand"
                   @click="send">
        <i class="el-icon-s-promotion"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item icon="el-icon-s-finance" command="redPacketHandler"></el-dropdown-item>
          <!-- <el-dropdown-item icon="el-icon-star-on" command="emojiHandler"></el-dropdown-item> -->
        </el-dropdown-menu>
      </el-dropdown>
    </el-input>

    <el-dialog :visible.sync="redPacketDialogVisible"
               width="60%"
               center>
      <el-form ref="form"
               :model="redPacketForm"
               size="mini"
               class="form">
        <el-form-item label="积分"
                      prop="money">
          <el-input-number v-model="redPacketForm.money"
                           :min="32"></el-input-number>
        </el-form-item>
        <el-form-item label="个数"
                      prop="count">
          <el-input-number v-model="redPacketForm.count"
                           :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="内容"
                      prop="msg">
          <el-input style="width:80%"
                    v-model.trim="redPacketForm.msg"></el-input>
        </el-form-item>
        <el-form-item label-width="80px"><el-button type="primary"
                 @click="sendRedPacket">确 定</el-button></el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { openRedPacket, send, upload } from "../api/chat";
import { mapGetters } from "vuex";

export default {
  name: "send",
  data() {
    return {
      content: "",
      redPacketForm: {
        money: 32,
        count: 2,
        msg: "摸鱼者，事竟成!",
        type: "random",
        recivers: [],
      },
      redPacketDialogVisible: false,
    };
  },
  computed: {
    ...mapGetters(["key"]),
    form() {
      return { content: this.content, apiKey: this.key };
    },
    redPacketContent() {
      return {
        content:
          "[redpacket]" +
          JSON.stringify(this.redPacketForm) +
          "[/redpacket]",
        apiKey: this.key,
      };
    },
  },
  methods: {
    handlePaste(e) {
      if (e.clipboardData.types.some((e) => e === "Files")) {
        upload(e.clipboardData.files[0]).then((res) => {
          let succMap = res.data.succMap;
          for (let key in succMap) {
            this.content += "![" + key + "](" + succMap[key] + ")";
          }
        });
      } else {
        this.content += e.clipboardData.getData("Text");
      }
    },
    send(event) {
      if (event.ctrlKey) {
        this.content += '<br/>';
        return
      }
      send(this.form).then(() => {
        this.content = "";
      });
    },
    handleCommand(command) {
      switch(command) {
        case 'redPacketHandler':
          this.redPacketHandler()
          break;
        case 'emojiHandler':
          this.emojiHandler()
          break;
        default:
      }
    },
    redPacketHandler() {
      this.redPacketDialogVisible = true;
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    },
    emojiHandler() {

    },
    sendRedPacket() {
      send(this.redPacketContent).then(() => {
        this.redPacketDialogVisible = false
      });
    },
    emoji() {},
  },
};
</script>

<style scoped>
.form {
  padding: 20px;
}
</style>