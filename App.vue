<script>
	import { setStatusBarDark } from '@/utils/statusBar.js'
	import { getSafeAreaInsets, isNotchDevice, getStatusBarHeight } from '@/utils/safeArea.js'
	
	export default {
		onLaunch: function() {
			console.log('App onLaunch')
			// 初始化安全区域和状态栏
			this.initSafeArea()
			// 全局设置状态栏样式为深色（黑色文字）
			this.setStatusBarStyle()
		},
		onShow: function() {
			console.log('App Show')
			// 每次显示时也设置状态栏样式，确保一致性
			this.setStatusBarStyle()
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			setStatusBarStyle() {
				// 延迟执行，确保页面加载完成
				setTimeout(() => {
					setStatusBarDark()
				}, 100)
			},
			initSafeArea() {
				try {
					// 检测是否为刘海屏设备
					const isNotch = isNotchDevice()
					console.log('是否为刘海屏设备:', isNotch)
					
					// 获取安全区域信息
					const safeAreaInsets = getSafeAreaInsets()
					console.log('安全区域信息:', safeAreaInsets)
					
					// 获取状态栏高度
					const statusBarHeight = getStatusBarHeight()
					console.log('状态栏高度:', statusBarHeight)
					uni.setStorageSync('statusBarHeight', statusBarHeight)
					
					// 设置CSS变量，供全局使用
					// #ifdef H5
					if (typeof document !== 'undefined') {
						const root = document.documentElement
						root.style.setProperty('--status-bar-height', `${statusBarHeight}px`)
						root.style.setProperty('--safe-area-inset-top', `${safeAreaInsets.top}px`)
						root.style.setProperty('--safe-area-inset-right', `${safeAreaInsets.right}px`)
						root.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsets.bottom}px`)
						root.style.setProperty('--safe-area-inset-left', `${safeAreaInsets.left}px`)
					}
					// #endif
					
					// 将安全区域信息存储到全局数据中
					uni.setStorageSync('safeAreaInsets', safeAreaInsets)
					uni.setStorageSync('isNotchDevice', isNotch)
					uni.setStorageSync('statusBarHeight', statusBarHeight)
					
				} catch (error) {
					console.error('初始化安全区域失败:', error)
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url('./static/css/fonts.css');
	
	/* 全局样式 */
	page {
		background-color: #fff;
	}

</style>
