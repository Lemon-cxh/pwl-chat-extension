<template>
  <el-popover placement="left-start" width="206" v-model="visible">
    <el-row type="flex" class="image-box">
      <div class="image" v-for="(item, index) in images" :key="index">
        <div class="image-item">
          <img :src="item" class="image" @click="selectImage(item)" />
          <i class="el-icon-error delete" @click="deleteImage(item)" />
        </div>
      </div>
    </el-row>
    <icon-svg
      slot="reference"
      icon-class="imageBtn"
      @click="visible = !visible"
    />
  </el-popover>
</template>

<script>
import { getCloudImage, syncCloudImage } from '../api/chat'

export default {
  name: 'images',
  data() {
    return {
      visible: false,
      images: [],
    }
  },
  created() {
    this.getCloudImage()
  },
  methods: {
    getCloudImage() {
      getCloudImage({ gameId: 'emojis' }).then((res) => {
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
      this.getCloud((images) => {
        if (images.some((e) => e === url)) {
          this.$message.info('已添加过该表情')
          return
        }
        images.push(url)
        this.syncCloud(images)
      })
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
      getCloudImage({ gameId: 'emojis' }).then((res) => {
        if (0 === res.code) {
          let images = JSON.parse(res.data)
          images = fun(images)
        }
      })
    },
    syncCloud(images) {
      let form = { gameId: 'emojis', data: JSON.stringify(images) }
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
</style>
