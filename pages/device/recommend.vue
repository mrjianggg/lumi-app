<template>
	<view class="role-page">
		<head-return :toPage="0" :title="fName"></head-return>
		<view class="page-content">
            <view v-for="(content, contentIndex) in contentList" :key="contentIndex + 'content'">
                <view
                    :class="['content-item', playContentIndex === contentIndex ? 'content-item-play' : '']"
                    :style="playContentIndex === contentIndex ? {backgroundColor: currentColorPair.background, borderColor: currentColorPair.background} : {}"
                    @click="playContent(contentIndex,content)">
                    <view class="content-item-left">
                        <!-- <audio-lines-icon v-if="playContentIndex === contentIndex" :color="currentColorPair.icon" /> -->
                        <view class="content-item-left-text">
                            {{content.title}}
                        </view>
                    </view>
                    <!-- 加载状态 -->
                    <image class="content-item-bt loading-icon" src="/static/icon/item-loading.svg" v-if="playContentIndex === contentIndex"></image>
                    <!-- 暂停状态 -->
                    <image class="content-item-bt" src="/static/icon/item-play.svg" v-else></image>

                </view>
            </view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
	</view>
</template>

<script>
    import AudioLinesIcon from '@/components/audio-lines-icon.vue'
    import http from '@/utils/request.js'
	export default {
		components: {
			AudioLinesIcon
		},
		data() {
			return {
                contentList: [
                ],
                playContentIndex: -1,
                currentColorPair: { background: '#FFE8A3', icon: '#FF9B21' },
				// 颜色配对数组
				colorPairs: [
					{ background: '#FFE8A3', icon: '#FF9B21' },
					{ background: '#CFF7D3', icon: '#21B200' },
					{ background: '#FDD3D0', icon: '#FF3F21' },
					{ background: '#CFE9FF', icon: '#209BFF' },
					{ background: '#EBE7FF', icon: '#6D5BE3' }
				],
                fId: '',
                fName: '',
				currentDevice: null,
				playingTaskId: null, // 当前播放任务ID
				statusCheckTimer: null // 状态检查定时器
			}
		},
		onLoad(options) {
			console.log('页面参数:', options);
			// 在uni-app中使用onLoad获取页面参数
			this.fId = options.id;
			this.fName = options.name ? decodeURIComponent(options.name) : '';
			
			// 获取当前设备信息
			this.currentDevice = uni.getStorageSync('currentDevice');
			console.log('当前设备信息:', this.currentDevice);
			
			if(this.fId){
				this.getRecommend();
			}
		},
		onUnload() {
		},
		computed: {

		},
        mounted() {
        },
		
		onUnload() {
			// 页面卸载时清除定时器
			this.clearStatusTimer();
		},
		methods: {
            getRecommend() {
                this.contentList = [];
                http.get(`/content/collection/${this.fId}?page=1&limit=10`).then(res => {
                    console.log('res===',res);
                    if(res.code === 0){
                        this.contentList = res.data.list;
                    }else{
                        uni.showToast({
                            title: res.msg,
                            icon: 'none'
                        });
                    }
                })
            },
			// TabBar切换事件处理
			handleTabChange(index) {
				const tabPages = [
					'/pages/tabbar-container/index?tab=0', // 设备页面
					'/pages/tabbar-container/index?tab=1', // 聊天页面  
					'/pages/tabbar-container/index?tab=2'  // 个人页面
				];
				
				if (tabPages[index]) {
					uni.reLaunch({
						url: tabPages[index]
					});
				}
			},
			
			
			// 播放内容
			async playContent(contentIndex, content) {
				// 检查设备信息
				if (!this.currentDevice) {
					uni.showToast({
						title: '请先选择设备',
						icon: 'none'
					});
					return;
				}
				
				// 如果正在播放相同内容，则不重复播放
				if (this.playContentIndex === contentIndex) {
					console.log('当前内容正在播放中');
					return;
				}
				
				try {
					// 清除之前的状态检查
					this.clearStatusTimer();
					
					// 设置加载状态
					this.playContentIndex = contentIndex;
					// 随机选择一个颜色配对
					const randomIndex = Math.floor(Math.random() * this.colorPairs.length);
					this.currentColorPair = this.colorPairs[randomIndex];
					
					console.log('开始播放内容:', content);
					
					// 调用播放接口
					const response = await http.post(`/content/${this.currentDevice.id}/play/${content.id}`);
					console.log('播放接口响应:', response);
					
					if (response.code === 0) {
						this.handlePlayResponse(response.data, contentIndex);
					} else {
						this.handlePlayError(response.msg || '播放失败', contentIndex);
					}
				} catch (error) {
					console.error('播放请求失败:', error);
					this.handlePlayError('播放请求失败', contentIndex);
				}
			},
			
			// 处理播放响应
			handlePlayResponse(data, contentIndex) {
				const { status, message, taskId } = data;
				
				switch (status) {
					case 'SUCCESS':
						// 播放成功
						uni.showToast({
							title: '播放成功',
							icon: 'success'
						});
						// 可以选择保持加载状态或者重置
						setTimeout(() => {
							this.resetPlayState();
						}, 2000);
						break;
						
					case 'BUSY':
						// 设备繁忙，需要轮询查询状态
						this.playingTaskId = taskId;
						uni.showLoading({
							title: '推送中...',
							mask: true
						});
						this.startStatusPolling(taskId, contentIndex);
						break;
						
					case 'OFFLINE':
						// 设备离线
						this.handlePlayError('设备离线，请检查设备连接', contentIndex);
						break;
						
					case 'FAILED':
						// 播放失败
						this.handlePlayError(message || '播放失败', contentIndex);
						break;
						
					default:
						this.handlePlayError('未知状态', contentIndex);
				}
			},
			
			// 处理播放错误
			handlePlayError(errorMsg, contentIndex) {
				console.error('播放错误:', errorMsg);
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
				this.resetPlayState();
			},
			
			// 开始状态轮询
			startStatusPolling(taskId, contentIndex) {
				console.log('开始状态轮询, taskId:', taskId);
				
				this.statusCheckTimer = setInterval(async () => {
					try {
						const response = await http.get(`/content/task/${taskId}`);
						console.log('状态查询响应:', response);
						
						if (response.code === 0) {
							const { status } = response.data;
							
							if (status !== 'BUSY') {
								// 状态不再是BUSY，停止轮询
								this.clearStatusTimer();
								uni.hideLoading();
								
								if (status === 'SUCCESS') {
									uni.showToast({
										title: '播放成功',
										icon: 'success'
									});
									setTimeout(() => {
										this.resetPlayState();
									}, 2000);
								} else if (status === 'OFFLINE') {
									this.handlePlayError('设备离线', contentIndex);
								} else if (status === 'FAILED') {
									this.handlePlayError('播放失败', contentIndex);
								}
							}
						} else {
							// 查询失败，停止轮询
							this.clearStatusTimer();
							uni.hideLoading();
							this.handlePlayError('状态查询失败', contentIndex);
						}
					} catch (error) {
						console.error('状态查询错误:', error);
						this.clearStatusTimer();
						uni.hideLoading();
						this.handlePlayError('状态查询失败', contentIndex);
					}
				}, 2000); // 每2秒查询一次
			},
			
			// 清除状态检查定时器
			clearStatusTimer() {
				if (this.statusCheckTimer) {
					clearInterval(this.statusCheckTimer);
					this.statusCheckTimer = null;
				}
				this.playingTaskId = null;
			},
			
			// 重置播放状态
			resetPlayState() {
				this.playContentIndex = -1;
				this.clearStatusTimer();
			},
		}
	}
</script>

<style scoped lang="scss">
	.role-page {
		.page-content{
			padding: 74.6rpx 74.6rpx 220rpx 74.6rpx; /* 底部增加TabBar预留空间 */
            .content-item-play {
                /* 背景色和边框色现在通过动态样式设置 */
            }
    
            .content-item {
                font-size: 29.9rpx;
                font-weight: 400;
                color: #303030;
                height: 104.5rpx;
                border-radius: 59.7rpx;
                border: 1px solid #D9D9D9;
                padding: 0 50rpx;
                margin-bottom: 30rpx;
                display: flex;
                align-items: center;
                justify-content: space-between;
    
                .content-item-bt {
                    width: 44.8rpx;
                    height: 44.8rpx;
                }
                .content-item-left{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    .content-item-left-text{
                        margin-left: 7.5rpx;
                    }
                }
            }
            
            // 加载图标旋转动画
            .loading-icon {
                animation: rotate 1s linear infinite;
            }
            
            @keyframes rotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
		}
	}
</style>