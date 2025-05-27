<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="转账积分"
    width="380px"
    :before-close="handleClose"
    class="transfer-dialog dark-theme"
  >
    <div class="dialog-content">
      <el-form :model="form" label-width="80px" class="transfer-form">
        <el-form-item label="收款人" class="form-item-margin">
          <div class="user-display">
            <el-avatar :size="24" class="user-avatar">{{
              userName.charAt(0)
            }}</el-avatar>
            <span class="user-name">{{ userName }}</span>
          </div>
        </el-form-item>
        <el-form-item label="转账金额" class="form-item-margin">
          <el-input
            v-model="form.amount"
            type="number"
            placeholder="请输入转账金额"
            :min="1"
          >
            <template #append>积分</template>
          </el-input>
          <div class="amount-tips">最小转账金额为 1 积分</div>
        </el-form-item>
        <el-form-item label="转账备注" class="form-item-margin">
          <el-input
            v-model="form.memo"
            type="textarea"
            placeholder="请输入转账备注（选填）"
            :rows="2"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="caution-tip">转账后积分即时到账，请谨慎交易</div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleTransfer">
          确认转账
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { transferPoint } from '@/popup/api/user'

export default {
  name: 'TransferDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    userName: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      form: {
        amount: '',
        memo: ''
      },
      loading: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:modelValue', false)
      this.resetForm()
    },
    resetForm() {
      this.form = {
        amount: '',
        memo: ''
      }
    },
    async handleTransfer() {
      if (this.loading) return

      if (
        !this.form.amount ||
        isNaN(this.form.amount) ||
        Number(this.form.amount) <= 0
      ) {
        this.$message.error('请输入有效的转账金额')
        return
      }

      this.loading = true
      try {
        const data = {
          apiKey: this.apiKey,
          userName: this.userName,
          amount: Number(this.form.amount),
          memo: this.form.memo || ''
        }

        await transferPoint(data)
        this.$message.success('转账成功')
        this.$emit('update:modelValue', false)
        this.$emit('success')
      } catch (error) {
        console.error('Transfer failed:', error)
        this.$message.error('转账失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Global or component-wide styles to override Element Plus defaults */
.transfer-dialog.dark-theme {
  /* Dialog Header */
  .el-dialog__header {
    background-color: #2c2c2c;
    color: #ffffff;
    border-bottom: 1px solid #444444;
    padding: 16px 20px;
  }

  .el-dialog__title {
    color: #ffffff;
    font-size: 16px;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: #ffffff;
  }

  /* Dialog Body */
  .el-dialog__body {
    background-color: #3a3a3a;
    color: #ffffff;
    padding: 20px;
  }

  .transfer-form {
    /* Form Item Spacing */
    .el-form-item {
      margin-bottom: 18px; /* Space between form items */
    }

    .el-form-item__label {
      color: #cccccc;
    }

    /* Recipient Display */
    .user-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      background-color: #007bff; /* Example accent color */
      color: white;
      font-size: 14px;
    }

    .user-name {
      color: #ffffff;
      font-size: 14px;
    }

    /* Input Fields */
    .el-input,
    .el-textarea {
      .el-input__inner,
      .el-textarea__inner {
        background-color: #4f4f4f;
        color: #ffffff;
        border: 1px solid #5a5a5a; /* Added border */
        padding: 8px 12px;
      }
      /* Input Append */
      .el-input-group__append {
        background-color: #5a5a5a;
        color: #ffffff;
        border: 1px solid #5a5a5a; /* Added border */
        border-left: none; /* Remove left border to merge with input */
        padding: 8px 12px;
      }
    }

    /* Amount Tips */
    .amount-tips {
      font-size: 12px;
      color: #cccccc;
      margin-top: 6px; /* Space above the tip */
    }

    /* Textarea Word Limit */
    .el-textarea {
      .el-input__count {
        background-color: #4f4f4f;
        color: #cccccc;
        right: 12px;
        bottom: 5px;
      }
    }
  }

  /* Caution Tip */
  .caution-tip {
    font-size: 13px;
    color: #ffcc00; /* Warning color */
    text-align: center;
    margin-top: 20px; /* Space above the tip */
    margin-bottom: 20px; /* Space below the tip */
    padding-top: 15px;
    border-top: 1px solid #444444;
  }

  /* Dialog Footer */
  .el-dialog__footer {
    background-color: #2c2c2c;
    border-top: 1px solid #444444;
    padding: 16px 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px; /* Space between buttons */

    /* Buttons */
    .el-button {
      padding: 8px 15px;
    }

    .el-button--default {
      background-color: #5a5a5a;
      color: #ffffff;
      border: 1px solid #5a5a5a;

      &:hover {
        background-color: #6a6a6a;
        border-color: #6a6a6a;
      }
    }

    .el-button--primary {
      background-color: #007bff; /* Primary button color */
      border: 1px solid #007bff;

      &:hover {
        background-color: #0056b3;
        border-color: #0056b3;
      }
    }
  }
}
</style>
<style>
.el-dialog {
  padding: 20px;
}
</style>
