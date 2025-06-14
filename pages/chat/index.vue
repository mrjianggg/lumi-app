<template>
	<view class="chat-container">
		<!-- 顶部设备选择 -->
		<view class="header">
			<view class="device-selector" @click="showDeviceSelector = true">
				<text class="device-name">{{ currentDevice.name }}</text>
				<image src="/static/icon/select-icon.svg" class="dropdown-icon"></image>
			</view>
			
			<!-- 设备选择下拉框 -->
			<view v-if="showDeviceSelector" class="device-dropdown">
				<view 
					v-for="(device, index) in deviceList" 
					:key="device.id" 
					class="device-option"
					:class="{ active: index === currentDeviceIndex }"
					@click="selectDevice(index)"
				>
					<text class="device-option-text">{{ device.name }}</text>
					<text v-if="index === currentDeviceIndex" class="check-icon">✓</text>
				</view>
			</view>
		</view>

		<!-- 遮罩层 - 点击关闭下拉框 -->
		<view v-if="showDeviceSelector" class="mask" @click="showDeviceSelector = false"></view>
		
		<!-- 聊天记录列表 -->
		<scroll-view 
			class="chat-list" 
			scroll-y="true" 
			:refresher-enabled="true"
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh"
			:lower-threshold="50"
		>
			<view v-for="session in groupedChatList" :key="session.sessionId" class="session-group">
				<!-- 会话时间分隔 -->
				<view class="session-divider">
					<text class="session-time">{{ formatSessionTime(session.startTime) }}</text>
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
			
			<!-- 加载更多提示 -->
			<view v-if="loading" class="loading-tip">
				<text>加载中...</text>
			</view>
			
			<view v-if="noMore" class="no-more-tip">
				<text>没有更多数据了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 设备列表
			deviceList: [
				{ id: 1, name: 'Lumi' },
				{ id: 2, name: '小智助手' },
				{ id: 3, name: '智能音箱' }
			],
			currentDeviceIndex: 0,
			showDeviceSelector: false,
			
			// 聊天数据
			chatList: [],
			groupedChatList: [],
			
			// 分页参数
			page: 1,
			pageSize: 20,
			total: 0,
			
			// 状态
			loading: false,
			refresherTriggered: false,
			noMore: false
		}
	},
	
	computed: {
		currentDevice() {
			return this.deviceList[this.currentDeviceIndex] || this.deviceList[0]
		}
	},
	
	mounted() {
		// 页面加载时初始化数据
		this.loadChatData()
	},
	
	onShow() {
		// 页面显示时，如果没有数据则加载
		if (this.chatList.length === 0) {
			this.loadChatData()
		}
	},
	
	methods: {
		// 设备选择
		selectDevice(index) {
			if(this.currentDeviceIndex === index) {
				this.showDeviceSelector = false
				return
			}
			this.currentDeviceIndex = index
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
			console.log('onRefresh1111');
			this.refresherTriggered = true
			
			try {
				// 模拟获取最新数据
				this.page ++;
				const response = await this.mockApiRequest(this.page) // 获取第一页最新数据
				console.log('response===',response);
				if (response.code === 0) {
					const newData = response.data.list || []
					
					// 将新数据添加到现有数据前面
					const existingIds = new Set(this.chatList.map(item => `${item.sessionId}_${item.createDate}`))
					const filteredNewData = newData.filter(item => !existingIds.has(`${item.sessionId}_${item.createDate}`))
					
					if (filteredNewData.length > 0) {
						this.chatList = [...filteredNewData, ...this.chatList]
						console.log('this.chatList===',this.chatList);
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
				this.refresherTriggered = false
			}
		},
		
		
		// 加载聊天数据
		async loadChatData() {
			console.log('loadChatData1111');
			if (this.loading) return
			
			this.loading = true
			
			try {
				// 模拟API请求
				const response = await this.mockApiRequest()
				
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
		
		// 模拟API请求
		mockApiRequest(page = this.page) {
			console.log('this.page',this.page);
			return new Promise((resolve) => {
				setTimeout(() => {
					// 模拟不同页面的数据
					let mockList = []
					
					if (page === 1) {
						mockList = [
							{
								sessionId: "session_124",
								content: "8嘿，看来你想记录我们的对话呢。不过我这里没法帮你生成报告或者记忆码。你可以用手机或者电脑上的录音功能录下来，或者自己手动记下来。这样就可以随时回顾我们的聊天内容了。下次见面，我们再继续我们的快乐时光吧！记得开心每一天哦！",
								chatType: 2,
								createDate: "2025-01-12 11:30:00"
							},
							{
								sessionId: "session_124",
								content: "7我有一个问题",
								chatType: 1,
								createDate: "2025-01-12 11:29:00"
							}
						]
					} else if (page === 2) {
						mockList = [
							{
								sessionId: "session_123",
								content: "6嘿，看来你想记录我们的对话呢。不过我这里没法帮你生成报告或者记忆码。你可以用手机或者电脑上的录音功能录下来，或者自己手动记下来。这样就可以随时回顾我们的聊天内容了。下次见面，我们再继续我们的快乐时光吧！记得开心每一天哦！",
								chatType: 2,
								createDate: "2025-01-11 15:20:00"
							},
							{
								sessionId: "session_123",
								content: "5我有一个问题",
								chatType: 1,
								createDate: "2025-01-11 15:19:00"
							},
							{
								sessionId: "session_122",
								content: "4嘿，看来你想记录我们的对话呢。不过我这里没法帮你生成报告或者记忆码。你可以用手机或者电脑上的录音功能录下来，或者自己手动记下来。这样就可以随时回顾我们的聊天内容了。下次见面，我们再继续我们的快乐时光吧！记得开心每一天哦！",
								chatType: 2,
								createDate: "2025-01-10 15:20:00"
							},
							{
								sessionId: "session_122",
								content: "3我有一个问题",
								chatType: 1,
								createDate: "2025-01-10 15:19:00"
							}
						]
					}
					
					const mockData = {
						code: 0,
						msg: "success",
						data: {
							list: mockList,
							total: 4 // 总共4条数据
						}
					}
					resolve(mockData)
				}, 500) // 减少延迟时间
			})
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
		
		// 格式化会话时间
		formatSessionTime(dateStr) {
			let timeStr = dateStr.split(' ')[1]
			let dateStr2 = dateStr.split(' ')[0]
			let dateStr3 = dateStr2.split('-')
			let dateStr4 =  dateStr3[0] + '年' + dateStr3[1] + '月' + dateStr3[2] + '日' + ' ' + timeStr

			const date = new Date(dateStr)
			const now = new Date()
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
			
			const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24))
			
			if (diffDays === 0) {
				return '今天'
			} else if (diffDays === 1) {
				return '昨天'
			} else if (diffDays < 7) {
				return `${diffDays}天前`
			} else {
				return dateStr4
			}
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
						margin-right: 114rpx;
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