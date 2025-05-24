<template>
  <div class="breezemoon-list">
    <div class="header">
      <div class="header-row">
        <el-page-header @back="goBack">
          <template #content>
            <span class="title">清风明月</span>
          </template>
        </el-page-header>
        <div class="actions">
          <el-button type="primary" size="small" @click="goToPost"
            >发布</el-button
          >
        </div>
      </div>
    </div>
    <el-scrollbar
      ref="scrollbar"
      class="breezemoon-scrollbar"
      @scroll="handleScroll"
    >
      <div v-if="loading && breezemoons.length === 0" class="simple-loading">
        加载中...
      </div>
      <template v-else>
        <div
          v-for="breezemoon in breezemoons"
          :key="breezemoon.oId"
          class="breezemoon-item"
        >
          <el-avatar
            :size="32"
            :src="breezemoon.breezemoonAuthorThumbnailURL48"
          />
          <div class="breezemoon-content">
            <div class="breezemoon-header">
              <span class="author">{{ breezemoon.breezemoonAuthorName }}</span>
              <span class="time">{{ breezemoon.timeAgo }}</span>
            </div>
            <div class="breezemoon-text">
              {{ stripHtml(breezemoon.breezemoonContent) }}
            </div>
            <div v-if="breezemoon.breezemoonCity" class="breezemoon-city">
              <i class="el-icon-location"></i>
              {{ breezemoon.breezemoonCity }}
            </div>
          </div>
        </div>
        <div v-if="loading && breezemoons.length > 0" class="simple-loading">
          加载中...
        </div>
        <div v-if="noMore" class="simple-loading">没有更多了</div>
      </template>
    </el-scrollbar>
  </div>
</template>

<script>
import { getBreezemoons } from '@/popup/api/breezemoon'
import { mapGetters } from 'vuex'

export default {
  name: 'BreezemoonList',
  data() {
    return {
      breezemoons: [],
      loading: false,
      page: 1,
      size: 20,
      noMore: false
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    }
  },
  methods: {
    async loadBreezemoons(isLoadMore = false) {
      if (this.loading || this.noMore) return
      this.loading = true
      try {
        const response = await getBreezemoons({
          ...this.apiKey,
          p: this.page,
          size: this.size
        })
        if (response.code === 0) {
          const list = response.breezemoons || []
          console.log(list.length)
          if (isLoadMore) {
            this.breezemoons = this.breezemoons.concat(list)
          } else {
            this.breezemoons = list
          }
          if (list.length === 0) {
            this.noMore = true
          }
        }
      } catch (error) {
        console.error('Failed to load breezemoons:', error)
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({ name: 'ChatRoom' })
    },
    goToPost() {
      this.$router.push({ name: 'BreezemoonPost' })
    },
    stripHtml(html) {
      return html ? html.replace(/<[^>]+>/g, '') : ''
    },
    handleScroll({ scrollTop }) {
      const wrap = this.$refs.scrollbar.wrapRef
      const scrollHeight = wrap.scrollHeight
      const clientHeight = wrap.clientHeight
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        !this.loading &&
        !this.noMore
      ) {
        this.page++
        this.loadBreezemoons(true)
      }
    }
  },
  mounted() {
    this.loadBreezemoons()
  }
}
</script>

<style scoped>
.breezemoon-list {
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
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}
.actions {
  margin-right: 0;
}
.breezemoon-scrollbar {
  margin-top: 60px;
  height: 89vh;
}
.breezemoon-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 8px;
  border-bottom: 1px solid #232323;
}
.el-avatar {
  flex-shrink: 0;
  margin-right: 8px;
}
.breezemoon-content {
  flex: 1;
  min-width: 0;
}
.breezemoon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.author {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
}
.time {
  font-size: 11px;
  color: #888;
}
.breezemoon-text {
  font-size: 13px;
  color: #bbb;
  line-height: 1.5;
  margin-bottom: 4px;
  word-break: break-all;
}
.breezemoon-city {
  font-size: 11px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}
.breezemoon-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.breezemoon-scrollbar :deep(.el-scrollbar__thumb) {
  background: #333;
  border-radius: 2px;
}
.breezemoon-scrollbar :deep(.el-scrollbar__thumb:hover) {
  background: #444;
}
.breezemoon-scrollbar :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important;
}
:deep(.el-page-header__left),
:deep(.el-page-header__content) {
  color: white;
}
.simple-loading {
  color: #aaa;
  text-align: center;
  padding: 32px 0;
  font-size: 15px;
}
</style>
