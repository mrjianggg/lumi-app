<template>
  <view class="tabbar-container">
    <!-- 动态显示当前选中的页面组件 -->
    <view 
      v-if="currentTabIndex === 0" 
      class="tab-page"
    >
      <device-page ref="devicePage" />
    </view>
    
    <view 
      v-if="currentTabIndex === 1" 
      class="tab-page"
    >
      <chat-page ref="chatPage" />
    </view>
    
    <view 
      v-if="currentTabIndex === 2" 
      class="tab-page"
    >
      <personal-page ref="personalPage" />
    </view>
    
    <!-- 自定义TabBar -->
    <custom-tabbar 
      :current="currentTabIndex" 
      @change="handleTabChange"
    />
  </view>
</template>

<script>
// 导入页面组件
import DevicePage from '../device/index.vue'
import ChatPage from '../chat/index.vue'
import PersonalPage from '../personal/index.vue'

export default {
  name: 'TabbarContainer',
  components: {
    DevicePage,
    ChatPage,
    PersonalPage
  },
  data() {
    return {
      currentTabIndex: 0
    }
  },
  
  onLoad(options) {
    // 根据参数确定初始显示的tab
    if (options.tab) {
      this.currentTabIndex = parseInt(options.tab) || 0;
    }
    
    // 等待组件挂载后再分发生命周期
    this.$nextTick(() => {
      this.distributeLifecycle('onLoad', options);
    });
  },
  
  onReady() {
    // 分发onReady生命周期
    this.distributeLifecycle('onReady');
  },
  
  onShow() {
    // 分发生命周期到当前显示的组件
    this.distributeLifecycle('onShow');
  },
  
  onHide() {
    // 分发生命周期到当前显示的组件
    this.distributeLifecycle('onHide');
  },
  
  onUnload() {
    // 分发生命周期到所有组件
    this.distributeLifecycle('onUnload', null, true);
  },
  
  methods: {
    handleTabChange(index) {
      if (index === this.currentTabIndex) return;
      
      // 触发当前组件的onHide
      this.distributeLifecycle('onHide');
      
      // 切换tab
      const oldIndex = this.currentTabIndex;
      this.currentTabIndex = index;
      
      // 触发新组件的onShow  
      this.$nextTick(() => {
        this.distributeLifecycle('onShow');
      });
      
      console.log(`Tab切换: ${oldIndex} -> ${index}`);
    },
    
    // 生命周期分发器
    distributeLifecycle(lifecycle, params = null, toAll = false) {
      const componentRefs = [
        this.$refs.devicePage,
        this.$refs.chatPage, 
        this.$refs.personalPage
      ];
      
      if (toAll) {
        // 分发到所有组件
        componentRefs.forEach(ref => {
          if (ref && ref[lifecycle]) {
            ref[lifecycle](params);
          }
        });
      } else {
        // 只分发到当前组件
        const currentRef = componentRefs[this.currentTabIndex];
        if (currentRef && currentRef[lifecycle]) {
          currentRef[lifecycle](params);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tabbar-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  
  /* 隐藏滚动条 - 兼容各种浏览器 */
  /* Chrome, Safari, Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* IE, Edge */
  -ms-overflow-style: none;
  
  /* Firefox */
  scrollbar-width: none;
}

.tab-page {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
}
</style> 