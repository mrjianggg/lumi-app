<template>
	<view class="page-main">
		<head-return :toPage="2" title="兑换"></head-return>
		<view class="page-content">
			<view class="exchange-title">输入礼品卡/兑换码</view>
			<view class="exchange-input-container">
				<input 
					type="text" 
					v-model="exchangeCode"
					placeholder="请输入" 
					class="exchange-input"
					maxlength="50"
				/>
			</view>
			<button 
				class="exchange-button" 
				:class="{ 'disabled': !exchangeCode.trim() }"
				:disabled="!exchangeCode.trim()"
				@click="handleExchange"
			>
				确认兑换
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				exchangeCode: '' // 兑换码
			}
		},
		methods: {
			// 处理兑换
			handleExchange() {
				uni.reLaunch({ url: '/pages/index/index' });

				if (!this.exchangeCode.trim()) {
					uni.showToast({
						title: '请输入兑换码',
						icon: 'none'
					});
					return;
				}
				
				// 显示加载提示
				uni.showLoading({
					title: '兑换中...'
				});
				
				// 模拟兑换请求
				setTimeout(() => {
					uni.hideLoading();
					// 这里应该调用实际的兑换API
					// 暂时模拟成功
					uni.showModal({
						title: '兑换成功',
						content: '您的礼品卡已成功兑换！',
						showCancel: false,
						confirmText: '确定',
						success: () => {
							// 兑换成功后清空输入框
							this.exchangeCode = '';
						}
					});
				}, 1500);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-main {
		height: 100%;
		background-color: #fff;
		
		.page-content {
			padding: 400rpx 40rpx 0 40rpx;
			.exchange-title {
				font-size: 44.8rpx;
				font-weight: 600;
				color: #303030;
			}
			.exchange-input-container {
				margin: 44.8rpx 0;
				.exchange-input {
					width: 100%;
					height: 104.5rpx;
					padding: 14.9rpx;
					border: 1rpx solid #D9D9D9;
					border-radius: 29.9rpx;
					font-size: 29.9rpx;
					color: #303030;
					background-color: #F5F5F5;
					box-sizing: border-box;
					
					.uni-input-placeholder {
						color: #757575;
						font-size: 29.9rpx;
					}
					
					&:focus {
						border-color: #B19CD9;
						outline: none;
					}
				}
			}
			
			.exchange-button {
				width: 100%;
				height: 85.8rpx;
				background: #b4aaf8;
				border: none;
				border-radius: 44rpx;
				color: #fff;
				font-size: 29.9rpx;
				font-weight: 400;
				display: flex;
				align-items: center;
				justify-content: center;
				border: none;
				&:after{
					border: none !important;
				}
				&.disabled {
					border: none;
					background: #D5CFFF;
					color: #F3F3F3;
					transform: none;
					opacity: 1;
				}
			}
		}
	}
</style>