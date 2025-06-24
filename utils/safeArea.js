/**
 * 安全区域和刘海屏适配工具
 */

/**
 * 获取安全区域信息
 * @returns {Object} 安全区域的上下左右边距
 */
export function getSafeAreaInsets() {
	let insets = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}
	
	try {
		let systemInfo = null
		
		// #ifdef APP-PLUS
		// 获取设备信息
		systemInfo = uni.getSystemInfoSync()
		
		// 状态栏高度
		insets.top = systemInfo.statusBarHeight || 0
		
		// iOS安全区域
		if (systemInfo.platform === 'ios') {
			// iPhone X及以上设备的安全区域
			if (systemInfo.safeAreaInsets) {
				insets.top = systemInfo.safeAreaInsets.top || insets.top
				insets.bottom = systemInfo.safeAreaInsets.bottom || 0
				insets.left = systemInfo.safeAreaInsets.left || 0
				insets.right = systemInfo.safeAreaInsets.right || 0
			}
			
			// 使用plus API获取更精确的安全区域
			if (plus && plus.navigator) {
				const safeArea = plus.navigator.getSafeAreaInsets()
				if (safeArea) {
					insets.top = safeArea.top || insets.top
					insets.bottom = safeArea.bottom || 0
					insets.left = safeArea.left || 0
					insets.right = safeArea.right || 0
				}
			}
		}
		
		// Android刘海屏处理
		if (systemInfo.platform === 'android') {
			// Android P (API 28) 及以上支持displayCutout
			if (systemInfo.version && parseInt(systemInfo.version) >= 28) {
				// 检测是否有刘海
				if (systemInfo.safeAreaInsets) {
					insets.top = Math.max(insets.top, systemInfo.safeAreaInsets.top || 0)
					insets.bottom = systemInfo.safeAreaInsets.bottom || 0
					insets.left = systemInfo.safeAreaInsets.left || 0
					insets.right = systemInfo.safeAreaInsets.right || 0
				}
			}
		}
		// #endif
		
		// #ifdef H5
		// H5环境下使用CSS env()变量
		if (typeof window !== 'undefined' && CSS && CSS.supports && CSS.supports('top: env(safe-area-inset-top)')) {
			// 创建一个测试元素来获取CSS env值
			const testEl = document.createElement('div')
			testEl.style.position = 'fixed'
			testEl.style.top = 'env(safe-area-inset-top)'
			testEl.style.left = 'env(safe-area-inset-left)'
			testEl.style.right = 'env(safe-area-inset-right)'
			testEl.style.bottom = 'env(safe-area-inset-bottom)'
			testEl.style.visibility = 'hidden'
			testEl.style.pointerEvents = 'none'
			document.body.appendChild(testEl)
			
			const computedStyle = getComputedStyle(testEl)
			insets.top = parseInt(computedStyle.top) || 0
			insets.left = parseInt(computedStyle.left) || 0
			insets.right = parseInt(computedStyle.right) || 0
			insets.bottom = parseInt(computedStyle.bottom) || 0
			
			document.body.removeChild(testEl)
		}
		// #endif
		
		// #ifdef MP
		// 小程序环境
		systemInfo = uni.getSystemInfoSync()
		insets.top = systemInfo.statusBarHeight || 0
		
		// 微信小程序的menuButton
		// #ifdef MP-WEIXIN
		if (uni.getMenuButtonBoundingClientRect) {
			const menuButton = uni.getMenuButtonBoundingClientRect()
			if (menuButton) {
				insets.top = Math.max(insets.top, menuButton.top + menuButton.height + 4)
			}
		}
		// #endif
		// #endif
		
		console.log('安全区域信息:', insets)
	} catch (error) {
		console.error('获取安全区域信息失败:', error)
	}
	
	return insets
}

/**
 * 生成安全区域样式
 * @param {Object} options 配置选项
 * @param {boolean} options.top 是否添加顶部安全区域
 * @param {boolean} options.bottom 是否添加底部安全区域
 * @param {boolean} options.left 是否添加左侧安全区域
 * @param {boolean} options.right 是否添加右侧安全区域
 * @param {string} options.type 样式类型：'padding' 或 'margin'
 * @returns {Object} 样式对象
 */
export function getSafeAreaStyle(options = {}) {
	const {
		top = true,
		bottom = true,
		left = true,
		right = true,
		type = 'padding'
	} = options
	
	const insets = getSafeAreaInsets()
	const style = {}
	
	const prefix = type === 'margin' ? 'margin' : 'padding'
	
	if (top && insets.top > 0) {
		style[`${prefix}Top`] = `${insets.top}px`
	}
	if (bottom && insets.bottom > 0) {
		style[`${prefix}Bottom`] = `${insets.bottom}px`
	}
	if (left && insets.left > 0) {
		style[`${prefix}Left`] = `${insets.left}px`
	}
	if (right && insets.right > 0) {
		style[`${prefix}Right`] = `${insets.right}px`
	}
	
	return style
}

/**
 * 检测是否为刘海屏设备
 * @returns {boolean}
 */
export function isNotchDevice() {
	try {
		let deviceInfo = null
		
		// #ifdef APP-PLUS
		deviceInfo = uni.getSystemInfoSync()
		
		// iOS设备检测
		if (deviceInfo.platform === 'ios') {
			// iPhone X系列的屏幕尺寸特征
			const { screenWidth, screenHeight, pixelRatio } = deviceInfo
			const realWidth = screenWidth * pixelRatio
			const realHeight = screenHeight * pixelRatio
			
			// iPhone X/XS: 1125x2436, iPhone XR: 828x1792, iPhone XS Max: 1242x2688
			// iPhone 12 mini: 1080x2340, iPhone 12/12 Pro: 1170x2532, iPhone 12 Pro Max: 1284x2778
			const notchSizes = [
				[1125, 2436], [1242, 2688], [828, 1792],  // X系列
				[1080, 2340], [1170, 2532], [1284, 2778]  // 12系列
			]
			
			return notchSizes.some(([w, h]) => 
				(realWidth === w && realHeight === h) || 
				(realWidth === h && realHeight === w)
			)
		}
		
		// Android设备检测（通过安全区域判断）
		if (deviceInfo.platform === 'android') {
			const insets = getSafeAreaInsets()
			return insets.top > deviceInfo.statusBarHeight || 
				   insets.bottom > 0 || 
				   insets.left > 0 || 
				   insets.right > 0
		}
		// #endif
		
		// #ifdef H5
		// H5环境下通过CSS env变量检测
		if (typeof window !== 'undefined' && CSS && CSS.supports && CSS.supports('top: env(safe-area-inset-top)')) {
			const insets = getSafeAreaInsets()
			return insets.top > 20 || insets.bottom > 0 || insets.left > 0 || insets.right > 0
		}
		// #endif
		
		return false
	} catch (error) {
		console.error('检测刘海屏失败:', error)
		return false
	}
}

/**
 * 获取状态栏高度（兼容函数）
 * @returns {number}
 */
export function getStatusBarHeight() {
	try {
		let statusInfo = null
		
		// #ifdef APP-PLUS
		statusInfo = uni.getSystemInfoSync()
		return statusInfo.statusBarHeight || 0
		// #endif
		
		// #ifdef H5
		return 0
		// #endif
		
		// #ifdef MP
		statusInfo = uni.getSystemInfoSync()
		return statusInfo.statusBarHeight || 0
		// #endif
	} catch (error) {
		console.error('获取状态栏高度失败:', error)
		return 0
	}
}

export default {
	getSafeAreaInsets,
	getSafeAreaStyle,
	isNotchDevice,
	getStatusBarHeight
} 