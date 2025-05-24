<template>
  <div class="article-list">
    <div class="header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="title">帖子列表</span>
        </template>
      </el-page-header>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" stretch>
        <el-tab-pane label="最近" name="recent"></el-tab-pane>
        <el-tab-pane label="热门" name="hot"></el-tab-pane>
        <el-tab-pane label="点赞" name="good"></el-tab-pane>
        <el-tab-pane label="最近回复" name="reply"></el-tab-pane>
      </el-tabs>
    </div>
    <el-scrollbar
      ref="articleScrollbar"
      class="article-scrollbar"
      :height="scrollbarHeight"
      noresize
      always
      @scroll="scroll"
    >
      <div
        v-for="article in articles"
        :key="article.oId"
        class="article-item"
        @click="selectArticle(article)"
      >
        <div class="avatar-author-container">
          <el-avatar :size="32" :src="article.articleAuthorThumbnailURL48" />
          <div class="author-name">{{ article.articleAuthorName }}</div>
        </div>
        <div class="article-content">
          <div class="article-title-row">
            <span class="article-title">{{ article.articleTitle }}</span>
          </div>
          <div class="article-meta-row">
            <span class="stats">
              <el-icon><view-icon /></el-icon>{{ article.articleViewCount }}
              <el-icon><ChatDotRound /></el-icon>{{ article.articleCommentCount }}
              <el-icon><Star /></el-icon>{{ article.articleThankCnt }}
            </span>
          </div>
          <div class="article-preview">
            {{ article.articlePreviewContent }}
          </div>
          <!-- 添加文章缩略图 -->
          <div v-if="article.articleThumbnailURL" class="article-thumbnail">
            <img :src="article.articleThumbnailURL" alt="缩略图" />
          </div>
          <div class="tags-time-row">
            <div class="tags-container">
              <el-tag
                v-for="tag in article.articleTagObjs"
                :key="tag.oId"
                size="small"
                class="tag"
              >
                {{ tag.tagTitle }}
              </el-tag>
            </div>
            <span class="article-time">{{ article.timeAgo }}</span>
          </div>
          <!-- 添加最佳评论 -->
          <div v-if="article.articleNiceComments && article.articleNiceComments.length > 0" class="best-comment">
            <div class="best-comment-header">
              <el-icon><Trophy /></el-icon> 最佳评论
            </div>
            <div class="best-comment-content">
              <span class="best-comment-author">{{ article.articleNiceComments[0].commentAuthorName }}:</span>
              {{ article.articleNiceComments[0].commentContent }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading-more">加载中...</div>
      <div v-if="!hasMore && !loading" class="no-more">没有更多内容了</div>
    </el-scrollbar>
  </div>
</template>

<script>
import {
  getRecentArticles,
  getHotArticles,
  getGoodArticles,
  getReplyArticles
} from '@/popup/api/article'
import { mapGetters } from 'vuex'
import { View as ViewIcon, ChatDotRound, Star, Trophy } from '@element-plus/icons-vue'

export default {
  name: 'ArticleList',
  components: {
    ViewIcon,
    ChatDotRound,
    Star,
    Trophy
  },
  data() {
    return {
      scrollbarHeight: window.innerHeight - 80,
      activeTab: 'recent',
      articles: [],
      loading: false,
      currentPage: 0,
      hasMore: true
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
    pageParams() {
      return {
        p: this.currentPage,
        apiKey: this.apiKey
      }
    }
  },
  methods: {
    async loadArticles(isTabChange = false) {
      if (this.loading) {
        return
      }
      // 如果是切换标签页，重置数据
      if (isTabChange) {
        this.articles = []
        this.currentPage = 0
        this.hasMore = true
      }
      // 如果没有更多数据，直接返回
      if (!this.hasMore) {
        return
      }
      this.loading = true
      this.currentPage++
      try {
        let response
        switch (this.activeTab) {
          case 'recent':
            response = await getRecentArticles(this.pageParams)
            break
          case 'hot':
            response = await getHotArticles(this.pageParams)
            break
          case 'good':
            response = await getGoodArticles(this.pageParams)
            break
          case 'reply':
            response = await getReplyArticles(this.pageParams)
            break
        }
        if (response.code === 0) {
          const newArticles = response.data.articles
          // 如果返回的数据为空，说明没有更多数据了
          if (!newArticles || newArticles.length === 0) {
            this.hasMore = false
          } else {
            this.articles = [...this.articles, ...newArticles]
          }
        } else {
          this.currentPage--
        }
      } catch (error) {
        console.error('Failed to load articles:', error)
        this.currentPage--
      } finally {
        this.loading = false
      }
    },
    handleTabClick() {
      this.loadArticles(true)
    },
    selectArticle(article) {
      window.open(
        `${process.env.VUE_APP_BASE_URL}${article.articlePermalink}`,
        '_blank'
      )
    },
    goBack() {
      this.$router.push({ name: 'ChatRoom' })
    },
    scroll({ scrollTop }) {
      // 获取滚动容器的高度信息
      const scrollbar = this.$refs.articleScrollbar
      if (!scrollbar) {
        return
      }
      const { scrollHeight, clientHeight } = scrollbar.wrapRef
      // 当滚动到距离底部 50px 时加载更多
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      if (!this.loading && distanceToBottom < 50 && this.hasMore) {
        this.loadArticles()
      }
    }
  },
  mounted() {
    this.loadArticles(true)
  }
}
</script>

<style scoped>
.article-list {
  background: #181818;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  max-width: 380px;
}
.header {
  padding: 6px 8px 0 8px;
  background: #232323;
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
.article-scrollbar {
  margin-top: 80px;
}
/* 新增和修改的样式 */
.avatar-author-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
  width: 40px;
}

.author-name {
  color: #999;
  margin-top: 4px;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-item {
  display: flex;
  align-items: flex-start;
  padding: 5px 8px;
  border-bottom: 1px solid #232323;
  cursor: pointer;
  transition: background 0.2s;
}

.article-content {
  flex: 1;
  min-width: 0;
}

.tags-time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.tags-container {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tag {
  background: #232323;
  border-color: #333;
  color: #bbb;
  font-size: 11px;
  padding: 0 4px;
  margin-right: 3px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-time {
  font-size: 11px;
  color: #888;
  margin-left: 8px;
  flex-shrink: 0;
}
.article-item:hover {
  background: #232323;
}
.el-avatar {
  flex-shrink: 0;
  margin-right: 8px;
}
.article-content {
  flex: 1;
  min-width: 0;
}
.article-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.article-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
}

.article-time {
  font-size: 11px;
  color: #888;
  margin-left: 8px;
  flex-shrink: 0;
}
.article-meta-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}
.author {
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stats {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}

.article-preview {
  font-size: 12px;
  color: #bbb;
  line-height: 1.4;
  display: -webkit-box;
  margin-bottom: 2px;
}

/* 文章缩略图样式 */
.article-thumbnail {
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
  max-height: 120px;
  overflow: hidden;
  border-radius: 4px;
}

.article-thumbnail img {
  width: 100%;
  object-fit: cover;
}

/* 最佳评论样式 */
.best-comment {
  margin-top: 8px;
  padding: 8px;
  background-color: #2a2a2a;
  border-radius: 4px;
  font-size: 12px;
}

.best-comment-header {
  display: flex;
  align-items: center;
  color: #f0c14b;
  margin-bottom: 4px;
  font-weight: 600;
}

.best-comment-header .el-icon {
  margin-right: 4px;
}

.best-comment-content {
  color: #bbb;
  line-height: 1.4;
}

.best-comment-author {
  color: #ddd;
  font-weight: 600;
  margin-right: 4px;
}
:deep(.el-page-header__left),
:deep(.el-page-header__content) {
  color: white;
}
:deep(.el-tabs__nav-wrap::after) {
  background: #232323;
}
:deep(.el-tabs__item) {
  color: #aaa;
  font-size: 13px;
  padding: 0 8px;
}
:deep(.el-tabs__item.is-active) {
  color: #fff;
}
:deep(.el-tabs__active-bar) {
  background: #409eff;
}
.simple-loading {
  color: #aaa;
  text-align: center;
  padding: 32px 0;
  font-size: 15px;
}
.loading-more {
  color: #aaa;
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
}

.no-more {
  color: #666;
  text-align: center;
  padding: 12px 0;
  font-size: 12px;
}
</style>
