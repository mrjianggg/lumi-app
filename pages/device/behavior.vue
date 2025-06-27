<template>
	<view class="role-page">
		<head-return :toPage="0" title="修改行为指引"></head-return>
		<view class="page-content">
			<view class="behavior-list">
				<view class="behavior-item" v-for="(item, index) in labelList" :key="index">
					<view @click="onLabelClick(item)" class="behavior-item-label" :style="{ backgroundColor: item.color }">{{ item.label }}</view>
				</view>
			</view>
			<view class="behavior-box">
				<view class="behavior-box-title">有什么需要我记住的？</view>
				<textarea v-model="deviceInfo.userPrompt" placeholder-style="color:#757575" maxlength="500" placeholder="多引导表达..." class="behavior-box-textarea"/>
				<button 
					class="save-button" 
					@click="onSave"
				>
					保存
				</button>
			</view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
		<app-toast></app-toast>
	</view>
</template>

<script>
	import http from '@/utils/request.js'
	export default {
		data() {
			return {
				labelList: [
					{
						label: '喜欢游乐场',
						color: '#D5CFFF'
					},
					{
						label: '黄豆过敏',
						color: '#CFE9FF'
					},
					{
						label: '正在学习钢琴',
						color: '#AFF4C6'
					},
					{
						label: '有一个12平的卧室',
						color: '#FDD3D0'
					},
					{
						label: '想要学习日语',
						color: '#FFF1C2'
					}
				],
				deviceInfo: {}
			}
		},
		mounted() {
			this.deviceInfo = uni.getStorageSync('currentDevice');
			console.log('this.deviceInfo===',this.deviceInfo);
		},
		methods: {
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
			// 保存
			onSave() {
				http.put(`/device/userPrompt/${this.deviceInfo.id}`, {
					userPrompt: this.deviceInfo.userPrompt
				}).then(res => {
					if(res.code === 0){
						uni.setStorageSync('currentDevice', this.deviceInfo);
						this.$toast.success('保存成功');
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
					}
				})
			},
			// 标签点击
			onLabelClick(item) {
				console.log(item.label);
				if(this.deviceInfo.userPrompt && this.deviceInfo.userPrompt !== 'null'){
					this.deviceInfo.userPrompt = this.deviceInfo.userPrompt + ';' + item.label;
				}else{
					this.deviceInfo.userPrompt = item.label;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.role-page {
		.page-content{
			padding: 180rpx 40rpx 220rpx 40rpx; /* 底部增加TabBar预留空间 */
			.behavior-list{
				display: flex;
				flex-wrap: wrap;
				justify-content: start;
				margin-top: 37.3rpx;
				.behavior-item{
					margin-bottom: 26.1rpx;
					margin-right: 22.4rpx;
					.behavior-item-label{
						font-size: 29.9rpx;
						font-weight: 400;
						padding: 22.4rpx;
						border-radius: 44rpx;
						color: #1E1E1E;
					}
				}
			}
			.behavior-box{
				border: 1px solid #D9D9D9;
				border-radius: 59.7rpx;
				padding: 44.8rpx;
				.behavior-box-title{
					font-size: 29.9rpx;
					font-weight: 400;
					color: #303030;
				}
				.behavior-box-textarea {
					margin-top: 29.9rpx;
					width: 100%;
					height: 500rpx;
					padding: 44.8rpx;
					border: 1rpx solid #D9D9D9;
					border-radius: 29.9rpx;
					font-size: 29.9rpx;
					color: #303030;
					background-color: #F5F5F5;
					box-sizing: border-box;
				}
				.save-button {
					margin-top: 29.9rpx;
					width: 100%;
					height: 89.6rpx;
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
						background: #2C2C2C;
						color: #F5F5F5;
						transform: none;
						opacity: 0.5;
					}
				}
			}
		}
	}
</style>