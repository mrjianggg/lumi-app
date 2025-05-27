<template>
	<view class="device-list-container">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input class="search-input" 
					v-model="searchText" 
					placeholder="搜索设备名称" 
					@input="filterDevices"
				/>
			</view>
			<view class="scan-button" @click="toggleScan">
				<text class="scan-icon" :class="{'scanning': isScanning}">{{isScanning ? '⏸' : '▶'}}</text>
				<text class="scan-text">{{isScanning ? '停止' : '扫描'}}</text>
			</view>
		</view>
		
		<!-- 扫描状态提示 -->
		<view v-if="isScanning" class="scanning-tip">
			<view class="scan-animation">
				<view class="scan-circle"></view>
				<view class="scan-circle delay-1"></view>
				<view class="scan-circle delay-2"></view>
			</view>
			<text class="scanning-text">正在搜索附近的设备...</text>
		</view>
		
		<!-- 设备列表 -->
		<view class="device-list" v-if="filteredDevices.length > 0">
			<view class="device-card" 
				v-for="(device, index) in filteredDevices" 
				:key="device.deviceId"
				@click="connectDevice(device, index)">
				
				<view class="device-info">
					<view class="device-name">
						<text class="name-text">{{device.name || '未知设备'}}</text>
						<view class="rssi-indicator" :class="getRssiClass(device.rssi)">
							<text class="rssi-text">{{getRssiLevel(device.rssi)}}</text>
						</view>
					</view>
					<text class="device-id">{{device.deviceId}}</text>
					<text class="device-rssi">信号强度: {{device.rssi}} dBm</text>
				</view>
				
				<view class="device-action">
					<text class="connect-icon">→</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!isScanning && blueDeviceList.length === 0" class="empty-state">
			<text class="empty-icon">📡</text>
			<text class="empty-text">暂无发现设备</text>
			<text class="empty-tip">点击上方扫描按钮开始搜索</text>
		</view>
		
		<!-- 搜索无结果 -->
		<view v-else-if="searchText && filteredDevices.length === 0" class="empty-state">
			<text class="empty-icon">🔍</text>
			<text class="empty-text">未找到匹配的设备</text>
			<text class="empty-tip">请尝试其他关键词</text>
		</view>
	</view>
</template>

<script>
var blueModule = uni.requireNativePlugin("XM-EspIdfModule")
const modal = uni.requireNativePlugin('modal');

export default {
	data() {
		return {
			blueDeviceList: [],
			filteredDevices: [],
			isScanning: false,
			searchText: '',
			connectingDevice: null
		}
	},
	onLoad() {
		this.startScan();
	},
	onUnload() {
		if (this.isScanning) {
			blueModule.stopBleScan();
		}
	},
	methods: {
		toggleScan() {
			if (this.isScanning) {
				this.stopScan();
			} else {
				this.startScan();
			}
		},
		
		startScan() {
			this.isScanning = true;
			this.blueDeviceList = [];
			this.filteredDevices = [];
			blueModule.startBleScan({
				securityType: 2,
				deviceNamePrefix: 'Lumi_'
			}, (ret) => {
				console.log(ret);
				if (ret.success && ret.msg == 'onPeripheralFound') {
					this.addOrUpdateDevice(ret.data);
				}
			});
			
			// 10秒后自动停止扫描
			setTimeout(() => {
				if (this.isScanning) {
					this.stopScan();
					uni.showToast({
						title: '扫描完成',
						icon: 'none'
					});
				}
			}, 10000);
		},
		
		stopScan() {
			this.isScanning = false;
			blueModule.stopBleScan();
		},
		
		addOrUpdateDevice(device) {
			const index = this.blueDeviceList.findIndex(d => d.deviceId === device.deviceId);
			if (index !== -1) {
				this.$set(this.blueDeviceList, index, device);
			} else {
				this.blueDeviceList.push(device);
			}
			this.filterDevices();
		},
		
		filterDevices() {
			if (!this.searchText) {
				this.filteredDevices = [...this.blueDeviceList];
			} else {
				const search = this.searchText.toLowerCase();
				this.filteredDevices = this.blueDeviceList.filter(device => {
					const name = (device.name || '').toLowerCase();
					const id = (device.deviceId || '').toLowerCase();
					return name.includes(search) || id.includes(search);
				});
			}
			
			// 按信号强度排序
			this.filteredDevices.sort((a, b) => b.rssi - a.rssi);
		},
		
		connectDevice(device, index) {
			if (this.connectingDevice) return;
			
			this.connectingDevice = device.deviceId;
			this.stopScan();
			
			uni.showLoading({
				title: '连接中...'
			});
			
			blueModule.connectDevice({
				mac: device.deviceId,
				serviceUuid: device.serviceUuid || ''
			}, (ret) => {
				console.log(ret);
				
				// 准备传递给device-config页面的连接信息
				const connectionResult = {
					timestamp: new Date().toLocaleString(),
					deviceInfo: {
						deviceId: device.deviceId,
						name: device.name || '未知设备',
						rssi: device.rssi,
						serviceUuid: device.serviceUuid
					},
					connectionResponse: ret,
					success: ret.success,
					message: ret.msg || '',
					rawData: ret
				};
				
				if (ret.success && ret.msg == 'EVENT_DEVICE_CONNECTED') {
					uni.hideLoading();
					
					// 将连接结果信息传递到device-config页面
					uni.navigateTo({
						url: `/pages/index/device-config?deviceId=${device.deviceId}&name=${encodeURIComponent(device.name || '未知设备')}&connectionResult=${encodeURIComponent(JSON.stringify(connectionResult))}`
					});
				} else if (!ret.success) {
					uni.hideLoading();
					
					// 即使连接失败，也可以传递错误信息到配置页面查看
					uni.showModal({
						title: '连接失败',
						content: '连接设备失败，是否查看详细错误信息？',
						showCancel: true,
						confirmText: '查看详情',
						cancelText: '重试',
						success: (modalRes) => {
							if (modalRes.confirm) {
								// 跳转到配置页面查看错误详情
								uni.navigateTo({
									url: `/pages/index/device-config?deviceId=${device.deviceId}&name=${encodeURIComponent(device.name || '未知设备')}&connectionResult=${encodeURIComponent(JSON.stringify(connectionResult))}`
								});
							}
						}
					});
				}
				
				this.connectingDevice = null;
			});
		},
		
		getRssiClass(rssi) {
			if (rssi >= -50) return 'strong';
			if (rssi >= -70) return 'medium';
			return 'weak';
		},
		
		getRssiLevel(rssi) {
			if (rssi >= -50) return '强';
			if (rssi >= -70) return '中';
			return '弱';
		}
	}
}
</script>

<style>
.device-list-container {
	min-height: 100vh;
	background-color: #f5f7fa;
}

/* 搜索栏样式 */
.search-header {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-box {
	flex: 1;
	display: flex;
	align-items: center;
	background-color: #f5f7fa;
	border-radius: 30rpx;
	padding: 0 30rpx;
	margin-right: 20rpx;
}

.search-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
}

.search-input {
	flex: 1;
	height: 70rpx;
	font-size: 28rpx;
	background: transparent;
	border: none;
}

.scan-button {
	display: flex;
	align-items: center;
	padding: 15rpx 30rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 30rpx;
	color: #fff;
}

.scan-icon {
	font-size: 28rpx;
	margin-right: 10rpx;
}

.scan-icon.scanning {
	animation: pulse 1s infinite;
}

.scan-text {
	font-size: 28rpx;
	color: #fff;
}

/* 扫描动画 */
.scanning-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 0;
}

.scan-animation {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 30rpx;
}

.scan-circle {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 3rpx solid #667eea;
	border-radius: 50%;
	animation: radar 2s infinite;
}

.delay-1 {
	animation-delay: 0.5s;
}

.delay-2 {
	animation-delay: 1s;
}

@keyframes radar {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}

@keyframes pulse {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
	100% {
		opacity: 1;
	}
}

.scanning-text {
	font-size: 28rpx;
	color: #666;
}

/* 设备列表样式 */
.device-list {
	padding: 20rpx;
}

.device-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.device-card:active {
	transform: scale(0.98);
	box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
}

.device-info {
	flex: 1;
}

.device-name {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
}

.name-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-right: 20rpx;
}

.rssi-indicator {
	padding: 5rpx 15rpx;
	border-radius: 15rpx;
	font-size: 22rpx;
}

.rssi-indicator.strong {
	background-color: #10b981;
	color: #fff;
}

.rssi-indicator.medium {
	background-color: #f59e0b;
	color: #fff;
}

.rssi-indicator.weak {
	background-color: #ef4444;
	color: #fff;
}

.rssi-text {
	font-size: 22rpx;
}

.device-id {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 5rpx;
}

.device-rssi {
	font-size: 24rpx;
	color: #666;
}

.device-action {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	background-color: #f5f7fa;
	border-radius: 50%;
}

.connect-icon {
	font-size: 28rpx;
	color: #667eea;
}

/* 空状态样式 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	font-size: 100rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.empty-tip {
	font-size: 28rpx;
	color: #999;
}
</style> 