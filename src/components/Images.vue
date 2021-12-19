<template>
  <el-popover placement="left-start"
              width="206"
              v-model="visible">
    <el-row type="flex"
            class="image-box">
      <div class="image"
           v-for="(item, index) in images"
           :key="index"
           @click="selectImage(item)">
        <img :src="item" class="image" />
      </div>
    </el-row>
    <icon-svg slot="reference"
              icon-class="imageBtn"
              @click="visible = !visible"/>
  </el-popover>
</template>

<script>
import { getCloudImage, syncCloudImage } from "../api/chat";

export default {
  name: "images",
  data() {
    return {
      visible: false,
      images: [],
    };
  },
  created() {
    this.getCloudImage();
  },
  methods: {
    getCloudImage() {
      getCloudImage({ gameId: "emojis" }).then((res) => {
        if (0 === res.code) {
          this.images = JSON.parse(res.data)
        }
      });
    },
    selectImage(image) {
      this.$emit("selectImage", image);
      this.visible = false;
    },
    syncCloudImage(url) {
      getCloudImage({ gameId: "emojis" }).then((res) => {
        if (0 === res.code) {
          let images = JSON.parse(res.data)
          images.push(url)
          let form = { gameId: "emojis", data: JSON.stringify(images) }
          syncCloudImage(form).then(r => {
              if (0 === r.code) {
                this.$message.success('表情包同步成功')
              }
          })
        }
      });
    }
  },
};
</script>

<style scoped>
.image-box {
  flex-wrap: wrap;
  max-height: 264px;
  overflow: auto
}
.image {
  width: 60px;
  height: 60px;
  margin: 3px;
}
</style>