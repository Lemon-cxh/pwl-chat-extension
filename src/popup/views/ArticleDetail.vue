<template>
  <div class="article-detail">
    <div class="header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="title">文章详情</span>
        </template>
      </el-page-header>
    </div>
    <el-scrollbar class="article-scrollbar">
      <div v-if="loading" class="simple-loading">
        <span>加载中...</span>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else class="article-content">
        <!-- 文章头部信息 -->
        <div class="article-header">
          <h1 class="article-title">
            <a :href="articlePermalink" target="_blank">{{
              article.articleTitle
            }}</a>
          </h1>
          <div class="article-meta">
            <span class="author">
              <img :src="article.articleAuthorThumbnailURL48" class="avatar" />
              {{ article.articleAuthorName }}
            </span>
            <span class="time">{{ article.articleCreateTimeStr }}</span>
            <span class="time"
              ><el-icon><view-icon /></el-icon
              >{{ article.articleViewCount }}</span
            >
          </div>
          <div class="article-tags" v-if="article.articleTags">
            <el-tag
              v-for="tag in article.articleTags.split(',')"
              :key="tag"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="article-body" v-html="article.articleContent"></div>

        <!-- 文章底部信息 -->
        <div class="article-footer">
          <div class="article-actions">
            <el-button type="text" @click="handleLike">
              <i class="el-icon-thumb"></i>
              {{ article.articleGoodCnt }} 赞同
            </el-button>
            <el-button type="text" @click="handleThank">
              <i class="el-icon-star-on"></i>
              {{ article.articleThankCnt }}感谢
            </el-button>
            <el-button type="text" @click="handleComment">
              <i class="el-icon-chat-dot-round"></i>
              {{ article.articleCommentCount }} 评论
            </el-button>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="article-comments">
          <h3>评论 ({{ commentTotal }})</h3>
          <div v-if="comments.length">
            <div
              v-for="comment in comments"
              :key="comment.oId"
              class="comment-item"
              :class="{ 'nice-comment': comment.isNice }"
            >
              <div class="comment-header">
                <img :src="comment.commentAuthorThumbnailURL" class="avatar" />
                <span class="author">
                  {{
                    comment.commentAuthorNickName || comment.commentAuthorName
                  }}
                  <el-tag v-if="comment.isNice" size="small" type="success"
                    >优质评论</el-tag
                  >
                  <el-tag
                    v-if="comment.commentAuthorId === article.articleAuthorId"
                    size="small"
                    type="warning"
                    >作者</el-tag
                  >
                </span>
                <span class="time">{{ comment.timeAgo }}</span>
              </div>
              <div
                class="comment-content"
                v-html="comment.commentContent"
              ></div>
              <div class="comment-actions">
                <el-button type="text" @click="handleCommentLike(comment)">
                  <i class="el-icon-thumb"></i>
                  {{ comment.commentGoodCnt }} 赞同
                </el-button>
                <el-button type="text" @click="handleCommentThank(comment)">
                  <i class="el-icon-star-on"></i>
                  {{ comment.commentThankCnt }} 感谢
                </el-button>
                <el-button type="text" @click="replyToComment(comment)">
                  <i class="el-icon-chat-dot-round"></i>
                  {{ comment.commentReplyCnt }} 回复
                </el-button>
              </div>

              <!-- 回复列表 -->
              <div
                v-if="comment.replies && comment.replies.length"
                class="comment-replies"
              >
                <div
                  v-for="reply in comment.replies"
                  :key="reply.oId"
                  class="reply-item"
                >
                  <div class="reply-header">
                    <img
                      :src="reply.commentAuthorThumbnailURL"
                      class="avatar"
                    />
                    <span class="author">
                      {{
                        reply.commentAuthorNickName || reply.commentAuthorName
                      }}
                      <el-tag
                        v-if="reply.commentAuthorId === article.articleAuthorId"
                        size="small"
                        type="warning"
                        >作者</el-tag
                      >
                      <template v-if="reply.replyTo">
                        回复了 {{ reply.replyTo.name }}
                      </template>
                    </span>
                    <span class="time">{{ reply.timeAgo }}</span>
                  </div>
                  <div
                    class="reply-content"
                    v-html="reply.commentContent"
                  ></div>
                  <div class="reply-actions">
                    <el-button type="text" @click="handleCommentLike(reply)">
                      <i class="el-icon-thumb"></i>
                      {{ reply.commentGoodCnt }} 赞同
                    </el-button>
                    <el-button type="text" @click="handleCommentThank(reply)">
                      <i class="el-icon-star-on"></i>
                      {{ reply.commentThankCnt }} 感谢
                    </el-button>
                    <el-button type="text" @click="replyToComment(reply)">
                      <i class="el-icon-chat-dot-round"></i>
                      回复
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-comments">暂无评论</div>
        </div>
      </div>
    </el-scrollbar>

    <!-- 评论对话框（底部弹出） -->
    <el-dialog
      v-model="commentDialogVisible"
      title="发表评论"
      width="90%"
      header-class="header-dialog"
      body-class="bottom-dialog"
      footer-class="dialog-footer"
      :close-on-click-modal="false"
    >
      <div v-if="replyTo" class="reply-to">
        回复 @{{ replyTo.commentAuthorName }}：
      </div>
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="4"
        placeholder="请输入评论内容"
        resize="none"
        @keyup.enter.ctrl="submitComment"
      />
      <template #footer>
        <el-button size="small" @click="handleCommentCancel">取消</el-button>
        <el-button
          type="primary"
          size="small"
          @click="submitComment"
          :loading="commentLoading"
        >
          发表评论
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getArticleDetail,
  voteUpArticle,
  thankArticle,
  getArticleComments,
  addComment,
  voteUpComment,
  thankComment
} from '@/popup/api/article'
import { mapGetters } from 'vuex'
import { ElMessageBox } from 'element-plus'
import { View as ViewIcon } from '@element-plus/icons-vue'

export default {
  name: 'ArticleDetail',
  components: {
    ViewIcon
  },
  data() {
    return {
      article: null,
      loading: true,
      error: null,
      commentContent: '',
      commentLoading: false,
      comments: [],
      commentPage: 1,
      commentTotal: 0,
      commentDialogVisible: false,
      replyTo: null
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
    articlePermalink() {
      return `${process.env.VUE_APP_BASE_URL}${this.article?.articlePermalink}`
    }
  },
  created() {
    this.fetchArticleDetail()
    this.fetchComments()
  },
  methods: {
    async fetchArticleDetail() {
      try {
        this.loading = true
        const articleId = this.$route.params.id
        const response = await getArticleDetail(articleId, this.apiKey)
        if (response.code === 0) {
          this.article = response.data.article
        } else {
          this.error = response.msg || '获取文章详情失败'
        }
      } catch (error) {
        this.error = '获取文章详情失败'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async handleLike() {
      try {
        const response = await voteUpArticle({
          ...this.apiKey,
          dataId: this.article.oId
        })
        if (response.code === 0) {
          if (response.type === -1) {
            this.article.articleGoodCnt++
            this.$message.success('点赞成功')
          } else {
            this.article.articleGoodCnt--
            this.$message.success('已取消点赞')
          }
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },
    async handleThank() {
      try {
        await ElMessageBox.confirm(
          '确定赠送 20 积分给该帖作者以表谢意？',
          '感谢确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const response = await thankArticle(this.article.oId, this.apiKey)
        if (response.code === 0) {
          this.$message.success('感谢成功')
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
          console.error(error)
        }
      }
    },
    async fetchComments() {
      try {
        const response = await getArticleComments(this.$route.params.id, {
          ...this.apiKey,
          p: this.commentPage
        })
        if (response.code === 0) {
          // 处理评论数据
          const comments = response.data.articleComments || []
          const niceComments = response.data.articleNiceComments || []

          // 合并优质评论和普通评论，去重
          const commentMap = new Map()
          niceComments.forEach((c) =>
            commentMap.set(c.oId, { ...c, isNice: true })
          )
          comments.forEach((c) => {
            if (!commentMap.has(c.oId)) {
              commentMap.set(c.oId, c)
            }
          })
          const allComments = Array.from(commentMap.values())

          // 标记优质评论（已在上面处理）

          // 处理评论层级
          const rootComments = allComments.filter(
            (comment) => !comment.commentOriginalCommentId
          )
          const replyComments = allComments.filter(
            (comment) => comment.commentOriginalCommentId
          )

          // 将回复评论组织到对应的父评论下
          rootComments.forEach((comment) => {
            comment.replies = replyComments
              .filter((reply) => reply.commentOriginalCommentId === comment.oId)
              .map((reply) => {
                // 处理第三层及以上的回复
                if (reply.commentOriginalCommentId !== comment.oId) {
                  const parentReply = replyComments.find(
                    (p) => p.oId === reply.commentOriginalCommentId
                  )
                  if (parentReply) {
                    reply.replyTo = {
                      name:
                        parentReply.commentAuthorNickName ||
                        parentReply.commentAuthorName,
                      id: parentReply.oId
                    }
                  }
                }
                return reply
              })
          })

          // 按时间倒序排序
          this.comments = rootComments.sort((a, b) => {
            return new Date(b.commentCreateTime) - new Date(a.commentCreateTime)
          })

          // 更新评论总数
          this.commentTotal = allComments.length
        }
      } catch (error) {
        console.error(error)
      }
    },
    async handleComment() {
      this.commentDialogVisible = true
    },
    handleCommentCancel() {
      this.commentDialogVisible = false
      this.replyTo = null
      this.commentContent = ''
    },
    async submitComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }
      try {
        this.commentLoading = true
        const response = await addComment({
          ...this.apiKey,
          articleId: this.article.oId,
          commentContent: this.commentContent,
          commentAnonymous: false,
          commentVisible: false,
          commentOriginalCommentId: this.replyTo?.oId
        })
        if (response.code === 0) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.commentDialogVisible = false
          this.replyTo = null
          this.fetchComments()
        } else {
          this.$message.error(response.msg || '评论失败')
        }
      } catch (error) {
        this.$message.error('评论失败')
        console.error(error)
      } finally {
        this.commentLoading = false
      }
    },
    async handleCommentLike(comment) {
      try {
        const response = await voteUpComment({
          ...this.apiKey,
          dataId: comment.oId
        })
        if (response.code === 0) {
          if (response.type === -1) {
            comment.commentGoodCnt++
            this.$message.success('点赞成功')
          } else {
            comment.commentGoodCnt--
            this.$message.success('已取消点赞')
          }
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },
    async handleCommentThank(comment) {
      if (comment.commentAuthorId === this.article.articleAuthorId) {
        this.$message.warning('不能感谢自己的评论')
        return
      }
      try {
        await ElMessageBox.confirm(
          '确定赠送 15 积分给该评论作者以表谢意？',
          '感谢确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const response = await thankComment({
          ...this.apiKey,
          commentId: comment.oId
        })
        if (response.code === 0) {
          this.$message.success('感谢成功')
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
          console.error(error)
        }
      }
    },
    replyToComment(comment) {
      this.replyTo = comment
      this.commentDialogVisible = true
    },
    goBack() {
      this.$router.push({ name: 'ArticleList' })
    }
  }
}
</script>

<style scoped>
.article-detail {
  background: #181818;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
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

.article-scrollbar {
  margin-top: 40px;
  height: 93vh;
}

.article-content {
  padding: 16px;
  color: #e0e0e0;
}

.article-header {
  margin-bottom: 20px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #fff;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999;
  margin-bottom: 8px;
  font-size: 12px;
  flex-wrap: wrap;
}

.author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.article-tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.article-body {
  margin-bottom: 24px;
  line-height: 1.6;
  color: #e0e0e0;
  font-size: 14px;
}

.article-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.article-body :deep(p) {
  margin: 8px 0;
}

.article-footer {
  border-top: 1px solid #232323;
}

.article-actions {
  display: flex;
  gap: 16px;
}

.article-comments {
  border-top: 1px solid #232323;
}

.article-comments h3 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.comment-item {
  position: relative;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.comment-item:hover .comment-actions {
  display: flex;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-content {
  margin-left: 32px;
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 14px;
}

.comment-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 4px 0;
}

.no-comments {
  text-align: center;
  color: #666;
  padding: 32px 0;
}

:deep(.el-page-header__left),
:deep(.el-page-header__content) {
  color: white;
}

:deep(.el-button--text) {
  color: #999;
}

:deep(.el-button--text:hover) {
  color: #fff;
}

:deep(.el-tag) {
  background: #232323;
  border-color: #333;
  color: #bbb;
  margin-right: 4px;
}

.loading {
  padding: 32px;
  text-align: center;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error {
  padding: 16px;
  color: #ff4d4f;
  text-align: center;
}

:deep(.el-icon) {
  animation: none !important;
}

:deep(.is-loading) {
  animation: none !important;
}

.comment-actions,
.reply-actions {
  display: none;
  margin-left: 32px;
  margin-top: 8px;
  gap: 12px;
}

.comment-item:hover .comment-actions,
.reply-item:hover .reply-actions {
  display: flex;
}

.comment-actions .el-button,
.reply-actions .el-button {
  font-size: 12px;
  padding: 0 4px;
  color: #999;
}

.comment-actions .el-button:hover,
.reply-actions .el-button:hover {
  color: #fff;
}

.comment-content {
  margin-left: 32px;
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 14px;
}

.reply-content {
  margin-left: 32px;
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 13px;
}

.reply-to {
  margin-bottom: 10px;
  color: #409eff;
  font-size: 14px;
  background: rgba(64, 158, 255, 0.08);
  border-radius: 6px;
  padding: 4px 10px;
  display: inline-block;
}

:deep(.el-dialog) {
  background: #2c2c2c;
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  background: #232323;
  border-radius: 10px;
  border: 1.5px solid #333;
  color: #e0e0e0;
  font-size: 15px;
  padding: 12px;
  min-height: 80px;
  width: calc(100% - 20px);
  margin: auto;
}

:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}

.nice-comment {
  background: rgba(103, 194, 58, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-header .author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.1);
  border-color: #67c23a;
  color: #67c23a;
}

.comment-replies {
  margin-left: 32px;
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.reply-item {
  position: relative;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.reply-item:hover .reply-actions {
  display: flex;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-header .author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.reply-actions {
  margin-left: 32px;
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.reply-actions .el-button {
  font-size: 12px;
  padding: 0 4px;
}

:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.1);
  border-color: #e6a23c;
  color: #e6a23c;
  margin-left: 4px;
}

.comment-input-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #2c2c2c;
  padding: 12px 16px;
  border-top: 1px solid #232323;
  z-index: 1;
}

.comment-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tip {
  color: #999;
  font-size: 12px;
}

.simple-loading {
  color: #aaa;
  text-align: center;
  padding: 32px 0;
  font-size: 15px;
}

:deep(a) {
  color: #409eff;
}

/* 评论弹窗底部弹出样式 */
:deep(.header-dialog) {
  padding: 10px;
}

:deep(.el-dialog__title) {
  color: #fff;
}

:deep(.bottom-dialog) {
  border-radius: 18px 18px 0 0;
  background: #232323;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.18);
}

:deep(.el-dialog__footer) {
  padding: 10px 20px;
}
</style>
