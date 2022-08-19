<template>
  <div>
    <el-popover placement="bottom" width="auto" trigger="hover">
      <template #reference>
        <div tabindex="0"><icon-svg icon-class="imageBtn" /></div>
      </template>
      <el-row class="image-box">
        <icon-svg
          class="image-add"
          icon-class="imageAdd"
          @click=";(url = ''), (drawer = true)"
        />
        <div v-for="(item, index) in images" :key="index" class="image">
          <div class="image-item">
            <img :src="item" class="image" @click="selectImage(item)" />
            <circle-close-filled
              class="svg-icon delete"
              @click="deleteImage(item)"
            />
          </div>
        </div>
      </el-row>
    </el-popover>
    <el-drawer
      title="从URL导入表情"
      v-model="drawer"
      direction="ttb"
      :with-header="false"
      size="auto"
    >
      <el-row class="title">从URL导入表情</el-row>
      <el-row type="flex">
        <el-input
          size="small"
          width="80%"
          placeholder="请输入URL"
          v-model="url"
        />
        <el-button size="small" type="primary" @click="addImage">
          提交
        </el-button>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import { getCloudImage, syncCloudImage } from '../api/chatroom'
import { getMessageMark } from '../utils/util'
import { mapGetters } from 'vuex'
import { CircleCloseFilled } from '@element-plus/icons-vue'
/**
 * 图片表情组件
 */
export default {
  name: 'images-component',
  components: {
    CircleCloseFilled
  },
  inject: ['$message'],
  emits: ['sendMessage'],
  data() {
    return {
      drawer: false,
      url: '',
      images: []
    }
  },
  computed: {
    ...mapGetters(['key']),
    form() {
      return { gameId: 'emojis', apiKey: this.key }
    }
  },
  created() {
    this.getCloudImage()
  },
  methods: {
    getCloudImage() {
      getCloudImage(this.form).then((res) => {
        if (res.code === 0) {
          this.images = res.data ? JSON.parse(res.data).reverse() : []
        }
      })
    },
    selectImage(image) {
      this.$emit('sendMessage', `![image.png](${image})${getMessageMark()}`)
    },
    syncCloudImage(url) {
      const that = this
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
        const index = images.indexOf(url)
        if (index === -1) {
          return
        }
        images.splice(index, 1)
        this.syncCloud(images)
      })
    },
    getCloud(fun) {
      getCloudImage(this.form).then((res) => {
        if (res.code === 0) {
          fun(res.data ? JSON.parse(res.data) : [])
        }
      })
    },
    syncCloud(images) {
      const form = this.form
      form.data = JSON.stringify(images)
      syncCloudImage(form).then((r) => {
        if (r.code === 0) {
          this.$message.success('表情包同步成功')
          this.getCloudImage()
        }
      })
    }
  }
}
</script>

<style scoped>
.image-box {
  flex-wrap: wrap;
  max-width: 268px;
  max-height: 260px;
  overflow: auto;
  overflow-x: hidden;
}
.delete {
  position: absolute;
  top: -3px;
  right: -8px;
  font-size: 16px;
}
.image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 3px;
}
.image-item {
  position: relative;
  width: 80px;
  height: 80px;
}
.image-add {
  width: 80px;
  height: 80px;
  margin: 3px;
}
.title {
  font-size: 16px;
  margin-bottom: 20px;
}
</style>
