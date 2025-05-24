<template>
  <div class="breezemoon-post">
    <div class="header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="title">发布清风明月</span>
        </template>
      </el-page-header>
    </div>
    <div class="content">
      <el-input
        v-model="content"
        type="textarea"
        :rows="6"
        placeholder="写下此刻的心情..."
        :maxlength="200"
        show-word-limit
      />
      <div class="actions">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { postBreezemoon } from '@/popup/api/breezemoon'
import { mapGetters } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'BreezemoonPost',
  data() {
    return {
      content: '',
      loading: false
    }
  },
  computed: {
    ...mapGetters(['key'])
  },
  methods: {
    async handleSubmit() {
      if (!this.content.trim()) {
        ElMessage.warning('请输入内容')
        return
      }

      this.loading = true
      try {
        const response = await postBreezemoon({
          apiKey: this.key,
          breezemoonContent: this.content.trim()
        })
        console.log(response.code)

        if (response.code === 0) {
          ElMessage.success('发布成功')
          this.$router.push({ name: 'BreezemoonList' })
        } else {
          ElMessage.error(response.msg || '发布失败')
        }
      } catch (error) {
        console.error('Failed to post breezemoon:', error)
        ElMessage.error('发布失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({ name: 'BreezemoonList' })
    }
  }
}
</script>

<style scoped>
.breezemoon-post {
  background: #181818;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  max-width: 380px;
}
.header {
  padding: 12px 16px;
  background-color: #2c2c2c;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.title {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}
.content {
  padding: 60px 16px 16px;
}
.actions {
  margin-top: 16px;
  text-align: right;
}
:deep(.el-textarea__inner) {
  background: #232323;
  border-color: #333;
  color: #e0e0e0;
  font-size: 14px;
  resize: none;
}
:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}
:deep(.el-input__count) {
  background: transparent;
  color: #888;
}
:deep(.el-page-header__left),
:deep(.el-page-header__content) {
  color: white;
}
</style>
