<template>
	<view class="page-main">
		<head-return :toPage="2" title="个人信息"></head-return>
		<view class="page-content">
			<view class="profile-box" @click="uploadAvatar">
				<image :src="avatarUrl" mode="aspectFill" class="profile-box-aver"></image>
				<image src="/static/icon/camera.svg" mode="widthFix" class="profile-box-camera"></image>
			</view>
			<view class="user-name">
				<view class="user-name-text">用户名</view>
				<view class="exchange-input-container">
					<input 
						type="text" 
						v-model="userInfo.nickName"
						placeholder="请输入" 
						class="exchange-input"
						maxlength="50"
					/>
				</view>
			</view>
		</view>

		<view class="logout-btn" @click="saveUserInfo">
			保存修改
		</view>
	</view>
</template>

<script>
	import http from '@/utils/request.js'
	export default {
		data() {
			return {
				avatarUrl: '/static/img/aver.png',
				userInfo: {}
			}
		},
		mounted() {
			this.userInfo = uni.getStorageSync('userInfo');
			console.log('userInfo===',this.userInfo);
		},
		methods: {
			saveUserInfo() {
				if(this.userInfo.nickName.trim() === '') {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return;
				}
				http.put('/user/nickname', {
					nickName: this.userInfo.nickName
				}).then(res => {
					if(res.code === 0) {
						uni.setStorageSync('userInfo', this.userInfo);
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						});
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
					}
				})
			},
			uploadAvatar() {
				uni.chooseImage({
					count: 1, // 只允许选择一张图片
					sizeType: ['compressed'], // 压缩图片
					sourceType: ['album', 'camera'], // 可以从相册选择或拍照
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// 显示加载提示
						uni.showLoading({
							title: '上传中...',
							mask: true
						});
						console.log('tempFilePath===',tempFilePath);
						setTimeout(() => {
							// 更新头像显示
							this.avatarUrl = tempFilePath;
							
							uni.hideLoading();
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							});
						}, 1000);
						
						// 实际项目中的上传代码示例（取消注释并修改上传地址）
						/*
						uni.uploadFile({
							url: 'your-upload-api-url', // 替换为你的上传接口地址
							filePath: tempFilePath,
							name: 'avatar',
							header: {
								// 添加必要的请求头，如token等
							},
							success: (uploadRes) => {
								uni.hideLoading();
								const data = JSON.parse(uploadRes.data);
								if (data.code === 200) {
									this.avatarUrl = data.avatarUrl; // 使用服务器返回的图片地址
									uni.showToast({
										title: '头像更新成功',
										icon: 'success'
									});
								} else {
									uni.showToast({
										title: '上传失败',
										icon: 'none'
									});
								}
							},
							fail: (error) => {
								uni.hideLoading();
								uni.showToast({
									title: '上传失败',
									icon: 'none'
								});
								console.error('上传失败:', error);
							}
						});
						*/
					},
					fail: (error) => {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
						console.error('选择图片失败:', error);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-main {
		min-height: 100vh;
		background-color: #fff;
		position: relative;
		.page-content {
			padding: 0 39.2rpx;
			.profile-box{
				position: relative;
				margin-left: 50%;
				transform: translateX(-50%);
				margin-top: 72.8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				.profile-box-aver{
					width: 166rpx;
					height: 166rpx;
					border-radius: 100%;
				}
				.profile-box-camera{
					width: 59.7rpx;
					height: 59.7rpx;
					position: absolute;
					bottom: 0rpx;
					right: 70rpx;
				}
			}
			.user-name{
				margin-top: 46.6rpx;
				.user-name-text{
					font-size: 29.9rpx;
					font-weight: 400;
					color: #1E1E1E;
				}
				.exchange-input-container {
					margin: 24.3rpx 0;
					.exchange-input {
						width: 100%;
						height: 104.5rpx;
						padding: 14.9rpx 14.9rpx 14.9rpx 39.2rpx;
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
			}
		}
		.logout-btn{
			position: absolute;
			bottom: 46.6rpx;
			width: calc(100% - 78.4rpx);
			margin: 0 39.2rpx;
			height: 85.8rpx;
			background-color: #6D5BE3;
			border-radius: 59.7rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 29.9rpx;
			font-weight: 400;
			color: #F3F3F3;
		}
	}
</style>