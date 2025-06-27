<template>
	<view class="login-page">

		<!-- 头部logo区域 -->
        <view class="header-box">
            <image src="/static/img/loginImg.png" mode="widthFix" class="header-img"></image>
        </view>
		
		<!-- 登录卡片 -->
		<view class="login-card">
			<view class="card-title">Login</view>
			
			<!-- 手机号输入 -->
			<view class="phone-section">
				<view class="country-code" @click="showCountryPicker">
					<text>{{ selectedCountry.code }}</text>
					<image src="/static/icon/down.svg" mode="widthFix" class="arrow-icon"></image>
				</view>
				<input 
					type="number" 
					v-model="phoneNumber" 
					placeholder="" 
					class="phone-input"
					maxlength="11"
				/>
			</view>
			
			<!-- 验证码输入 -->
			<view class="verification-section">
				<input 
					type="number" 
					v-model="verificationCode" 
					placeholder="Verification Code" 
					class="verification-input"
					maxlength="6"
				/>
				<view 
					class="send-sms-btn" 
					:class="{ 'disabled': countdown > 0 }"
					@click="sendSMS"
				>
					<text v-if="countdown > 0">{{ countdown }}s</text>
					<text v-else>Send SMS</text>
				</view>
			</view>
			
			<!-- 登录按钮 -->
			<view class="login-btn" @click="login">Login</view>
			
			<!-- 分隔线 -->
			<view class="divider">
				<view class="line"></view>
				<text class="divider-text">Or</text>
				<view class="line"></view>
			</view>
			
			<!-- 第三方登录 -->
			<view class="third-party-login">
				<view class="google-login-btn" @click="loginWithGoogle">
					<image src="/static/icon/GoogleLogo.svg" mode="widthFix" class="google-icon"></image>
					<text>Login with Google</text>
				</view>
				
				<view class="weixin-login-btn" @click="loginWithWechat">
					<image src="/static/icon/weixin.svg" mode="widthFix" class="apple-icon"></image>
					<text>Log In with Wechat</text>
				</view>

				<view class="apple-login-btn" @click="loginWithApple" v-if="osName === 'iOS'">
					<image src="/static/icon/AppleLogo.svg" mode="widthFix" class="apple-icon"></image>
					<text>Login with Apple</text>
				</view>
			</view>
			
			<!-- 用户协议 -->
			<view class="terms-text">
				<text>By continuing, you accept our EULA </text>
				<text class="link-text" @click="openTerms">Terms of Service</text>
				<text> and </text>
				<text class="link-text" @click="openPrivacy">Privacy Policy</text>
				<text>!</text>
			</view>
		</view>
		
		<!-- 国家选择组件 -->
		<country-modal 
			:visible="showCountryModal" 
			@select="selectCountry"
			@close="hideCountryPicker"
		></country-modal>
	</view>
</template>

<script>
	import CountryModal from '@/components/country-modal.vue'
	import http from '@/utils/request.js'
	import WechatAuth from '@/utils/wechat-auth.js'
	import AppleAuth from '@/utils/apple-auth.js'
	import GoogleAuth from '@/utils/google-auth.js'

	export default {
		components: {
			CountryModal
		},
		data() {
			return {
				phoneNumber: '13800138000',
				verificationCode: '5948',
				countdown: 0,
				countdownTimer: null,
				showCountryModal: false,
				selectedCountry: {
					name: '中国',
					code: '+86'
				},
				osName: ''
			};
		},
		onLoad() {
			this.osName = plus.os.name;
		},
		
		methods: {
			// 显示国家选择器
			showCountryPicker() {
				this.showCountryModal = true;
			},
			
			// 隐藏国家选择器
			hideCountryPicker() {
				this.showCountryModal = false;
			},
			
			// 选择国家
			selectCountry(country) {
				this.selectedCountry = country;
				this.hideCountryPicker();
			},
			
			// 发送验证码
			async sendSMS() {
				if (this.countdown > 0) return;
				
				if (!this.phoneNumber || this.phoneNumber.length < 7) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}
				// 发送验证码
				await http.post('/sms/send', { mobile: this.phoneNumber }).then(res => {
					if(res.code === 0){
						// 开始倒计时
						this.startCountdown();
						uni.showToast({
							title: '验证码已发送',
							icon: 'success'
						});
					}
				}).catch(err => {
					console.error('发送验证码失败：', err.message)
				})
			},
			
			// 开始倒计时
			startCountdown() {
				this.countdown = 60;
				this.countdownTimer = setInterval(() => {
					this.countdown--;
					if (this.countdown <= 0) {
						clearInterval(this.countdownTimer);
						this.countdownTimer = null;
					}
				}, 1000);
			},
			
			// 登录
			 async login() {
				if (!this.phoneNumber || this.phoneNumber.length < 7) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}
				
				if (!this.verificationCode || this.verificationCode.length !== 4) {
					uni.showToast({
						title: '请输入4位验证码',
						icon: 'none'
					});
					return;
				}
				
				// 模拟登录
				uni.showLoading({
					title: '登录中...'
				});

				// 验证码登录
				await http.post('/sms/login', { mobile: this.phoneNumber, smsCode: this.verificationCode }).then(res => {
					console.log('lumi/sms/login===', res);
					if(res.code === 0){
						uni.hideLoading();
						uni.setStorageSync('token', res.data.token);
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						// 跳转到首页
						uni.reLaunch({
							url: '/pages/tabbar-container/index?tab=0'
						})
					}
				}).catch(err => {
					console.error('发送验证码失败：', err.message)
				})
			},
			
			// Google登录
			async loginWithGoogle() {
				try {
					// 首先检查Google登录是否可用
					const isAvailable = await GoogleAuth.checkGoogleSignInAvailable();
					if (!isAvailable) {
						uni.showModal({
							title: '提示',
							content: 'Google登录服务不可用，请检查网络连接和配置',
							showCancel: false
						});
						return;
					}
					
					uni.showLoading({
						title: 'Google登录中...'
					});
					
					// 使用Google登录工具类
					const authResult = await GoogleAuth.login();
					console.log('Google授权结果:', authResult);
					
					// 调用后端接口验证Google登录
					const loginParams = {
						access_token: authResult.access_token,
						id_token: authResult.id_token,
						code: authResult.code,
						userInfo: authResult.userInfo
					};
					
					const loginResult = await http.post('/user/google/callback', loginParams);
					console.log('Google登录结果:', loginResult);
					uni.hideLoading();
					
					if (loginResult.code === 0) {
						// 保存用户信息和token
						uni.setStorageSync('token', loginResult.data.token);
						
						// 保存Google访问令牌（用于后续API调用）
						if (authResult.access_token) {
							uni.setStorageSync('google_access_token', authResult.access_token);
						}
						
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						
						// 跳转到首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/tabbar-container/index?tab=0'
							});
						}, 1000);
					} else {
						uni.showToast({
							title: loginResult.msg || 'Google登录失败',
							icon: 'none'
						});
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('Google登录错误:', error);
					
					// 根据错误类型显示不同的提示
					let errorMessage = 'Google登录失败，请重试';
					
					if (error.message.includes('用户取消')) {
						errorMessage = '您取消了Google登录';
					} else if (error.message.includes('不支持')) {
						errorMessage = '当前设备不支持Google登录';
					} else if (error.message.includes('配置错误') || error.code === -1002) {
						errorMessage = 'Google登录配置错误';
					} else if (error.message.includes('网络')) {
						errorMessage = '网络连接失败，请检查网络';
					} else if (error.code === -1002 || error.code === 7) {
						errorMessage = 'Google OAuth配置错误';
					}
				
					uni.showToast({
						title: errorMessage,
						icon: 'none'
					});
				}
			},
			
			// 微信登录
			async loginWithWechat() {
				try {
					uni.showLoading({
						title: '微信登录中...'
					});
					
					// 使用微信登录工具类
					const authResult = await WechatAuth.login();
					console.log('微信授权结果:', authResult);
					
					// 调用后端接口验证微信登录
					const loginResult = await http.get('/user/wechat/callback?code='+authResult.code);
					console.log('微信登录结果----:', loginResult);
					uni.hideLoading();
					
					if (loginResult.code === 0) {
						// 保存用户信息和token
						uni.setStorageSync('token', loginResult.data.token);
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						
						// 跳转到首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/tabbar-container/index?tab=0'
							});
						}, 1000);
					} else {
						uni.showToast({
							title: loginResult.msg || '微信登录失败',
							icon: 'none'
						});
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('微信登录错误:', error);
					
					// 显示错误信息
					uni.showToast({
						title: error.message || '微信登录失败，请重试',
						icon: 'none'
					});
				}
			},
			
			// Apple登录
			async loginWithApple() {
				try {
					// 首先检查苹果登录是否可用
					const isAvailable = await AppleAuth.checkAppleSignInAvailable();
					if (!isAvailable) {
						uni.showModal({
							title: '提示',
							content: '苹果登录仅支持iOS 13.0及以上版本的设备',
							showCancel: false
						});
						return;
					}
					
					uni.showLoading({
						title: '苹果登录中...'
					});
					
					// 使用苹果登录工具类
					const authResult = await AppleAuth.login();
					console.log('苹果授权结果:', authResult);
					
					// 调用后端接口验证苹果登录
					// 发送身份令牌到后端进行验证
					const loginParams = {
						identityToken: authResult.identityToken,
						authorizationCode: authResult.authorizationCode,
						userIdentifier: authResult.userIdentifier,
						email: authResult.email,
						fullName: authResult.fullName,
						realUserStatus: authResult.realUserStatus
					};
					
					const loginResult = await http.post('/user/apple/callback', loginParams);
					console.log('苹果登录结果:', loginResult);
					uni.hideLoading();
					
					if (loginResult.code === 0) {
						// 保存用户信息和token
						uni.setStorageSync('token', loginResult.data.token);
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						
						// 跳转到首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/tabbar-container/index?tab=0'
							});
						}, 1000);
					} else {
						uni.showToast({
							title: loginResult.msg || '苹果登录失败',
							icon: 'none'
						});
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('苹果登录错误:', error);
					
					// 根据错误类型显示不同的提示
					let errorMessage = '苹果登录失败，请重试';
					if (error.message.includes('用户取消')) {
						errorMessage = '您取消了苹果登录';
					} else if (error.message.includes('不支持')) {
						errorMessage = '当前设备不支持苹果登录';
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none'
					});
				}
			},
			
			// 打开服务条款
			openTerms() {
				uni.showToast({
					title: '服务条款页面',
					icon: 'none'
				});
			},
			
			// 打开隐私政策
			openPrivacy() {
				uni.showToast({
					title: '隐私政策页面',
					icon: 'none'
				});
			}
		},
		
		onUnload() {
			// 页面卸载时清除定时器
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-page {
		min-height: 102vh;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	
		.header-box{
            background-color: #CFF9FF;
			width: 100vw;
			height: 522.4rpx;
            display: flex;
            justify-content: center;
            z-index: 1;
			.header-img{
                margin-top: 80rpx;
				width: 300rpx;
			}
		}
		.login-card {
			position: absolute;
			top: 410rpx;
			left: 0;
			right: 0;
			bottom: 0;
			background-image: url('/static/img/loginBg.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: center;
			padding: 60rpx 40rpx 60rpx 40rpx;
			z-index: 2;
			
			.card-title {
				font-size: 44.8rpx;
				font-weight: 700;
				color: #1E1E1E;
				text-align: center;
			}
			
			.phone-section {
                margin-top: 84rpx;
				display: flex;
				align-items: center;
				margin-bottom: 40rpx;
				border: 1px solid #D9D9D9;
				border-radius: 40rpx;
				padding: 0 30rpx;
				height: 82.1rpx;
				
				.country-code {
                    height: 100%;
					display: flex;
					align-items: center;
					padding-right: 20rpx;
					border-right: 1px solid #D9D9D9;
					margin-right: 20rpx;
					cursor: pointer;
					
					text {
						font-size: 32rpx;
						color: #2C2C2C;
						margin-right: 10rpx;
					}
					
					.arrow-icon {
						width: 37.3rpx;
						height: 37.3rpx;
					}
				}
				
				.phone-input {
					flex: 1;
					font-size: 32rpx;
					color: #2C2C2C;
					
					&::placeholder {
						color: #999999;
					}
				}
			}
			
			.verification-section {
				display: flex;
				align-items: center;
				.verification-input {
					flex: 1;
					height: 74.6rpx;
					border: 1px solid #D9D9D9;
					border-radius: 40rpx;
					padding: 0 30rpx;
					font-size: 29.9rpx;
					color: #303030;
					margin-right: 20rpx;
					
					.uni-input-placeholder {
						color: #B3B3B3;
						font-size: 29.9rpx;
					}
				}
				
				.send-sms-btn {
					width: 212.7rpx;
					height: 74.6rpx;
					border-radius: 40rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 29.9rpx;
					color: #1E1E1E;
					border: 1px solid #767676;
					
					&.disabled {
						opacity: 0.5;
					}
				}
			}
			
			.login-btn {
				margin-top: 29.9rpx;
				width: 100%;
				height: 89.6rpx;
				background-color: #6D5BE3;
				border: 1px solid #2C2C2C;
				border-radius: 50rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 29.9rpx;
				font-weight: 400;
				color: #F5F5F5;
				
				&:active {
					background-color: #5A4BD6;
				}
			}
			
			.divider {
				margin-top: 29.9rpx;
				display: flex;
				align-items: center;
				
				.line {
					flex: 1;
					height: 1px;
					background-color: #D9D9D9;
				}
				
				.divider-text {
					margin: 0 30rpx;
					font-size: 29.9rpx;
					color: #1E1E1E;
				}
			}
			
			.third-party-login {
				margin-top: 29.9rpx;
				margin-bottom: 90rpx;
				
				.google-login-btn, .apple-login-btn, .weixin-login-btn {
					width: 100%;
					height: 89.6rpx;
					border-radius: 50rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 29.9rpx;
					font-weight: 400;
					margin-bottom: 29.9rpx;
					
					image {
						width: 44.8rpx;
						height: 44.8rpx;
						margin-right: 20rpx;
					}
				}
				
				.google-login-btn {
					background-color: #FFFFFF;
					border: 1px solid #D9D9D9;
					color: #0000008A;
				}
				
				.weixin-login-btn {
					background-color: #5CC928;
					color: #F3F3F3;
				}

				.apple-login-btn {
					background-color: #2C2C2C;
					color: #FFFFFF;
				}
			}
			
			.terms-text {
				width: 460.8rpx;
				margin: 0 auto;
				text-align: center;
				font-size: 22.4rpx;
				color: #1E1E1E;
				line-height: 1.5;
				
				.link-text {
					color: #0059FE;
					text-decoration: underline;
				}
			}
		}
	}
</style>
