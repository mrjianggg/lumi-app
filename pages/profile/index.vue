<template>
	<view class="profile-container">
		<view class="profile-header">
			<view class="avatar">
				<text class="avatar-text">👤</text>
			</view>
			<text class="username">用户名</text>
			<text class="user-id">ID: 123456</text>
		</view>
		
		<view class="menu-section">
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-icon">⚙️</text>
				<text class="menu-text">设置</text>
				<text class="menu-arrow">></text>
			</view>
			
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-icon">📱</text>
				<text class="menu-text">我的设备</text>
				<text class="menu-arrow">></text>
			</view>
			
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-icon">❓</text>
				<text class="menu-text">帮助与反馈</text>
				<text class="menu-arrow">></text>
			</view>
			
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-icon">📞</text>
				<text class="menu-text">联系我们</text>
				<text class="menu-arrow">></text>
			</view>
		</view>
		
		<view class="logout-section">
			<button class="logout-btn" @click="showComingSoon">退出登录</button>
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
		showComingSoon() {
			uni.showToast({
				title: '功能即将开放',
				icon: 'none'
			});
		}
	}
}
</script>

<style scoped>
.profile-container {
	min-height: 100vh;
	background: #f5f5f5;
	padding-top: var(--status-bar-height);
}

.profile-header {
	background: #fff;
	padding: 60rpx 40rpx;
	text-align: center;
	margin-bottom: 20rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	background: #e5e5e5;
	border-radius: 50%;
	margin: 0 auto 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-text {
	font-size: 60rpx;
}

.username {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.user-id {
	font-size: 26rpx;
	color: #999;
	display: block;
}

.menu-section {
	background: #fff;
	margin-bottom: 20rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-icon {
	font-size: 36rpx;
	margin-right: 20rpx;
}

.menu-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.menu-arrow {
	font-size: 24rpx;
	color: #999;
}

.logout-section {
	padding: 40rpx;
}

.logout-btn {
	width: 100%;
	height: 80rpx;
	background: #ff4757;
	border: none;
	border-radius: 16rpx;
	color: #fff;
	font-size: 28rpx;
	font-weight: bold;
}
</style> 