/**
 * 状态栏样式工具
 */

/**
 * 设置状态栏为深色模式（黑色文字）
 */
export function setStatusBarDark() {
	try {
		// #ifdef APP-PLUS
		// 使用5+ API设置状态栏样式
		if (plus && plus.navigator) {
			plus.navigator.setStatusBarStyle('dark')
			console.log('状态栏已设置为深色模式（黑色文字）')
		}
		// #endif
		
	} catch (error) {
		console.error('设置状态栏深色模式失败:', error)
	}
}

/**
 * 设置状态栏为浅色模式（白色文字）
 */
export function setStatusBarLight() {
	try {
		// #ifdef APP-PLUS
		// 使用5+ API设置状态栏样式
		if (plus && plus.navigator) {
			plus.navigator.setStatusBarStyle('light')
			console.log('状态栏已设置为浅色模式（白色文字）')
		}
		// #endif
		
	} catch (error) {
		console.error('设置状态栏浅色模式失败:', error)
	}
}

/**
 * 根据背景颜色自动设置状态栏样式
 * @param {string} backgroundColor - 背景颜色（十六进制或rgb）
 */
export function setStatusBarStyleAuto(backgroundColor) {
	// 简单的亮度检测，判断背景色是深色还是浅色
	const isLightBackground = isLightColor(backgroundColor)
	
	if (isLightBackground) {
		setStatusBarDark() // 浅色背景用深色文字
	} else {
		setStatusBarLight() // 深色背景用浅色文字
	}
}

/**
 * 判断颜色是否为浅色
 * @param {string} color - 颜色值
 * @returns {boolean}
 */
function isLightColor(color) {
	// 移除#号
	color = color.replace('#', '')
	
	// 转换为RGB
	const r = parseInt(color.substr(0, 2), 16)
	const g = parseInt(color.substr(2, 2), 16)
	const b = parseInt(color.substr(4, 2), 16)
	
	// 计算亮度 (YIQ公式)
	const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
	
	return brightness > 128
}

/**
 * 获取状态栏高度
 */
export function getStatusBarHeight() {
	let statusBarHeight = 0
	
	try {
		// #ifdef APP-PLUS
		statusBarHeight = plus.navigator.getStatusbarHeight()
		// #endif
		
		// #ifdef H5
		statusBarHeight = 0
		// #endif
		
		// #ifdef MP
		const systemInfo = uni.getSystemInfoSync()
		statusBarHeight = systemInfo.statusBarHeight || 0
		// #endif
		
		console.log('状态栏高度:', statusBarHeight + 'px')
	} catch (error) {
		console.error('获取状态栏高度失败:', error)
	}
	
	return statusBarHeight
}

/**
 * 设置状态栏背景色（仅Android有效）
 * @param {string} color - 背景颜色
 */
export function setStatusBarBackground(color) {
	try {
		// #ifdef APP-PLUS
		if (plus && plus.navigator && plus.os.name === 'Android') {
			plus.navigator.setStatusBarBackground(color)
			console.log('Android状态栏背景色已设置为:', color)
		}
		// #endif
	} catch (error) {
		console.error('设置状态栏背景色失败:', error)
	}
}

export default {
	setStatusBarDark,
	setStatusBarLight,
	setStatusBarStyleAuto,
	getStatusBarHeight,
	setStatusBarBackground
} 