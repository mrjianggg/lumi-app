<template>
  <view class="custom-tabbar-container">
    <view class="custom-tabbar">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        class="tab-item"
        @tap="switchTab(index)"
      >
        <image 
          :src="currentIndex === index ? item.selectedIconPath : item.iconPath" 
          class="icon-image"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabbar',
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentIndex: 0,
      tabList: [
        {
          pagePath: '/pages/device/index',
          text: '首页',
          iconPath: '/static/tabBar/home.png',
          selectedIconPath: '/static/tabBar/home-clicked.png'
        },
        {
          pagePath: '/pages/chat/index', 
          text: '聊天',
          iconPath: '/static/tabBar/chat.png',
          selectedIconPath: '/static/tabBar/chat-clicked.png'
        },
        {
          pagePath: '/pages/profile/index',
          text: '个人',
          iconPath: '/static/tabBar/profile.png',
          selectedIconPath: '/static/tabBar/profile-clicked.png'
        }
      ]
    }
  },
  watch: {
    current: {
      handler(newVal) {
        this.currentIndex = newVal;
      },
      immediate: true
    }
  },
  mounted() {
    this.setCurrentIndex();
  },
  methods: {
    setCurrentIndex() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage.route;
      
      this.tabList.forEach((item, index) => {
        if (currentRoute.includes(item.pagePath.replace('/pages/', '').replace('/index', ''))) {
          this.currentIndex = index;
        }
      });
    },
    switchTab(index) {
      if (index === this.currentIndex) return;
      
      // 更新当前索引
      this.currentIndex = index;
      
      // 通过事件通知父组件切换tab，不再进行页面跳转
      this.$emit('change', index);
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 0 20rpx 20rpx 20rpx;
  pointer-events: none;
  .custom-tabbar {
    background: #fff;
    border: 1px solid #D9D9D9;
    box-shadow: 0px 4px 10px 0px #0000001A;
    border-radius: 80rpx;
    height: 154.9rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: auto;
    position: relative;
    .tab-item {
      .icon-image {
        width: 110.1rpx;
        height: 110.1rpx;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    
  }
}



</style> 