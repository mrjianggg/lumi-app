<template>
	<view class="splash-container">
		<image class="logo" src="/static/img/loginImg.png" mode="widthFix"></image>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	
	onLoad() {
		// 页面加载时检查登录状态
		this.checkLoginStatus()
	},
	
	methods: {
		async checkLoginStatus() {
			try {
				// 添加最小加载时间，避免闪烁
				await this.delay(1000)
				
				// uni.setStorageSync('token', '45b5b34a5ea185e1223f387406fe032c')  // 测试后删除

				
				const token = uni.getStorageSync('token')
				
				if (token) {
					// 有token，验证token有效性
					await this.validateToken(token)
				} else {
					// 没有token，跳转到登录页
					this.goToLogin()
				}
			} catch (error) {
				console.error('检查登录状态失败:', error)
				// 出错时默认跳转到登录页
				this.goToLogin()
			}
		},
		
		async validateToken(token) {
			try {
				// 这里可以调用一个验证token的接口
				// 如果token有效，跳转到主页面
				// 如果token无效，会被request.js拦截处理
				uni.reLaunch({
					url: '/pages/tabbar-container/index'
				})
			} catch (error) {
				// token验证失败，清除token并跳转登录页
				uni.removeStorageSync('token')
				this.goToLogin()
			}
		},
		
		goToLogin() {
			uni.reLaunch({
				url: '/pages/login/index'
			})
		},
		
		// 延迟函数
		delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms))
		}
	}
}
</script>

<style scoped lang="scss">
.splash-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: #CFF9FF;
	.logo{
		width: 319rpx;
	}


}


</style> 