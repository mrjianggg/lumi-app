<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查蓝牙权限
			this.checkBluetoothPermission();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			checkBluetoothPermission() {
				// #ifdef APP-PLUS
				// 检查蓝牙是否可用
				try {
					uni.openBluetoothAdapter({
						success: (res) => {
							console.log('蓝牙适配器初始化成功', res);
							uni.closeBluetoothAdapter();
						},
						fail: (err) => {
							console.error('蓝牙适配器初始化失败', err);
							if (err.errCode === 10001) {
								uni.showModal({
									title: '提示',
									content: '请开启蓝牙功能后重试',
									showCancel: false,
									confirmText: '我知道了'
								});
							}
						}
					});
				} catch (e) {
					console.error('蓝牙检查异常', e);
				}
				// #endif
			}
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		font-size: 28rpx;
		color: #333;
		background-color: #f5f7fa;
	}
	
	/* 全局文本样式 */
	text {
		color: inherit;
	}
	
	/* 全局按钮样式 */
	button {
		position: relative;
		display: block;
		margin-left: auto;
		margin-right: auto;
		padding-left: 14px;
		padding-right: 14px;
		box-sizing: border-box;
		text-align: center;
		text-decoration: none;
		line-height: 2.55555556;
		border-radius: 5px;
		-webkit-tap-highlight-color: transparent;
		overflow: hidden;
		color: #000000;
		background-color: #F8F8F8;
		font-size: 18px;
	}
	
	button::after {
		border: none;
	}
	
	button:active {
		opacity: 0.8;
	}
	
	/* 输入框全局样式 */
	input {
		box-sizing: border-box;
		font-size: 28rpx;
	}
	
	/* 页面容器 */
	.container {
		padding: 30rpx;
	}
	
	/* 卡片样式 */
	.card {
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;
		overflow: hidden;
	}
	
	/* 加载动画 */
	.loading {
		display: inline-block;
		width: 20px;
		height: 20px;
		border: 2px solid #f3f3f3;
		border-radius: 50%;
		border-top-color: #667eea;
		animation: spin 1s ease-in-out infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	/* 渐变背景 */
	.gradient-bg {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	/* 过渡动画 */
	.fade-enter-active, .fade-leave-active {
		transition: opacity 0.3s;
	}
	
	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
	
	/* 安全区域适配 */
	.safe-area-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
