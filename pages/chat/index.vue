<template>
	<view class="chat-container" :style="{paddingTop: statusBarHeight - 18 + 'rpx', backgroundColor: deviceList.length === 0 ? '#F5F5F5' : '#FFF'}">
		<view class="add-device-content" v-if="deviceList.length === 0">
			<view class="add-device-card" @click="goToDevice">
				<image class="add-device-img" src="/static/img/Add_square.png"  mode="widthFix"></image>
				<view class="add-device-text">添加设备</view>
			</view>
		</view>
		<!-- 顶部设备选择 -->
		<view class="header" v-if="deviceList.length > 0">
			<view class="device-selector" :style="{border: showDeviceSelector ? '1px solid #fff' : '1px solid #D9D9D9'}" @click="showDeviceSelector = true">
				<view class="device-name">{{ currentDevice.alias || currentDevice.macAddress }}</view>
				<image src="/static/icon/select-icon.svg" class="dropdown-icon"></image>
			</view>
			
			<!-- 设备选择下拉框 -->
			<view v-if="showDeviceSelector" class="device-dropdown">
				<view 
					v-for="(device, index) in deviceList" 
					:key="device.id + index" 
					class="device-option"
					:class="{ active: device.id === currentDeviceId }"
					@click="selectDevice(device)"
				>
					<text class="device-option-text">{{ device.alias || device.macAddress }}</text>
					<text v-if="device.id === currentDeviceId" class="check-icon">✓</text>
				</view>
			</view>
		</view>

		<!-- 遮罩层 - 点击关闭下拉框 -->
		<view v-if="showDeviceSelector" class="mask" @click="showDeviceSelector = false"></view>
		
		<!-- 聊天记录列表 -->
		<z-paging ref="paging" refresher-only @onRefresh="onRefresh" class="chat-list" :style="{marginTop: 80 + statusBarHeight + 'rpx'}" v-if="deviceList.length > 0">
			<!-- 页面内容 -->
			<view v-for="(message, index) in chatList" :key="index" class="message-group">
				<!-- 会话时间分隔 - 当当前消息与下一条消息的createDate不同时显示 -->
				<view v-if="shouldShowSessionTime(index)" class="session-divider">
					<text class="session-time">{{ message.createDate }}</text>
				</view>
				
				<!-- 聊天消息 -->
				<view class="message-item">
					<!-- 设备消息（左侧） -->
					<view v-if="message.chatType === 2" class="message-wrapper left">
						<view class="avatar device-avatar"></view>
						<view class="message-content device-message">
							<text class="message-text">{{ message.content }}</text>
						</view>
					</view>
					
					<!-- 用户消息（右侧） -->
					<view v-else class="message-wrapper right">
						<view class="message-content user-message">
							<text class="message-text">{{ message.content }}</text>
						</view>
					</view>
				</view>
			</view>
		</z-paging>
	</view>
</template>

<script>
import http from '@/utils/request.js'
export default {
	data() {
		return {
			// 设备列表
			deviceList: [
				{id: '0', alias: '', macAddress: ''}
			],
			currentDeviceId: null,
			showDeviceSelector: false,
			
			// 聊天数据
			chatList: [
				{
					createDate: '',
					content: '',
					chatType: 1
				},
				{
					createDate: '',
					content: '',
					chatType: 2
				},
				{
					createDate: '',
					content: '',
					chatType: 1
				},
				{
					createDate: '',
					content: '',
					chatType: 2
				},
				{
					createDate: '',
					content: '',
					chatType: 1
				},
				{
					createDate: '',
					content: '',
					chatType: 2
				}
			],
			
			// 分页参数
			page: 0,
			pageSize: 10,
			total: 0,
			
			// 状态
			loading: false,
			refresherTriggered: false,
			noMore: false,
			statusBarHeight: 0
		}
	},
	
	computed: {
		currentDevice() {
			return this.deviceList.find(device => device.id === this.currentDeviceId) || this.deviceList[0]
		}
	},
	watch: {
		// currentDeviceId: {
		// 	handler(newVal) {
		// 		this.currentDevice = this.deviceList.find(device => device.id === newVal) || this.deviceList[0]
		// 	},
		// 	immediate: true
		// }
	},
	mounted() {
		// 页面加载时初始化数据
		this.getDeviceList();
		this.statusBarHeight = uni.getStorageSync('statusBarHeight')
	},
	
	onShow() {
	},
	
	methods: {
		goToDevice() {
			uni.navigateTo({
				url: '/pages/provisioning/index'
			})
		},
		getDeviceList() {
			http.get('/device/bind/list').then(res => {
				console.log('/device/bind/list===',res);
				if(res.code === 0 && res.data && res.data.length > 0){
					this.deviceList = res.data;
					this.currentDeviceId = this.deviceList[0].id;
					this.onRefresh() // 加载聊天数据
				}else{
					this.deviceList = []
				}
			}).catch(error => {
				console.error('获取设备列表失败:', error)
				uni.showToast({
					title: '获取设备列表失败',
					icon: 'error'
				})
			})
		},
		// 设备选择
		selectDevice(device) {
			if(this.currentDeviceId === device.id) {
				this.showDeviceSelector = false
				return
			}
			this.currentDeviceId = device.id
			this.showDeviceSelector = false
			this.resetData()
			this.onRefresh() // 加载聊天数据
		},
		
		// 重置数据
		resetData() {
			this.chatList = []
			this.page = 0
			this.total = 0
			this.noMore = false
		},
		
		// 下拉刷新 - 加载最新数据
		async onRefresh() {
			this.page ++;
			// 检查是否有当前设备
			if (!this.currentDevice || !this.currentDevice.id) {
				this.$refs.paging.complete();
				return
			}
			
			try {
				// 重置到第一页，获取最新数据
				const response = await http.get(`/chat-history/device/${this.currentDevice.id}?page=${this.page}&limit=${this.pageSize}`)
				console.log('刷新数据response===', response);
				
				if (response.code === 0) {
					if (response.data && response.data.list && response.data.list.length > 0) {
						if(this.page === 1){
							this.chatList = response.data.list.reverse()
						}else{
							this.chatList = [...response.data.list.reverse(), ...this.chatList]
						}
						
						console.log('this.chatList===', this.chatList);
						if(this.page > 1){
							uni.showToast({
								title: `新增${response.data.list.length}条消息`,
								icon: 'success'
							})
						}

					} else {
						this.page --;
						uni.showToast({
							title: '暂无新消息',
							icon: 'none'
						})
					}
				}else{
					this.page --;
					uni.showToast({
						title: response.msg,
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('刷新数据失败:', error)
				this.page --;
				uni.showToast({
					title: '刷新失败',
					icon: 'error'
				})
			} finally {
				this.$refs.paging.complete();
			}
		},
		// 判断是否需要显示会话时间分隔
		shouldShowSessionTime(index) {
			// 第一条消息总是显示时间
			if (index === 0) return true
			
			const currentMessage = this.chatList[index]
			const nextMessage = this.chatList[index + 1]
			
			// 如果没有下一条消息，或者当前消息与下一条消息的createDate不同，则显示时间
			return !nextMessage || currentMessage.createDate !== nextMessage.createDate
		},
		
		// 格式化会话时间
		formatSessionTime(dateStr) {
			const date = new Date(dateStr)
			const now = new Date()
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
			
			// 判断是否是今天
			if (messageDate.getTime() === today.getTime()) {
				return this.formatTime(dateStr)
			}
			
			// 判断是否是昨天
			const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
			if (messageDate.getTime() === yesterday.getTime()) {
				return `昨天 ${this.formatTime(dateStr)}`
			}
			
			// 其他日期显示月日
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			return `${month}-${day} ${this.formatTime(dateStr)}`
		},
		
		// 格式化消息时间
		formatTime(dateStr) {
			const date = new Date(dateStr)
			const hours = date.getHours().toString().padStart(2, '0')
			const minutes = date.getMinutes().toString().padStart(2, '0')
			return `${hours}:${minutes}`
		}
	}
}
</script>

<style scoped lang="scss">
.add-device-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0rpx 50rpx 96rpx 50rpx;
	position: relative;

	.add-device-nav {
		position: absolute;
		top: 120rpx;
		left: 33.6rpx;
		z-index: 100;

		.top-nav-button {
			position: relative;
			transition: all 0.3s ease;

			.top-nav-icon {
				width: 89.6rpx;
				height: 89.6rpx;
			}

			.top-nav-icon:active {
				transform: scale(0.95);
			}
		}
	}

	.add-device-card {
		background: #fff;
		border-radius: 59.7rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid #D9D9D9;
		width: 100%;
		height: 60%;
		.add-device-img {
			width: 429.1rpx;
		}

		.add-device-text {
			margin-top: 29.9rpx;
			font-size: 44.8rpx;
			font-weight: 600;
			color: #1E1E1E;
			text-align: center;
		}
	}
}
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FFFFFF;
	.no-device {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		z-index: 3;
		.no-device-content {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #ae66bb;
			padding: 20rpx 40rpx;
			border-radius: 50rpx;
			.no-device-icon {	
				margin-right: 10rpx;
				width: 50rpx;
				height: 50rpx;
			}
		}
	}
	.header {
		position: relative;
		z-index: 902;
		padding: 52rpx 52rpx 10rpx 52rpx;
		.device-selector {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 44.8rpx;
			width: 296.6rpx;
			height: 85.8rpx;
			border-radius: 50rpx;
			.device-name {
				color: #1E1E1E;
				font-size: 29.9rpx;
				font-weight: 500;
				margin-right: 10rpx;
				// 超出显示省略号
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				width: 250rpx;
			}
			
			.dropdown-icon {
				width: 29.9rpx;
				transition: transform 0.3s ease;
			}
		}
		.device-dropdown {
			position: absolute;
			width: 600rpx;
			top: 100%;
			left: 52rpx;
			background-color: white;
			border-radius: 20rpx;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
			overflow: hidden;
			z-index: 903;
			.device-option {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30rpx 40rpx;
				border-bottom: 1rpx solid #f0f0f0;
				
				&:last-child {
					border-bottom: none;
				}
				
				&.active {
					background-color: #f8f6ff;
				}
			
				.device-option-text {
					font-size: 30rpx;
					color: #333;
				}
				.check-icon {
					color: #b19cd9;
					font-size: 32rpx;
					font-weight: bold;
				}
			}

		}
	}
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 901;
		background-color: rgba(0, 0, 0, 0.2);
	}
	.chat-list {
		flex: 1;
		padding: 52rpx 52rpx 152rpx 52rpx;
		

		.message-group {
			margin-bottom: 40rpx;
			.session-divider {
				display: flex;
				justify-content: center;
				.session-time {
					color: #B3B3B3;
					font-size: 26.1rpx;
					padding: 29.9rpx 0;
				}
			}
			.message-item {
				margin-bottom: 30rpx;
				flex: 1;
				.message-wrapper {
					display: flex;
					align-items: flex-start;
					
					&.left {
						justify-content: flex-start;
					}
					
					&.right {
						justify-content: flex-end;
					}
					.avatar {
						width: 67.2rpx;
						height: 67.2rpx;
						border-radius: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 13.1rpx;		
					}
					
					.device-avatar {
						background: #D5CFFF;
					}
			
					.message-content {
						max-width: 500rpx;
						padding: 29.9rpx;
						border-radius: 29.9rpx;
						position: relative;
						.message-text {
							display: block;
							font-size: 30rpx;
							line-height: 1.5;
							word-wrap: break-word;
						}
						.message-time {
							font-size: 29.9rpx;
							color: #1E1E1E;
							display: block;
							text-align: right;
						}
						
					}
					.device-message {
						background-color:#F5F5F5;
					}
					.user-message {
						background: #D5CFFF;
						margin-right: 0rpx;
					}
				}
			}
		}
	}
}














.loading-tip, .no-more-tip {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
	
	text {
		color: #999;
		font-size: 26rpx;
	}
}
</style> 