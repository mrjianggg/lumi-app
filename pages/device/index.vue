<template>
	<view class="device-container" :style="{backgroundColor: currentDeviceIndex === deviceList.length ? '#F5F5F5' : '#FFF'}">
		<!-- 设备轮播容器 -->
		<swiper class="device-swiper" :style="{ height: swiperHeight }" :current="currentDeviceIndex"
			@change="onSwiperChange" :duration="300" :indicator-dots="false" :autoplay="false" :circular="false">
			<!-- 现有设备页面 -->
			<swiper-item v-for="(device, index) in deviceList" :key="index" class="swiper-item">
				<scroll-view class="device-content" scroll-y="true" :show-scrollbar="false">
					<view class="device-box">
						<view class="device-top">
							<!-- 顶部切换按钮区域 -->
							<view class="top-nav-container" v-if="deviceList.length > 0">
								<view class="top-nav-button top-nav-left" @click="prevDevice"
									v-if="currentDeviceIndex > 0">
									<image class="top-nav-icon" src="/static/icon/device-left.svg"></image>
								</view>
								<view class="top-nav-button top-nav-right" @click="nextDevice"
									v-if="currentDeviceIndex < deviceList.length">
									<image class="top-nav-icon" src="/static/icon/device-right.svg"></image>
								</view>
							</view>


							<view class="device-avatar">
								<image src="/static/img/deviceImg.png" style="width: 100%;" mode="widthFix"></image>
							</view>
						</view>


						<view class="device-card">
							<view class="device-status">
								<image class="device-status-wifi" src="/static/icon/Wifi.svg"></image>
								<image class="device-status-battery" src="/static/icon/gg_battery.svg"></image>
								<view class="device-status-onine">
									<view class="device-status-onine-dian"></view>在线
								</view>
							</view>

							<view class="device-name">{{device.name}}</view>
							<view class="device-desc">{{device.description}}</view>

							<!-- 角色精灵卡片 -->
							<view class="dream-card">
								<view class="card-header">
									<image mode="widthFix" class="role-img" src="/static/img/roleImg.png"></image>
									<view class="card-content">
										<view class="card-title">{{device.role.name}}</view>
										<view class="card-desc">{{device.role.description}}</view>
									</view>
								</view>

								<!-- 设置角色按钮 -->
								<view class="set-box">
									<view class="set-box-left" @click="setRole(device)">
										<image class="set-box-left-icon" src="/static/icon/mingcute_ai-fill.svg">
										</image> 设置角色
									</view>
									<view class="set-box-right" @click="setSetting(device)">
										<image class="set-box-right-icon" src="/static/icon/Settings.svg"></image>
									</view>
								</view>
							</view>
						</view>


						<!-- 行为引导按钮 -->
						<view class="guide-button" @click="setBehavior">
							行为引导 <image class="guide-button-icon" src="/static/icon/xwyd.svg"></image>
						</view>

						<!-- 内容推荐 -->
						<view class="content-section">
							<view class="section-title">内容推荐</view>

							<view v-for="(content, contentIndex) in device.contentList" :key="contentIndex + 'content'">
								<view
									:class="['content-item', playContentIndex === contentIndex ? 'content-item-play' : '']"
									@click="playContent(contentIndex)">
									<view>
										{{content.title}}
									</view>
									<view>
										<image class="content-item-bt" src="/static/icon/item-pause.svg"
											v-if="playContentIndex === contentIndex"></image>
										<image class="content-item-bt" src="/static/icon/item-play.svg" v-else></image>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 添加设备页面 -->
			<swiper-item class="swiper-item add-device-item">
				<view class="add-device-content">
					<!-- 添加设备页面的导航按钮 -->
					<view class="add-device-nav" v-if="deviceList.length > 0">
						<view class="top-nav-button top-nav-left" @click="prevDevice">
							<image class="top-nav-icon" src="/static/icon/device-left.svg"></image>
						</view>
					</view>

					<view class="add-device-card" @click="addNewDevice">
						<image class="add-device-img" src="/static/img/Add_square.png"  mode="widthFix"></image>
						<view class="add-device-text">添加设备</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				playContentIndex: -1,
				currentDeviceIndex: 0,
				swiperHeight: 'auto',
				deviceList: [{
						id: 1,
						name: 'Namyvera',
						emoji: '🐑',
						description: '是一个未来科技感的创造力伙伴',
						online: true,
						charging: true,
						role: {
							name: '梦想精灵',
							icon: '🐑',
							description: '梦想精灵是具有不充满的想象力和创造性的精灵，爱做梦'
						},
						contentList: [{
								title: '梦想精灵故事',
								featured: true
							},
							{
								title: '少儿英语',
								featured: false
							},
							{
								title: '其内容',
								featured: false
							}
						]
					},
					{
						id: 2,
						name: 'BubblePal',
						emoji: '🤖',
						description: '智能陪伴机器人，您的贴心伙伴',
						online: true,
						charging: false,
						role: {
							name: '智能助手',
							icon: '🤖',
							description: '智能助手可以帮助您处理日常事务，提供贴心服务'
						},
						contentList: [{
								title: '智能问答',
								featured: true
							},
							{
								title: '天气预报',
								featured: false
							},
							{
								title: '音乐播放',
								featured: false
							}
						]
					},
					{
						id: 3,
						name: 'StarBot',
						emoji: '⭐',
						description: '探索宇宙奥秘的星际伙伴',
						online: false,
						charging: true,
						role: {
							name: '星际向导',
							icon: '🚀',
							description: '星际向导带您探索宇宙的奥秘，学习天文知识'
						},
						contentList: [{
								title: '天文知识',
								featured: true
							},
							{
								title: '星座故事',
								featured: false
							},
							{
								title: '太空探索',
								featured: false
							}
						]
					}
				]
			}
		},
		computed: {
			currentDevice() {
				return this.deviceList[this.currentDeviceIndex] || {};
			}
		},
		onLoad() {
			this.calculateSwiperHeight();
		},
		onReady() {
			this.calculateSwiperHeight();
		},
		mounted() {
			// 组件挂载时也计算高度（用于作为组件使用的情况）
			this.$nextTick(() => {
				this.calculateSwiperHeight();
			});
		},
		methods: {
			// 计算swiper容器高度
			calculateSwiperHeight() {
				const systemInfo = uni.getSystemInfoSync();
				const windowHeight = systemInfo.windowHeight;
				const statusBarHeight = systemInfo.statusBarHeight || 0;

				// 更保守的TabBar和安全区域计算
				// const tabBarHeight = 100; // 进一步增加TabBar估算高度
				const tabBarHeight = 50; // 进一步增加TabBar估算高度
				const safeAreaBottom = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0;

				// 更大的安全间距
				const extraPadding = 0;

				// 计算可用高度，预留更多空间
				const availableHeight = windowHeight - tabBarHeight - safeAreaBottom - extraPadding;

				this.swiperHeight = `${Math.max(availableHeight, 300)}px`; // 调整最小高度

				console.log('高度信息:', {
					windowHeight,
					statusBarHeight,
					tabBarHeight,
					safeAreaBottom,
					extraPadding,
					availableHeight
				});
			},

			// 上一个设备（不循环）
			prevDevice() {
				if (this.currentDeviceIndex > 0) {
					this.currentDeviceIndex--;
				}
			},

			// 下一个设备（包括添加设备页面）
			nextDevice() {
				if (this.currentDeviceIndex < this.deviceList.length) {
					this.currentDeviceIndex++;
				}
			},

			playContent(contentIndex) {
				if (this.playContentIndex === contentIndex) {
					this.playContentIndex = -1;
				} else {
					this.playContentIndex = contentIndex;
				}
			},

			// 切换到指定设备
			switchToDevice(index) {
				this.currentDeviceIndex = index;
			},

			// swiper变化事件
			onSwiperChange(e) {
				this.currentDeviceIndex = e.detail.current;
			},
			// 设置角色
			setRole(device) {
				uni.navigateTo({
					url: '/pages/device/role'
				})
			},

			// 设置设备
			setSetting(device) {
				uni.navigateTo({
					url: '/pages/device/setting'
				})
			},

			// 行为引导
			setBehavior() {
				uni.navigateTo({
					url: '/pages/device/behavior'
				})
			},

			// 添加新设备
			addNewDevice() {
				// 直接跳转到设备配置页面
				uni.navigateTo({
					url: '/pages/provisioning/index'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.device-container {
		min-height: 100vh;
	}

	/* 设备轮播 */
	.device-swiper {
		/* 高度由JavaScript动态设置 */
	}

	.swiper-item {
		height: 100%;
	}

	.device-content {
		height: 100%;
		padding: 0 33.6rpx;
		box-sizing: border-box;

		.device-box {
			padding-bottom: 200rpx;

			/* 为自定义tabBar预留空间 */
			.device-top {

				/* 顶部切换按钮 */
				.top-nav-container {
					position: relative;
					width: 100%;
					z-index: 100;

					.top-nav-button {
						position: absolute;
						top: 120rpx;
						transition: all 0.3s ease;

						.top-nav-icon {
							width: 89.6rpx;
							height: 89.6rpx;
						}

						.top-nav-icon:active {
							transform: scale(0.95);
						}
					}

					.top-nav-left {
						left: 0;
					}

					.top-nav-right {
						right: 0;
					}
				}

				.device-avatar {
					width: 320.9rpx;
					height: 320.9rpx;
					margin: 0 auto;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}




	.device-card {
		margin-top: -110rpx;
		background-image: url('/static/img/deviceBg.png');
		background-size: 100% 100%;
		background-repeat: no-repeat;
		padding: 130rpx 44.8rpx 44.8rpx 44.8rpx;
	}

	.device-status {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;

		.device-status-wifi {
			width: 29.9rpx;
			height: 29.9rpx;
			margin-right: 20rpx;
		}

		.device-status-battery {
			width: 44.8rpx;
			height: 44.8rpx;
			margin-right: 20rpx;
		}

		.device-status-onine {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 29.9rpx;
			color: #303030;
			border-radius: 30rpx;
			padding: 8rpx 20rpx;
			background: #EBE7FF;

			.device-status-onine-dian {
				width: 16.8rpx;
				height: 16.8rpx;
				border-radius: 100%;
				background: #14AE5C;
				margin-right: 10rpx;
			}
		}
	}


	.device-emoji {
		font-size: 80rpx;
		line-height: 1;
	}

	.device-name {
		font-size: 44.8rpx;
		font-weight: 600;
		color: #1E1E1E;
		margin-top: 10rpx;
		width: 100%;
		text-align: center;
	}

	.device-desc {
		font-size: 29.9rpx;
		font-weight: 400;
		color: #1E1E1E;
		margin-top: 5rpx;
		width: 100%;
		text-align: center;
	}



	/* 角色精灵卡片 */
	.dream-card {
		margin-top: 30rpx;
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.card-header {
		display: flex;
		align-items: center;

		.role-img {
			width: 125rpx;
		}

		.card-content {
			flex: 1;

			.card-title {
				font-size: 29.9rpx;
				font-weight: 400;
				color: #303030;
			}

			.card-desc {
				margin-top: 15rpx;
				font-size: 26.1rpx;
				font-weight: 400;
				color: #757575;
				line-height: 140%;
			}
		}
	}

	.set-box {
		margin-top: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;

		.set-box-left {
			flex: 1;
			height: 85.8rpx;
			background: #FDD3D0;
			border-radius: 40rpx;
			margin-right: 10rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 29.9rpx;
			font-weight: 400;
			color: #1E1E1E;

			.set-box-left-icon {
				width: 29.9rpx;
				height: 29.9rpx;
				margin-right: 5rpx;
			}
		}

		.set-box-right {
			width: 85.8rpx;
			height: 85.8rpx;
			background: #EBE7FF;
			border-radius: 100%;
			display: flex;
			align-items: center;
			justify-content: center;

			.set-box-right-icon {
				width: 29.9rpx;
				height: 29.9rpx;
			}
		}
	}

	.icon-emoji {
		font-size: 32rpx;
	}




	/* 行为引导按钮 */
	.guide-button {
		margin-top: 40rpx;
		width: 100%;
		height: 85.8rpx;
		background: #CFE9FF;
		border-radius: 40rpx;
		color: #303030;
		font-size: 29.9rpx;
		font-weight: 400;
		display: flex;
		align-items: center;
		justify-content: center;

		.guide-button-icon {
			width: 9.3rpx;
			height: 18.7rpx;
			margin-left: 10rpx;
		}
	}

	/* 内容推荐 */
	.content-section {
		margin-top: 40rpx;
		height: 522.4rpx;
		border: 1px solid #D9D9D9;
		border-radius: 59.7rpx;
		padding: 0 40rpx;

		.section-title {
			margin-top: 30rpx;
			font-size: 29.9rpx;
			font-weight: 400;
			color: #303030;
		}

		.content-item-play {
			background: #FFE8A3;
			border: 1px solid #FFE8A3 !important;
		}

		.content-item {
			font-size: 29.9rpx;
			font-weight: 400;
			color: #303030;
			height: 104.5rpx;
			border-radius: 59.7rpx;
			border: 1px solid #D9D9D9;
			padding: 0 50rpx;
			margin-top: 30rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.content-item-bt {
				width: 44.8rpx;
				height: 44.8rpx;
			}
		}
	}

	/* 添加设备页面样式 */
	.add-device-item {
		.add-device-content {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0 50rpx;
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
	}
</style>