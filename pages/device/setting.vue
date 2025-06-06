<template>
	<view class="role-page">
		<head-return :toPage="0" title=""></head-return>
		<view class="page-content">
			<view class="slider-container">
				<slider class="slider-voice" value="50" @change="sliderChange" activeColor="#D5CFFF" backgroundColor="#F5F5F5" block-color="transparent" block-size="60" />
			</view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			// TabBar切换事件处理
			handleTabChange(index) {
				const tabPages = [
					'/pages/tabbar-container/index?tab=0', // 设备页面
					'/pages/tabbar-container/index?tab=1', // 聊天页面  
					'/pages/tabbar-container/index?tab=2'  // 个人页面
				];
				
				if (tabPages[index]) {
					uni.reLaunch({
						url: tabPages[index]
					});
				}
			},
			sliderChange(e) {
            	console.log('value 发生变化：' + e.detail.value)
        	}

		}
	}
</script>

<style lang="scss">
	.role-page {
		.page-content{
			padding: 0 40rpx 220rpx 40rpx; /* 底部增加TabBar预留空间 */
			.slider-container{
				:deep(.uni-slider-track) {
					height: 100.7rpx !important;
					border-radius: 59.7rpx !important;

				}
				:deep(.uni-slider-handle-wrapper) {
					height: 100.7rpx !important;
					border-radius: 59.7rpx !important;
					border: 1px solid #D9D9D9 !important;
				}
				:deep(.uni-slider-thumb) {
					box-shadow: none !important;
				}
			}
		}
	}
	
	/* 全局样式方式（如果上面方法不行） */
	/* 
	:global(.uni-slider-wrapper) {
		height: 100rpx !important;
	}
	
	:global(.uni-slider-handle-wrapper) {
		height: 100rpx !important;
	}
	*/
</style>