<template>
	<view class="personal-container">
		<view class="personal-header" @click="openUserInfo">
			<image :src="BASE_URL + userInfo.avatar" class="header-image" :style="{borderWidth: userInfo.avatar ? '0' : '1px'}"></image>
			<view class="header-username">{{userInfo.nickName}}</view>
			<image src="/static/icon/Edit_light.svg" mode="widthFix" class="header-edit"></image>
		</view>

		<view class="my-device">
			<view class="my-device-name">我的设备</view>
			<view class="my-device-btn" @click="openMyDevices" v-if="deviceList.length > 1">
				查看全部
				<image src="/static/icon/right-bt.svg" mode="widthFix"></image>
			</view>
		</view>
		
		<view class="device-list-item">
			<image src="/static/img/deviceImg.png" mode="widthFix" class="device-list-item-img"></image>
			<view class="device-list-item-info" v-if="deviceList.length > 0">
				<view class="device-list-item-info-name">
					<text>{{deviceList[0]?.alias || deviceList[0]?.macAddress}}</text>
				</view>
				<view class="device-list-item-info-deviceId">
					<text>SN:{{deviceList[0]?.macAddress}}</text>
				</view>
			</view>
			<view class="device-list-item-info" v-else>
				<view class="device-list-item-info-name">
					<text>暂无设备</text>
				</view>
			</view>
		</view>

		<view class="menu-section">
			<view class="menu-item" @click="openExchange">
				<text class="menu-text">兑换</text>
				<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
			</view>

			<view class="menu-item" @click="openSetting">
				<text class="menu-text">设置</text>
				<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
			</view>
			
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-text">使用说明</text>
				<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
			</view>
			
			<view class="menu-item" @click="showComingSoon">
				<text class="menu-text">常见问题</text>
				<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
			</view>

			<view class="menu-item" @click="showComingSoon">
				<text class="menu-text">隐私协议</text>
				<image src="/static/icon/menu-arrow.svg" mode="widthFix"></image>
			</view>
		</view>

	</view>
</template>

<script>
import http from '@/utils/request.js'
import { BASE_URL } from '@/components/filters.js'

export default {
	data() {
		return {
			BASE_URL,
			userInfo: {},
			deviceList: []
		}
	},
	mounted() {
		this.getUserInfo();
		this.getDeviceList();
	},
	methods: {
		getDeviceList() {
			this.deviceList = [];
			http.get('/device/bind/list').then(res => {
				console.log('/device/bind/list===', res);
				if(res.code === 0 && res.data && res.data.length > 0){
					this.deviceList = res.data;
				}
			})
		},
		async getUserInfo() {
			await http.get('/user/info').then(res => {
				console.log('/user/info===', res);
				if(res.code === 0){
					this.userInfo = res.data;
					uni.setStorageSync('userInfo', res.data);
				}
			}).catch(err => {
				console.error('获取用户信息失败：', err.message)
			})
		},
		showComingSoon() {
			uni.showToast({
				title: '功能即将开放',
				icon: 'none'
			});
		},
		openMyDevices() {
			uni.navigateTo({
				url: '/pages/personal/my-devices'
			})
		},
		openExchange() {
			uni.navigateTo({
				url: '/pages/personal/exchange'
			})
		},
		openSetting() {
			uni.navigateTo({
				url: '/pages/personal/setting'
			})
		},
		openUserInfo() {
			uni.navigateTo({
				url: '/pages/personal/user-info'
			})
		}
	}
}
</script>

<style scoped lang="scss"> 
.personal-container {
	height: 100%;
	background: #FFFFFF;
	padding: 111.9rpx 39.2rpx 80rpx 39.2rpx;
}

.personal-header {
	padding-left: 18.7rpx;
	display: flex;
	align-items: center;
	justify-content: start;
	.header-image {
		border-color: #D9D9D9;
		border-style: solid;
		width: 166rpx;
		height: 166rpx;
		border-radius: 100%;
		margin-right: 14px;
	}
	.header-username {	
		font-size: 44.8rpx;
		font-weight: 600;
		color: #1E1E1E;
	}
	.header-edit {
		width: 44.8rpx;
		height: 44.8rpx;
	}
}

.my-device {
	margin-top: 139.9rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	.my-device-name {
		font-size: 29.9rpx;
		font-weight: 400;
		color: #1E1E1E;
	}
	.my-device-btn {
		display: flex;
		align-items: center;
		font-size: 26.1rpx;
		font-weight: 400;
		color: #757575;
		image{
			width: 29.9rpx;
			height: 29.9rpx;
		}
	}
}

.device-list-item{
	margin-top: 29.9rpx;
	height: 223.9rpx;
	display: flex;
	align-items: center;
	justify-content: start;
	padding-left: 44.8rpx;
	border: 1px solid #D9D9D9;
	border-radius: 29.9rpx;
	.device-list-item-img{
		width: 134.3rpx;
		height: 134.3rpx;
	}
	.device-list-item-info{
		flex: 1;
		margin-left: 30rpx;
		.device-list-item-info-name{
			font-size: 29.9rpx;
			font-weight: 400;
			color: #303030;
		}
		.device-list-item-info-deviceId{
			margin-top: 10rpx;
			font-size: 26.1rpx;
			font-weight: 400;
			color: #757575;
		}
	}
}

.menu-section {
	background: #F5F5F5;
	margin-top: 29.9rpx;
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
		image{
			width: 44.8rpx;
			height: 44.8rpx;
		}
	}
}
</style> 