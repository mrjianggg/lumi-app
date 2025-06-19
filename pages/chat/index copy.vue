<template>
	<view class="chat-container">
		<!-- 顶部设备选择 -->
		<view class="header">
			<view class="device-selector" @click="showDeviceSelector = true">
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
		<z-paging ref="paging" refresher-only @onRefresh="onRefresh" class="chat-list" >
			<!-- 页面内容 -->
			<view v-for="session in groupedChatList" :key="session.sessionId" class="session-group">
				<!-- 会话时间分隔 -->
				<view class="session-divider">
					<text class="session-time">{{ session.startTime }}</text>
				</view>
				
				<!-- 聊天消息列表 -->
				<view v-for="(message, messageIndex) in session.messages" :key="messageIndex" class="message-item">
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
				{ id: 1, name: 'Lumi' },
				{ id: 2, name: '小智助手' },
				{ id: 3, name: '智能音箱' }
			],
			currentDeviceId: null,
			showDeviceSelector: false,
			
			// 聊天数据
			chatList: [],
			groupedChatList: [],
			
			// 分页参数
			page: 1,
			pageSize: 10,
			total: 0,
			
			// 状态
			loading: false,
			refresherTriggered: false,
			noMore: false,
			// currentDevice: {}
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
		// this.loadChatData();
		this.getDeviceList();
	},
	
	onShow() {
		// 页面显示时，如果没有数据则加载
		// if (this.chatList.length === 0) {
		// 	this.loadChatData()
		// }
	},
	
	methods: {
		getDeviceList() {
			this.deviceList = [];
			http.get('/device/bind/list').then(res => {
				console.log('/device/bind/list===',res);
				if(res.code === 0 && res.data && res.data.length > 0){
					this.deviceList = res.data;
					this.currentDeviceId = this.deviceList[0].id;
					this.loadChatData()
				} else {
					console.log('没有绑定的设备');
					uni.showToast({
						title: '没有绑定的设备',
						icon: 'none'
					})
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
			this.loadChatData()
		},
		
		// 重置数据
		resetData() {
			this.chatList = []
			this.groupedChatList = []
			this.page = 1
			this.total = 0
			this.noMore = false
		},
		
		// 下拉刷新 - 加载最新数据
		async onRefresh() {
			console.log('onRefresh开始刷新');
			this.page ++;
			// 检查是否有当前设备
			if (!this.currentDevice || !this.currentDevice.id) {
				console.log('没有选择设备，无法刷新聊天数据');
				this.$refs.paging.complete();
				return
			}
			
			try {
				// 重置到第一页，获取最新数据
				const response = await http.get(`/chat-history/device/${this.currentDevice.id}?page=${this.page}&limit=${this.pageSize}`)
				console.log('刷新数据response===', response);
				
				if (response.code === 0) {
					const newData = response.data.list || []
					
					// 将新数据添加到现有数据前面
					const existingIds = new Set(this.chatList.map(item => `${item.sessionId}_${item.createDate}`))
					const filteredNewData = newData.filter(item => !existingIds.has(`${item.sessionId}_${item.createDate}`))
					
					if (filteredNewData.length > 0) {
						this.chatList = [...filteredNewData, ...this.chatList]
						console.log('刷新后的chatList===', this.chatList);
						this.groupChatBySession()
						
						uni.showToast({
							title: `新增${filteredNewData.length}条消息`,
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: '暂无新消息',
							icon: 'none'
						})
					}
				}
			} catch (error) {
				console.error('刷新数据失败:', error)
				uni.showToast({
					title: '刷新失败',
					icon: 'error'
				})
			} finally {
				this.$refs.paging.complete();
			}
		},
		
		
		// 加载聊天数据
		async loadChatData() {
			console.log('loadChatData开始加载数据');
			if (this.loading) return
			
			// 检查是否有当前设备
			if (!this.currentDevice || !this.currentDevice.id) {
				console.log('没有选择设备，无法加载聊天数据');
				return
			}
			
			this.loading = true
			
			try {
				// 调用真实API接口
				const response = await http.get(`/chat-history/device/${this.currentDevice.id}?page=${this.page}&limit=${this.pageSize}`)
				console.log('加载聊天数据response===', response);
				
				if (response.code === 0) {
					const newData = response.data.list || []
					this.total = response.data.total || 0
					
					if (this.page === 1) {
						this.chatList = newData
					} else {
						this.chatList = [...this.chatList, ...newData]
					}
					
					this.groupChatBySession()
					
					// 检查是否还有更多数据
					if (this.chatList.length >= this.total) {
						this.noMore = true
					}
				}
			} catch (error) {
				console.error('加载聊天数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'error'
				})
			} finally {
				this.loading = false
			}
		},
		

		
		// 按会话分组聊天记录
		groupChatBySession() {
			const sessionMap = new Map()
			
			// 按时间倒序排列
			const sortedList = [...this.chatList].sort((a, b) => 
				new Date(b.createDate) - new Date(a.createDate)
			)
			
			sortedList.forEach(message => {
				if (!sessionMap.has(message.sessionId)) {
					sessionMap.set(message.sessionId, {
						sessionId: message.sessionId,
						messages: [],
						startTime: message.createDate
					})
				}
				
				const session = sessionMap.get(message.sessionId)
				session.messages.push(message)
				
				// 更新会话开始时间（最早的消息时间）
				if (new Date(message.createDate) < new Date(session.startTime)) {
					session.startTime = message.createDate
				}
			})
			
			// 转换为数组并按会话开始时间排序
			this.groupedChatList = Array.from(sessionMap.values())
				.sort((a, b) =>  new Date(a.startTime) - new Date(b.startTime))
			
			// 每个会话内的消息按时间正序排列
			this.groupedChatList.forEach(session => {
				session.messages.sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
			})
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
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FFFFFF;
	.header {
		position: relative;
		z-index: 100;
		padding: 52rpx 52rpx 10rpx 52rpx;
		.device-selector {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 44.8rpx;
			width: 296.6rpx;
			height: 85.8rpx;
			border: 1px solid #D9D9D9;
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
			z-index: 1000;
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
		z-index: 99;
	}
	.chat-list {
		flex: 1;
		padding: 52rpx 52rpx 152rpx 52rpx;
		margin-top: 100rpx;

		.session-group {
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
						background: linear-gradient(135deg, #b19cd9 0%, #c5a9dd 100%);
					}
					.user-avatar {
						background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
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
						&::before {
							content: '';
							position: absolute;
							left: -10rpx;
							top: 20rpx;
							width: 0;
							height: 0;
							border: 10rpx solid transparent;
							border-right-color: white;
						}
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