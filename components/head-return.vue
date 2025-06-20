<template>
  <view class="page-header">
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

    }
  },
  watch: {

  },
  mounted() {

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 140rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #D9D9D9;
  padding-top: 20rpx;
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