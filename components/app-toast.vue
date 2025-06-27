<template>
  <view class="app-toast-container" v-if="toastList.length > 0">
    <view 
      v-for="toast in toastList" 
      :key="toast.id"
      :class="['toast-item', `toast-${toast.type}`, { 'toast-show': toast.show }]"
    >
      <image src="/static/img/success-img.png" class="toast-item-img" mode="widthFix" v-if="toast.type === 'success'"></image>
      <image src="/static/img/error-img.png" class="toast-item-img" mode="widthFix" v-if="toast.type === 'error'"></image>
      
      <!-- 状态图标 -->
      <view class="toast-icon" v-if="toast.type === 'success'">
        <image src="/static/icon/success-icon.svg" class="toast-icon-img" mode="widthFix"></image>
        <view class="toast-message">{{ toast.message }}</view>
      </view>
      <view class="toast-icon" v-if="toast.type === 'error'">
        <image src="/static/icon/error-icon.svg" class="toast-icon-img" mode="widthFix"></image>
        <view class="toast-message">{{ toast.message }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import customToast from '@/utils/toast.js'

export default {
  name: 'AppToast',
  data() {
    return {
      toastList: []
    }
  },
  mounted() {
    // 注册Toast监听器
    customToast.addListener(this.showToast)
  },
  beforeUnmount() {
    // 移除Toast监听器
    customToast.removeListener(this.showToast)
  },
  methods: {
    showToast(toast) {
      this.toastList.push({
        ...toast,
        show: false
      })
      
      // 延迟显示，触发动画
      this.$nextTick(() => {
        setTimeout(() => {
          const index = this.toastList.findIndex(t => t.id === toast.id)
          if (index > -1) {
            this.toastList[index].show = true
          }
        }, 50)
      })
      
      // 自动移除
      setTimeout(() => {
        this.removeToast(toast.id)
      }, toast.duration)
    },
    
    removeToast(id) {
      const index = this.toastList.findIndex(toast => toast.id === id)
      if (index > -1) {
        // 先隐藏
        this.toastList[index].show = false
        // 延迟移除，等待动画完成
        setTimeout(() => {
          const currentIndex = this.toastList.findIndex(toast => toast.id === id)
          if (currentIndex > -1) {
            this.toastList.splice(currentIndex, 1)
          }
        }, 300)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.app-toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 998;
  pointer-events: none;
}

.toast-item {
  z-index: 999;
  position: relative;
  width: 400rpx;
  opacity: 0;
  transform: scale(0.3) translateY(-50rpx);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 59.7rpx;
  background: #FFFFFF;
  border: 1px solid #D9D9D9;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 44.8rpx;
  .toast-item-img{
    width: 257.5rpx;
  }
  .toast-icon{
    display: flex;
    align-items: center;
    color: #303030;
    font-size: 29.9rpx;
    font-weight: 400;
    margin-top: 45rpx;
    .toast-icon-img{
      width: 44.8rpx;
      height: 44.8rpx;
    }
    .toast-message{
      text-align: center;
      margin-left: 10.4rpx;
      flex: 1;
    }
  }
  &.toast-show {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
/* 动画效果 */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -10rpx, 0);
  }
  70% {
    transform: translate3d(0, -5rpx, 0);
  }
  90% {
    transform: translate3d(0, -2rpx, 0);
  }
}

</style> 