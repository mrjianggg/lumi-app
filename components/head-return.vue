<template>
  <view class="page-header" :style="{paddingTop: statusBarHeight + 'rpx'}">
    <image @click="goBack" src="/static/icon/head-return.svg" mode="widthFix" class="page-header-back"></image>
    <view class="page-header-title">
      <text>{{ title }}</text>
    </view>
    <view class="page-header-back"></view>
  </view>
</template>

<script>
export default {
  name: 'HeadReturn',
  props: {
    toPage: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      statusBarHeight: 0
    }
  },
  watch: {

  },
  mounted() {
    this.statusBarHeight = uni.getStorageSync('statusBarHeight')
  },
  methods: {
    goBack() {
      // 返回到TabBar容器的设备页面
      uni.reLaunch({
        url: '/pages/tabbar-container/index?tab=' + this.toPage
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 140rpx;
  z-index: 2;
  background-color: #fff;
  border-bottom: 1rpx solid #D9D9D9;
  .page-header-back {
    margin-left: 30rpx;
    width: 44.8rpx;
    height: 44.8rpx;
  }

  .page-header-title {
    font-size: 44.8rpx;
    font-weight: 400;
    color: #303030;
  }
}



</style> 