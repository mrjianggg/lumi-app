<template>
	<view class="role-page">
		<head-return :toPage="0" title="设置"></head-return>
		<view class="page-content">
			<view class="device-info">
				<view class="device-info-left">
					<image src="/static/img/deviceImg.png" mode="widthFix"></image>
				</view>
				<view class="device-info-right">
					<view class="device-info-right-name">
						<text>{{ deviceInfo.alias || deviceInfo.macAddress }}</text>
						<image @click="editDeviceName" src="/static/icon/Edit_light.svg" mode="widthFix"></image>
					</view>
					<view class="device-info-right-id">
						<text>SN: {{ deviceInfo.macAddress }}</text>
					</view>
				</view>
			</view>

			<view class="slider-container" :class="{ 'hide-thumb': hideThumb }">
				<view class="slider-container-title">
					<image src="/static/icon/voice.svg" mode="widthFix"></image>
					<text>音量</text>
				</view>
				<view class="slider-box">
					<view class="slider-box-value">
						{{ sliderChangingValue }}%
					</view>
					<slider :value="voiceValue" @change="sliderChange" @changing="sliderChanging" activeColor="#D5CFFF" backgroundColor="#F5F5F5" block-color="transparent" />
				</view>
			</view>

			<view class="child-text">
				小朋友信息
			</view>

			<view class="child-info">
				<view class="child-info-item">
					<view class="child-info-item-left">
						名字
					</view>
					<view class="child-info-item-right">
						<input v-model="deviceInfo.ownerName" @blur="saveChildInfo()" class="child-input" type="text" placeholder="未设置" />
					</view>
				</view>

				<view class="child-info-line"></view>

				<view class="child-info-item">
					<view class="child-info-item-left">
						生日
					</view>
					<view class="child-info-item-right">
						<picker mode="date" :value="birthdayValue" @change="onBirthdayChange">
							<view class="child-input" :class="{ placeholder: !deviceInfo.birthday }">
								{{ displayBirthday }}
							</view>
						</picker>
					</view>
				</view>

				<view class="child-info-line"></view>

				<view class="child-info-item">
					<view class="child-info-item-left">
						性别
					</view>
					<view class="child-info-item-right">
						<view class="boy-box">
							<view class="check-box" @click="saveChildInfo(1)">
								<view class="selected" v-if="deviceInfo.gender === 1"></view>
							</view>
							男孩
						</view>
						<view class="girl-box">
							<view class="check-box" @click="saveChildInfo(2)">
								<view class="selected" v-if="deviceInfo.gender === 2"></view>
							</view>
							女孩
						</view>
					</view>
				</view>
			</view>

			<view class="provisioning-btn" @click="toProvisioning">
				配网管理
			</view>

			<view class="delete-btn" @click="deleteDevice">
				删除
			</view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
		
		<!-- 编辑设备名称弹窗 -->
		<view v-if="showEditModal" class="modal-overlay" @click="cancelEdit">
			<view class="edit-modal" @click.stop>
				<view class="modal-title">设备名称</view>
				<input 
					class="modal-input" 
					v-model="deviceInfo.alias" 
					placeholder="请输入设备名称"
					maxlength="20"
					:focus="showEditModal"
				/>
				<view class="modal-buttons">
					<view class="modal-btn cancel-btn" @click="cancelEdit">取消</view>
					<view class="modal-btn confirm-btn" @click="confirmEdit">确定</view>
				</view>
			</view>
		</view>
		<app-toast></app-toast>
	</view>
</template>

<script>
	import http from '@/utils/request.js'
	export default {
		data() {
			return {
				voiceValue: 0,
				showVoiceValue: 0,
				hideThumb: false,
				sliderChangingValue: 0,
				showEditModal: false,
				deviceInfo: {},
				oldDeviceInfo: {},
			}
		},
		computed: {
			// 生日显示值
			displayBirthday() {
				return this.deviceInfo.birthday || '未设置'
			},
			// picker组件需要的值，为null时提供默认日期
			birthdayValue() {
				if (this.deviceInfo.birthday) {
					return this.deviceInfo.birthday
				}
				// 如果没有生日，返回今天的日期作为picker的默认值
				const today = new Date()
				const year = today.getFullYear()
				const month = String(today.getMonth() + 1).padStart(2, '0')
				const day = String(today.getDate()).padStart(2, '0')
				return `${year}-${month}-${day}`
			}
		},
		watch: {

		},
		onLoad() {

		},
		mounted() {
			this.deviceInfo = uni.getStorageSync('currentDevice');
			this.sliderChangingValue = this.voiceValue = this.deviceInfo.volumeLevel;
			this.oldDeviceInfo = JSON.parse(JSON.stringify(this.deviceInfo));
			console.log('deviceInfo===',this.deviceInfo);
		},
		methods: {
			// 生日选择改变事件
			onBirthdayChange(e) {
				console.log('生日选择:', e.detail.value)
				this.deviceInfo.birthday = e.detail.value
				this.saveChildInfo()
			},
			
			saveChildInfo(e) {
				console.log('保存儿童信息, e===', e);
				// 处理性别选择
				if(e && typeof e === 'number'){
					this.deviceInfo.gender = e;
				}
				if(this.deviceInfo.ownerName === this.oldDeviceInfo.ownerName && this.deviceInfo.birthday === this.oldDeviceInfo.birthday && this.deviceInfo.gender === this.oldDeviceInfo.gender){
					return;
				}
				console.log('保存数据:', {
					ownerName: this.deviceInfo.ownerName,
					birthday: this.deviceInfo.birthday,
					gender: this.deviceInfo.gender
				});
				http.put('/device/ownerInfo/' + this.deviceInfo.id, {
					ownerName: this.deviceInfo.ownerName,
					birthday: this.deviceInfo.birthday,
					gender: this.deviceInfo.gender
				}).then(res => {
					if(res.code === 0){
						uni.setStorageSync('currentDevice', this.deviceInfo);
						this.oldDeviceInfo = JSON.parse(JSON.stringify(this.deviceInfo));
						this.$toast.success('修改成功')
					}else{
						uni.showToast({
							title: res.message,
							icon: 'none'
						})
					}
				})
			},
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
			sliderChange(e) {
				this.hideThumb = (e.detail.value < 20);
				this.hideThumb = !(e.detail.value > 20 || e.detail.value === 20);
				this.voiceValue = e.detail.value;
				this.sliderChangingValue = e.detail.value;
            	console.log('value 发生变化：' + e.detail.value)
				uni.showLoading({
					title: '设置中...'
				})
				http.put('/device/volume/' + this.deviceInfo.id, {
					volumeLevel: e.detail.value
				}).then(res => {
					uni.hideLoading();
					if(res.code === 0){
						this.deviceInfo.volumeLevel = e.detail.value;
						uni.setStorageSync('currentDevice', this.deviceInfo);
						this.$toast.success('设置成功')
					}else{
						uni.showToast({
							title: res.message,
							icon: 'none'
						})
					}
				})
        	},
			sliderChanging(e) {
				this.sliderChangingValue = e.detail.value;
				this.hideThumb = e.detail.value < 20;
			},
			editDeviceName() {
				this.showEditModal = true;
			},
			toProvisioning() {
				uni.navigateTo({
					url: '/pages/provisioning/index?macAddress=' + this.deviceInfo.macAddress
				})
			},
			deleteDevice() {
				uni.showModal({
					title: '提示',
					content: '确定删除该设备吗？',
					success: (res) => {
						if (res.confirm) {
							http.post('/device/unbind', {
								deviceId: this.deviceInfo.id
							}).then(res => {
								if(res.code === 0){
									this.$toast.success('删除成功')
									// 返回到TabBar容器的设备页面
									uni.reLaunch({
										url: '/pages/tabbar-container/index?tab=0'
									})
								}else{
									uni.showToast({
										title: res.message,
										icon: 'none'
									})
								}
							})
						}
					}
				})
			},
			cancelEdit() {
				this.showEditModal = false;
			},
			confirmEdit() {
				if (!this.deviceInfo.alias) {
					uni.showToast({
						title: '请输入设备名称',
						position: 'top',
						icon: 'none'
					})
					return;
				}
				http.put('/device/alias/' + this.deviceInfo.id, {
					alias: this.deviceInfo.alias
				}).then(res => {
					if(res.code === 0){
						uni.setStorageSync('currentDevice', this.deviceInfo);
						this.showEditModal = false;
						this.$toast.success('设置成功')
					}else{
						uni.showToast({
							title: res.message,
							icon: 'none'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.role-page {
		.page-content{
			padding: 180rpx 40rpx 220rpx 40rpx; /* 底部增加TabBar预留空间 */
			.device-info{
				margin-top: 67.2rpx;
				display: flex;
				justify-content: start;
				align-items: center;
				border: 1rpx solid #D9D9D9;
				border-radius: 29.9rpx;
				padding: 44.8rpx;
				.device-info-left{
					image{
						width: 134.3rpx;
						height: 134.3rpx;
					}
				}
				.device-info-right{
					margin-left: 29.9rpx;
					.device-info-right-name{
						display: flex;
						align-items: center;
						font-size: 29.9rpx;
						font-weight: 400;
						color: #303030;
						image{
							width: 44.8rpx;
							height: 44.8rpx;
							margin-left: 5rpx;
						}
					}
					.device-info-right-id{
						margin-top: 10rpx;
						font-weight: 400;
						font-size: 26.1rpx;
						color: #757575;
					}
				}
			}
			.slider-container{
				margin-top: 29.9rpx;
				border: 1rpx solid #D9D9D9;
				border-radius: 59.7rpx;
				padding: 44.8rpx;
				.slider-container-title{
					display: flex;
					align-items: center;
					margin-bottom: 10rpx;
					image{
						width: 37.3rpx;
						height: 37.3rpx;
						margin-right: 5rpx;
					}
					text{
						font-size: 29.9rpx;
						font-weight: 400;
						color: #303030;
					}
				}
				.slider-box{
					position: relative;
					.slider-box-value{
						z-index: 1;
						position: absolute;
						top: 50%;
						transform: translateY(-50%);
						margin-left: 0;
						right: 5%;
						color: #B3B3B3;
						font-size: 29.9rpx;
						font-weight: 400;
					}
				}
				:deep(uni-slider){
					position: relative;
					margin: 0 !important;
				}
				/*  滑块有值的部分  */
				:deep(.uni-slider-track) {
					position: relative;
					z-index: 2;
					height: 100.7rpx !important;
					border-radius: 59.7rpx !important;
				}
				/*  滑块整体  */
				:deep(.uni-slider-handle-wrapper) {
					height: 100.7rpx !important;
					border-radius: 59.7rpx !important;
					border: 1px solid #D9D9D9 !important;
				}
				/*  可点击滑块  */
				:deep(.uni-slider-handle){
					z-index: 2;
					width: 115.7rpx;
					height: 115.7rpx;
					margin-top: -56rpx;
					margin-left: -70.9rpx;
					z-index: 4;
				}
				:deep(.uni-slider-tap-area){
					padding: 0 !important;
				}
				/*  显示的滑块  */
				:deep(.uni-slider-thumb) {
					z-index: 3;
					box-shadow: none !important;
					width: 37.3rpx;
					height: 37.3rpx;
					margin-left: -100rpx !important;
					background-image: url('/static/img/voice.png') !important;
					background-size: 100% 100% !important;
					background-repeat: no-repeat !important;
					background-position: center !important;
				}
				/*  当音量小于10时隐藏滑块  */
				&.hide-thumb :deep(.uni-slider-thumb) {
					display: none !important;
				}
			}
			.child-text{
				margin-top: 29.9rpx;
				font-size: 29.9rpx;
				font-weight: 400;
				color: #303030;
			}
			.child-info{
				margin-top: 29.9rpx;
				background-color: #F5F5F5;
				border: 1rpx solid #D9D9D9;
				border-radius: 59.7rpx;
				padding: 44.8rpx;
				.child-info-item{
					display: flex;
					align-items: center;
					justify-content: space-between;
					color: #303030;
					font-size: 29.9rpx;
					font-weight: 400;
					.child-info-item-left{
						font-size: 29.9rpx;
						font-weight: 400;
						color: #303030;
					}
					.child-input{
						text-align: right;
						font-size: 29.9rpx;
						font-weight: 400;
						color: #303030;
						
						&.placeholder {
							color: #B3B3B3;
						}
						
						.uni-input-placeholder {
							color: #B3B3B3;
							font-size: 29.9rpx;
						}
					}
					.child-info-item-right{	
						display: flex;
						align-items: center;
						justify-content: space-between;
						color: #B3B3B3;
						font-size: 29.9rpx;
						font-weight: 400;
						.boy-box{
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 14.9rpx;
							.check-box{
								margin-right: 5rpx;
								width: 33.6rpx;
								height: 33.6rpx;
								border-radius: 100%;
								border: 2px solid #209BFF;
								display: flex;
								align-items: center;
								justify-content: center;
								.selected{
									width: 25rpx;
									height: 25rpx;
									border-radius: 100%;
									background-color: #209BFF;
								}
							}
						}
						.girl-box{
							display: flex;
							align-items: center;
							justify-content: center;
							.check-box{
								margin-right: 5rpx;
								width: 33.6rpx;
								height: 33.6rpx;
								border-radius: 100%;
								border: 2px solid #F19EDC;
								display: flex;
								align-items: center;
								justify-content: center;
								.selected{
									width: 25rpx;
									height: 25rpx;
									border-radius: 100%;
									background-color: #F19EDC;
								}
							}
						}
					}
				}
				.child-info-line{
					width: 100%;
					height: 1rpx;
					background-color: #D9D9D9;
					margin: 29.9rpx 0;
				}
			}

			.provisioning-btn{
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 29.9rpx;
				width: 100%;
				height: 85.8rpx;
				border: 1rpx solid #D9D9D9;
				border-radius: 59.7rpx;
				font-size: 29.9rpx;
				font-weight: 400;
				color: #303030;
			}
			.delete-btn{
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 29.9rpx;
				width: 100%;
				height: 85.8rpx;
				background: #EC221F;
				border-radius: 59.7rpx;
				font-size: 29.9rpx;
				font-weight: 400;
				color: #F3F3F3;
			}
		}
	}
	
	/* 弹窗样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 888;
		
		.edit-modal {
			width: calc(100% - 200rpx);
			background-color: #FFFFFF;
			border-radius: 59.7rpx;
			padding: 44.8rpx;
			
			.modal-title {
				font-size: 29.9rpx;
				font-weight: 400;
				color: #303030;
				text-align: left;
			}
			
			.modal-input {
				margin-top: 29.9rpx;
				width: 100%;
				height: 130.6rpx;
				border: 1rpx solid #D9D9D9;
				border-radius: 29.9rpx;
				padding: 0 44.8rpx;
				font-size: 29.9rpx;
				font-weight: 400;
				color: #757575;
				background-color: #F5F5F5;
				box-sizing: border-box;
			}
			
			.modal-buttons {
				margin-top: 29.9rpx;
				display: flex;
				justify-content: space-between;
				gap: 14.9rpx;
				
				.modal-btn {
					flex: 1;
					height: 89.6rpx;
					border-radius: 59.7rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 29.9rpx;
					font-weight: 400;
					
					&.cancel-btn {
						color: #303030;
						border: 1rpx solid #757575;
					}
					
					&.confirm-btn {
						border: 1rpx solid #2C2C2C;
						background-color: #6D5BE3;
						color: #F5F5F5;
					}
				}
			}
		}
	}
</style>