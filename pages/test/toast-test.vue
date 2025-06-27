<template>
  <view class="test-container">
    <!-- 直接在页面中引入Toast组件进行测试 -->
    <app-toast></app-toast>
    <view class="test-header">
      <text class="test-title">自定义Toast</text>
      <text class="test-subtitle">云朵样式提示框</text>
    </view>
    
    <view class="button-group">
      <button class="test-button success" @click="testSuccess">
        ✓ 成功提示
      </button>
      
      <button class="test-button error" @click="testError">
        ✕ 失败提示
      </button>
      
      <button class="test-button" @click="testLogin">
        模拟登录成功
      </button>
      
      <button class="test-button" @click="testNetworkError">
        模拟网络错误
      </button>
    </view>
    
    <view class="usage-info">
      <text class="info-title">使用方法：</text>
      <text class="info-text">this.$toast.success('操作成功！')</text>
      <text class="info-text">this.$toast.error('操作失败！')</text>
    </view>
  </view>
</template>

<script>

export default {
  name: 'FinalTest',

  methods: {
    testSuccess() {
      this.$toast.success('操作成功！')
    },
    
    testError() {
      this.$toast.error('操作失败！')
    },
    
    testLogin() {
      this.$toast.success('登录成功')
    },
    
    testNetworkError() {
      this.$toast.error('网络连接失败，请重试')
    }
  }
}
</script>

<style scoped>
.test-container {
  padding: 60rpx 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.test-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.test-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
  display: block;
}

.test-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.button-group {
  width: 100%;
  max-width: 400rpx;
  margin-bottom: 80rpx;
}

.test-button {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-button.success {
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  border: none;
}

.test-button.error {
  background: linear-gradient(135deg, #e17055 0%, #d63031 100%);
  border: none;
}

.test-button:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.usage-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 40rpx;
  backdrop-filter: blur(10rpx);
  width: 100%;
  max-width: 500rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  margin-bottom: 20rpx;
  display: block;
}

.info-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  display: block;
}
</style> 