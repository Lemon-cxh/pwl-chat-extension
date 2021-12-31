<template>
  <div>
    <el-popover placement="left-start" width="208" v-model="visible">
      <el-row type="flex" class="image-box">
        <div class="image" v-for="(item, index) in images" :key="index">
          <div class="image-item">
            <img :src="item" class="image" @click="selectImage(item)" />
            <i class="el-icon-error delete" @click="deleteImage(item)" />
          </div>
        </div>
        <icon-svg
          class="image-add"
          icon-class="imageAdd"
          @click.native="
            url = '';
            drawer = true
          "
        />
      </el-row>
      <icon-svg
        slot="reference"
        icon-class="imageBtn"
        @click="visible = true"
      />
    </el-popover>
    <el-drawer
      title="从URL导入表情"
      :visible.sync="drawer"
      direction="ttb"
      :with-header="false"
      size="auto"
    >
      <el-row class="title">从URL导入表情</el-row>
      <el-row type="flex"
        ><el-input
          size="mini"
          width="80%"
          placeholder="请输入URL"
          v-model="url"
        /><el-button size="mini" type="primary" @click.native="addImage"
          >提交</el-button
        ></el-row
      >
    </el-drawer>
  </div>
</template>

<script>
import { getCloudImage, syncCloudImage } from '../api/chat'
import { mapGetters } from 'vuex'

export default {
  name: 'images',
  data() {
    return {
      visible: false,
      drawer: false,
      url: '',
      images: [],
    }
  },
  computed: {
    ...mapGetters(['key']),
    form() {
      return { gameId: 'emojis', apiKey: this.key }
    },
  },
  created() {
    this.getCloudImage()
  },
  methods: {
    getCloudImage() {
      getCloudImage(this.form).then((res) => {
        if (0 === res.code) {
          this.images = JSON.parse(res.data)
        }
      })
    },
    selectImage(image) {
      this.$emit('sendMessage', '![image.png](' + image + ')')
      this.visible = false
    },
    syncCloudImage(url) {
      let that = this
      this.getCloud((images) => {
        if (images.some((e) => e === url)) {
          that.$message.info('已添加过该表情')
          return
        }
        images.push(url)
        this.syncCloud(images)
      })
    },
    addImage() {
      if (
        !/^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(
          this.url
        )
      ) {
        this.$message.info('URL格式错误')
        return
      }
      this.syncCloudImage(this.url)
      this.drawer = false
    },
    deleteImage(url) {
      this.getCloud((images) => {
        let index = images.indexOf(url)
        if (index === -1) {
          return
        }
        images.splice(index, 1)
        this.syncCloud(images)
      })
    },
    getCloud(fun) {
      getCloudImage(this.form).then((res) => {
        if (0 === res.code) {
          let images = JSON.parse(res.data)
          images = fun(images)
        }
      })
    },
    syncCloud(images) {
      let form = this.form
      form.data = JSON.stringify(images)
      syncCloudImage(form).then((r) => {
        if (0 === r.code) {
          this.$message.success('表情包同步成功')
          this.getCloudImage()
        }
      })
    },
  },
}
</script>

<style scoped>
.image-box {
  flex-wrap: wrap;
  max-height: 264px;
  overflow: auto;
}
.delete {
  position: absolute;
  top: -3px;
  right: -8px;
  font-size: 16px;
}

.image {
  width: 60px;
  height: 60px;
  margin: 3px;
}

.image-item {
  position: relative;
  width: 60px;
  height: 60px;
}
.image-add {
  width: 56px;
  height: 56px;
  margin: 3px;
  padding: 2px;
}
.title {
  font-size: 16px;
  margin-bottom: 20px;
}
</style>
