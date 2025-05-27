<template>
	<view class="home-container">
		<!-- 顶部标题区域 -->
		<view class="header-section">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="app-title">ESP 智能配网</text>
			<text class="app-subtitle">快速连接并配置您的 ESP 设备</text>
		</view>
		
		<!-- 功能卡片区域 -->
		<view class="feature-cards">
			<view class="feature-card" @click="goToScanPage">
				<view class="card-icon">
					<text class="icon-bluetooth">📶</text>
				</view>
				<text class="card-title">ESP配网</text>
				<text class="card-desc">搜索ESP设备并配网</text>
			</view>
			
			<view class="feature-card" @click="goToUniversalScan">
				<view class="card-icon">
					<text class="icon-bluetooth">🔍</text>
				</view>
				<text class="card-title">蓝牙扫描</text>
				<text class="card-desc">扫描所有蓝牙设备</text>
			</view>
		</view>
		
		<!-- 快速开始按钮 -->
		<view class="quick-start">
			<button class="start-button" @click="goToUniversalScan">
				<text class="button-text">开始扫描蓝牙设备</text>
			</button>
		</view>
		
		<!-- 底部说明 -->
		<view class="footer-tips">
			<text class="tip-text">提示：请确保蓝牙已开启</text>
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
		goToScanPage() {
			uni.navigateTo({
				url: '/pages/index/device-list'
			});
		},
		goToUniversalScan() {
			console.log('点击了蓝牙扫描按钮');
			uni.showToast({
				title: '正在跳转...',
				icon: 'loading',
				duration: 1000
			});
			
			uni.navigateTo({
				url: '/pages/index/universal-bluetooth-scan',
				success: (res) => {
					console.log('跳转成功:', res);
				},
				fail: (err) => {
					console.error('跳转失败:', err);
					uni.showModal({
						title: '跳转失败',
						content: '无法打开蓝牙扫描页面: ' + JSON.stringify(err),
						showCancel: false
					});
				}
			});
		},
		showGuide() {
			uni.showModal({
				title: '使用指南',
				content: '1. 确保蓝牙已开启\n2. 点击扫描设备\n3. 选择要连接的设备\n4. 输入 WiFi 信息完成配网',
				showCancel: false,
				confirmText: '我知道了'
			});
		}
	}
}
</script>

<style>
.home-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx;
}

.header-section {
	text-align: center;
	padding-top: 80rpx;
	margin-bottom: 80rpx;
}

.logo {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 30rpx;
}

.app-title {
	font-size: 48rpx;
	color: #ffffff;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.app-subtitle {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	display: block;
}

.feature-cards {
	display: flex;
	justify-content: space-between;
	margin-bottom: 80rpx;
}

.feature-card {
	width: 45%;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 40rpx 20rpx;
	text-align: center;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.feature-card:active {
	transform: scale(0.95);
}

.card-icon {
	margin-bottom: 20rpx;
}

.icon-bluetooth, .icon-guide {
	font-size: 60rpx;
}

.card-title {
	font-size: 32rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.card-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
}

.quick-start {
	margin-bottom: 60rpx;
}

.start-button {
	background: #ffffff;
	color: #667eea;
	border: none;
	border-radius: 50rpx;
	padding: 30rpx 60rpx;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.start-button:active {
	transform: scale(0.95);
}

.button-text {
	color: #667eea;
}

.footer-tips {
	text-align: center;
	position: absolute;
	bottom: 60rpx;
	left: 0;
	right: 0;
}

.tip-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}
</style> 