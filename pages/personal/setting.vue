<template>
	<view class="page-main">
		<head-return :toPage="2" title="设置"></head-return>
		<view class="page-content">
			<view class="menu-section">
				<view class="menu-item" @click="openExchange">
					<text class="menu-text">语言</text>
					<view class="menu-item-right">
						<text class="menu-item-right-text">简体中文</text>
						<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
					</view>
				</view>
	
				<view class="menu-item" @click="openSetting">
					<text class="menu-text">已是最新版本</text>
					<view class="menu-item-right">
						<text class="menu-item-right-text">v1.1.0</text>
					</view>
				</view>
			</view>
		</view>

		<view class="logout-btn" @click="logout">
			退出登录
		</view>
	</view>
</template>

<script>
	import http from '@/utils/request.js'
	export default {
		data() {
			return {

			}
		},
		methods: {
			logout() {
				// uni.redirectTo({ url: '/pages/login/index' });
				http.post('/user/logout').then(res => {
					if(res.code === 0){
						uni.removeStorageSync('currentDevice');
						uni.removeStorageSync('token');
						uni.removeStorageSync('userInfo');
						uni.reLaunch({ url: '/pages/login/index' });
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-main {
		min-height: 100vh;
		background-color: #fff;
		position: relative;
		.page-content {
			margin-top: 59.7rpx;
			padding: 0 39.2rpx;
			.menu-section {
				background: #F5F5F5;
				margin-top: 59.7rpx;
				border: 1px solid #D9D9D9;
				border-radius: 29.9rpx;
				padding: 0 14.9rpx;
				.menu-item:last-child {
					border-bottom: none;
				}
				.menu-item {
					display: flex;
					align-items: center;
					padding: 29.9rpx 14.9rpx;
					border-bottom: 1rpx solid #D9D9D9;
					.menu-text {
						flex: 1;
						font-size: 29.9rpx;
						font-weight: 400;
						color: #1E1E1E;
					}
					.menu-item-right{
						display: flex;
						align-items: center;
						justify-content: start;
						.menu-item-right-text{
							font-size: 26.1rpx;
							font-weight: 400;
							color: #757575;
						}
						image{
							width: 37.3rpx;
							height: 37.3rpx;
						}
					}
				}
			}
		}
		.logout-btn{
			position: absolute;
			bottom: 46.6rpx;
			width: calc(100% - 78.4rpx);
			margin: 0 39.2rpx;
			height: 85.8rpx;
			border-radius: 59.7rpx;
			border: 1rpx solid #D9D9D9;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 29.9rpx;
			font-weight: 400;
			color: #1E1E1E;
		}
	}
</style>