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
					<image src="/static/icon/google.svg" mode="widthFix" class="google-icon"></image>
					<text>Log in with Google</text>
				</view>
				
				<view class="apple-login-btn" @click="loginWithApple">
					<image src="/static/icon/apple.svg" mode="widthFix" class="apple-icon"></image>
					<text>Log in with Apple</text>
				</view>
			</view>
			
			<!-- 用户协议 -->
			<view class="terms-text">
				<text>By continuing, you accept our </text>
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
	
	export default {
		components: {
			CountryModal
		},
		data() {
			return {
				phoneNumber: '',
				verificationCode: '',
				countdown: 0,
				countdownTimer: null,
				showCountryModal: false,
				selectedCountry: {
					name: '中国',
					code: '+86'
				}
			};
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
			sendSMS() {
				if (this.countdown > 0) return;
				
				if (!this.phoneNumber || this.phoneNumber.length < 7) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}
				
				// 模拟发送验证码
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				});
				
				// 开始倒计时
				this.startCountdown();
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
			login() {
				if (!this.phoneNumber || this.phoneNumber.length < 7) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}
				
				if (!this.verificationCode || this.verificationCode.length !== 6) {
					uni.showToast({
						title: '请输入6位验证码',
						icon: 'none'
					});
					return;
				}
				
				// 模拟登录
				uni.showLoading({
					title: '登录中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					
					// 跳转到首页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/tabbar-container/index?tab=0'
						});
					}, 1500);
				}, 2000);
			},
			
			// Google登录
			loginWithGoogle() {
				uni.showToast({
					title: 'Google登录功能开发中',
					icon: 'none'
				});
			},
			
			// Apple登录
			loginWithApple() {
				uni.showToast({
					title: 'Apple登录功能开发中',
					icon: 'none'
				});
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
		min-height: 100vh;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	
		.header-box{
            background-color: #81D3FF;
			width: 100%;
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
            margin-top: -100rpx;
			background-image: url('/static/img/loginBg.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: center;
			padding: 60rpx 40rpx;
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
				margin-bottom: 50rpx;
				
				.verification-input {
					flex: 1;
					height: 100rpx;
					border: 2rpx solid #E5E5E5;
					border-radius: 20rpx;
					padding: 0 30rpx;
					font-size: 32rpx;
					color: #2C2C2C;
					margin-right: 20rpx;
					
					&::placeholder {
						color: #999999;
					}
				}
				
				.send-sms-btn {
					width: 200rpx;
					height: 100rpx;
					background-color: #F5F5F5;
					border-radius: 20rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 28rpx;
					color: #666666;
					border: 2rpx solid #E5E5E5;
					
					&:not(.disabled):active {
						background-color: #E5E5E5;
					}
					
					&.disabled {
						opacity: 0.5;
					}
				}
			}
			
			.login-btn {
				width: 100%;
				height: 100rpx;
				background-color: #6C5CE7;
				border-radius: 50rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 36rpx;
				font-weight: 600;
				color: #FFFFFF;
				margin-bottom: 50rpx;
				
				&:active {
					background-color: #5A4BD6;
				}
			}
			
			.divider {
				display: flex;
				align-items: center;
				margin-bottom: 40rpx;
				
				.line {
					flex: 1;
					height: 2rpx;
					background-color: #E5E5E5;
				}
				
				.divider-text {
					margin: 0 30rpx;
					font-size: 28rpx;
					color: #999999;
				}
			}
			
			.third-party-login {
				margin-bottom: 40rpx;
				
				.google-login-btn, .apple-login-btn {
					width: 100%;
					height: 100rpx;
					border-radius: 50rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					font-weight: 500;
					margin-bottom: 20rpx;
					
					image {
						width: 40rpx;
						height: 40rpx;
						margin-right: 20rpx;
					}
				}
				
				.google-login-btn {
					background-color: #FFFFFF;
					border: 2rpx solid #E5E5E5;
					color: #2C2C2C;
					
					&:active {
						background-color: #F8F8F8;
					}
				}
				
				.apple-login-btn {
					background-color: #2C2C2C;
					color: #FFFFFF;
					
					&:active {
						background-color: #1A1A1A;
					}
				}
			}
			
			.terms-text {
				text-align: center;
				font-size: 24rpx;
				color: #999999;
				line-height: 1.5;
				
				.link-text {
					color: #6C5CE7;
					text-decoration: underline;
				}
			}
		}
	}
</style>
