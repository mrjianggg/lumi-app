<template>
	<view class="chat-container">
		<view class="header">
			<text class="title">聊天</text>
		</view>
		
		<view class="chat-content">
			<view class="empty-state">
				<text class="empty-emoji">💬</text>
				<text class="empty-text">暂无聊天记录</text>
				<text class="empty-desc">开始与您的设备对话吧</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	methods: {
		
	}
}
</script>

<style scoped>
.chat-container {
	min-height: 100vh;
	background: #f5f5f5;
	padding-top: var(--status-bar-height);
}

.header {
	background: #fff;
	padding: 20rpx 40rpx;
	border-bottom: 1rpx solid #e5e5e5;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.chat-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 200rpx 40rpx;
}

.empty-state {
	text-align: center;
}

.empty-emoji {
	font-size: 120rpx;
	display: block;
	margin-bottom: 40rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	display: block;
	margin-bottom: 20rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #999;
	display: block;
}
</style> 