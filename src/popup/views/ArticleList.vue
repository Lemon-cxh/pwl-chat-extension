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
    <el-scrollbar class="article-scrollbar">
      <div v-if="loading" class="simple-loading">加载中...</div>
      <template v-else>
        <div
          v-for="article in articles"
          :key="article.oId"
          class="article-item"
          @click="selectArticle(article)"
        >
          <el-avatar :size="32" :src="article.articleAuthorThumbnailURL48" />
          <div class="article-content">
            <div class="article-title-row">
              <span class="article-title">{{ article.articleTitle }}</span>
              <span class="article-time">{{ article.timeAgo }}</span>
            </div>
            <div class="article-meta-row">
              <span class="author">{{ article.articleAuthorName }}</span>
              <span class="stats">
                <i class="el-icon-view"></i
                >{{ article.articleViewCntDisplayFormat }}
                <i class="el-icon-chat-dot-round"></i
                >{{ article.articleCommentCount }}
              </span>
            </div>
            <div class="article-preview">
              {{ article.articlePreviewContent }}
            </div>
            <div class="article-tags">
              <el-tag
                v-for="tag in article.articleTagObjs"
                :key="tag.oId"
                size="mini"
                class="tag"
              >
                {{ tag.tagTitle }}
              </el-tag>
            </div>
          </div>
        </div>
      </template>
    </el-scrollbar>
  </div>
</template>

<script>
import {
  getRecentArticles,
  getHotArticles,
  getGoodArticles,
  getReplyArticles,
} from "@/popup/api/article";
import { mapGetters } from "vuex";

export default {
  name: "ArticleList",
  data() {
    return {
      activeTab: "recent",
      articles: [],
      loading: false,
    };
  },
  computed: {
    ...mapGetters(["key"]),
    apiKey() {
      return { apiKey: this.key };
    },
  },
  methods: {
    async loadArticles() {
      this.loading = true;
      try {
        let response;
        switch (this.activeTab) {
          case "recent":
            response = await getRecentArticles(this.apiKey);
            break;
          case "hot":
            response = await getHotArticles(this.apiKey);
            break;
          case "good":
            response = await getGoodArticles(this.apiKey);
            break;
          case "reply":
            response = await getReplyArticles(this.apiKey);
            break;
        }
        if (response.code === 0) {
          this.articles = response.data.articles;
        }
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        this.loading = false;
      }
    },
    handleTabClick() {
      this.loadArticles();
    },
    selectArticle(article) {
      window.open(`https://fishpi.cn${article.articlePermalink}`, "_blank");
    },
    goBack() {
      this.$router.push({ name: "ChatRoom" });
    },
  },
  mounted() {
    this.loadArticles();
  },
};
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
.article-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 8px;
  border-bottom: 1px solid #232323;
  cursor: pointer;
  transition: background 0.2s;
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
  white-space: nowrap;
  overflow: hidden;
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
  justify-content: space-between;
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
.stats i {
  margin-right: 2px;
}
.article-preview {
  font-size: 12px;
  color: #bbb;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 180px;
  margin-bottom: 2px;
}
.article-tags {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}
.tag {
  background: #232323;
  border-color: #333;
  color: #bbb;
  font-size: 11px;
  padding: 0 4px;
}
.article-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.article-scrollbar :deep(.el-scrollbar__thumb) {
  background: #333;
  border-radius: 2px;
}
.article-scrollbar :deep(.el-scrollbar__thumb:hover) {
  background: #444;
}
.article-scrollbar :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important;
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
</style>
