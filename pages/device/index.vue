<template>
	<view class="device-container">
		<!-- 设备头像和名称 -->
		<view class="device-header">
			<view class="device-avatar">
				<text class="device-emoji">🐑</text>
			</view>
			<text class="device-name">Namyvera</text>
			
			<!-- 状态指示器 -->
			<view class="status-indicators">
				<view class="status-item">
					<view class="status-dot online"></view>
					<text class="status-text">在线</text>
				</view>
				<view class="status-item">
					<view class="status-dot charging"></view>
					<text class="status-text">充电</text>
				</view>
			</view>
		</view>
		
		<!-- 梦想精灵卡片 -->
		<view class="dream-card">
			<view class="card-header">
				<view class="card-icon">
					<text class="icon-emoji">🌸</text>
				</view>
				<view class="card-content">
					<text class="card-title">梦想精灵</text>
					<text class="card-desc">梦想精灵是具有不充满的想象力和创造性的精灵，爱做梦</text>
				</view>
			</view>
			
			<!-- 设置角色按钮 -->
			<button class="role-button" @click="goToProvisioning">
				<text class="button-icon">⚙️</text>
				<text class="button-text">设置角色</text>
			</button>
		</view>
		
		<!-- 行为引导按钮 -->
		<button class="guide-button" @click="showComingSoon">
			行为引导 >
		</button>
		
		<!-- 内容推荐 -->
		<view class="content-section">
			<text class="section-title">内容推荐</text>
			
			<view class="content-item">
				<view class="content-bg dream-bg">
					<text class="content-title">梦想精灵故事</text>
				</view>
				<view class="content-info">
					<text class="info-icon">ⓘ</text>
				</view>
			</view>
			
			<view class="content-item">
				<text class="content-title">少儿英语</text>
				<text class="content-arrow">></text>
			</view>
			
			<view class="content-item">
				<text class="content-title">其内容</text>
				<text class="content-arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			deviceName: 'Namyvera'
		}
	},
	methods: {
		// 跳转到配网页面
		goToProvisioning() {
			uni.navigateTo({
				url: '/pages/index/provisioning-flow'
			});
		},
		
		// 显示即将开放提示
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
.device-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #e3c7ff 0%, #f0e6ff 100%);
	padding: 40rpx 30rpx 40rpx;
	box-sizing: border-box;
}

/* 设备头部 */
.device-header {
	text-align: center;
	margin-bottom: 60rpx;
	padding-top: 40rpx;
}

.device-avatar {
	width: 160rpx;
	height: 160rpx;
	background: #fff;
	border-radius: 50%;
	margin: 0 auto 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.device-emoji {
	font-size: 80rpx;
	line-height: 1;
}

.device-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.status-indicators {
	display: flex;
	justify-content: center;
	gap: 30rpx;
}

.status-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.status-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
}

.status-dot.online {
	background: #4CAF50;
}

.status-dot.charging {
	background: #FF9800;
}

.status-text {
	font-size: 24rpx;
	color: #666;
}

/* 梦想精灵卡片 */
.dream-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-header {
	display: flex;
	align-items: flex-start;
	margin-bottom: 30rpx;
}

.card-icon {
	width: 60rpx;
	height: 60rpx;
	background: #FFE4E1;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.icon-emoji {
	font-size: 32rpx;
}

.card-content {
	flex: 1;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.card-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.5;
	display: block;
}

.role-button {
	width: 100%;
	height: 80rpx;
	background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
	border: none;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.button-icon {
	font-size: 28rpx;
}

.button-text {
	font-size: 28rpx;
	font-weight: bold;
	color: #fff;
}

/* 行为引导按钮 */
.guide-button {
	width: 100%;
	height: 80rpx;
	background: #4A90E2;
	border: none;
	border-radius: 16rpx;
	color: #fff;
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

/* 内容推荐 */
.content-section {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.content-item {
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.content-bg {
	background: linear-gradient(135deg, #FFD700, #FFA500);
	border-radius: 12rpx;
	padding: 20rpx 30rpx;
	margin-right: 20rpx;
}

.dream-bg .content-title {
	color: #fff;
	font-weight: bold;
}

.content-title {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.content-arrow {
	font-size: 24rpx;
	color: #999;
}

.content-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.info-icon {
	width: 40rpx;
	height: 40rpx;
	background: #f0f0f0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	color: #666;
}
</style> 