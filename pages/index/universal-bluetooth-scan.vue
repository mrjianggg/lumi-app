<template>
	<view class="container">
		<view class="header">
			<text class="title">蓝牙设备扫描</text>
		</view>
		
		<view class="controls">
			<button class="scan-btn" @click="toggleScan" :disabled="!bluetoothAvailable">
				{{isScanning ? '停止扫描' : '开始扫描'}}
			</button>
		</view>
		
		<view class="status">
			<text>蓝牙状态: {{bluetoothAvailable ? '已开启' : '未开启'}}</text>
			<text>扫描状态: {{isScanning ? '扫描中' : '已停止'}}</text>
			<text>发现设备: {{allDevices.length}} 个</text>
		</view>
		
		<view class="device-list" v-if="allDevices.length > 0">
			<view class="device-item" 
				v-for="device in allDevices" 
				:key="device.deviceId"
				@click="selectDevice(device)">
				<text class="device-name">{{device.name || device.localName || '未知设备'}}</text>
				<text class="device-id">{{device.deviceId}}</text>
				<text class="device-rssi">信号: {{device.RSSI}} dBm</text>
			</view>
		</view>
		
		<view class="debug-section">
			<text class="debug-title">调试日志:</text>
			<textarea class="debug-log" v-model="debugLog" disabled></textarea>
			<button class="clear-btn" @click="clearLog">清空日志</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			allDevices: [],
			isScanning: false,
			bluetoothAvailable: false,
			debugLog: ''
		}
	},
	onLoad() {
		this.addLog('页面加载完成');
		this.initBluetooth();
	},
	onUnload() {
		this.addLog('页面卸载');
		this.stopScan();
		this.closeBluetooth();
	},
	methods: {
		addLog(message) {
			const time = new Date().toLocaleTimeString();
			this.debugLog += `[${time}] ${message}\n`;
			console.log(message);
		},
		
		initBluetooth() {
			this.addLog('开始初始化蓝牙适配器...');
			
			uni.openBluetoothAdapter({
				success: (res) => {
					this.addLog('蓝牙适配器初始化成功');
					this.bluetoothAvailable = true;
				},
				fail: (err) => {
					this.addLog('蓝牙适配器初始化失败: ' + JSON.stringify(err));
					uni.showModal({
						title: '蓝牙初始化失败',
						content: '请确保蓝牙已开启并授予应用蓝牙权限',
						showCancel: false
					});
				}
			});
		},
		
		closeBluetooth() {
			if (this.bluetoothAvailable) {
				uni.closeBluetoothAdapter({
					success: () => {
						this.addLog('蓝牙适配器已关闭');
					}
				});
			}
		},
		
		toggleScan() {
			this.addLog('点击了扫描按钮');
			if (this.isScanning) {
				this.stopScan();
			} else {
				this.startScan();
			}
		},
		
		startScan() {
			if (!this.bluetoothAvailable) {
				this.addLog('蓝牙未可用，重新初始化');
				this.initBluetooth();
				return;
			}
			
			this.addLog('开始扫描蓝牙设备...');
			this.isScanning = true;
			this.allDevices = [];
			
			// 监听设备发现事件
			uni.onBluetoothDeviceFound((res) => {
				this.addLog('发现设备: ' + JSON.stringify(res));
				res.devices.forEach(device => {
					if (device.name || device.localName) {
						const exists = this.allDevices.find(d => d.deviceId === device.deviceId);
						if (!exists) {
							this.allDevices.push(device);
							this.addLog(`新设备: ${device.name || device.localName}`);
						}
					}
				});
			});
			
			// 开始扫描
			uni.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: false,
				success: (res) => {
					this.addLog('开始扫描成功');
				},
				fail: (err) => {
					this.addLog('开始扫描失败: ' + JSON.stringify(err));
					this.isScanning = false;
				}
			});
		},
		
		stopScan() {
			if (!this.isScanning) return;
			
			this.addLog('停止扫描蓝牙设备...');
			this.isScanning = false;
			
			uni.stopBluetoothDevicesDiscovery({
				success: (res) => {
					this.addLog('停止扫描成功');
				},
				fail: (err) => {
					this.addLog('停止扫描失败: ' + JSON.stringify(err));
				}
			});
		},
		
		clearLog() {
			this.debugLog = '';
		},
		
		selectDevice(device) {
			this.addLog(`点击选择设备: ${device.name || device.localName} (${device.deviceId})`);
			
			uni.showModal({
				title: '设备信息',
				content: `设备名称: ${device.name || device.localName || '未知设备'}\n设备ID: ${device.deviceId}\n信号强度: ${device.RSSI} dBm`,
				showCancel: true,
				cancelText: '取消',
				confirmText: '连接',
				success: (res) => {
					if (res.confirm) {
						this.connectToDevice(device);
					} else {
						this.addLog('用户取消了连接');
					}
				}
			});
		},
		
		connectToDevice(device) {
			this.addLog(`尝试连接设备: ${device.name || device.localName}`);
			
			// 根据设备类型选择不同的连接方式
			if (device.name && device.name.startsWith('PROV_')) {
				// 如果是 PROV 设备，跳转到 ESP 配网页面
				this.addLog('检测到ESP设备，跳转到配网页面');
				uni.navigateTo({
					url: `/pages/index/device-config?deviceId=${device.deviceId}&name=${device.name}`,
					success: () => {
						this.addLog('成功跳转到配网页面');
					},
					fail: (err) => {
						this.addLog('跳转配网页面失败: ' + JSON.stringify(err));
					}
				});
			} else if (device.name && device.name.startsWith('Lumi_')) {
				// Lumi 设备的处理
				this.addLog('检测到Lumi设备，开始连接...');
				this.connectToLumiDevice(device);
			} else {
				// 其他设备
				this.addLog('未知设备类型，暂不支持连接');
				uni.showToast({
					title: '该设备类型暂不支持连接',
					icon: 'none',
					duration: 2000
				});
			}
		},
		
		connectToLumiDevice(device) {
			this.addLog(`开始连接Lumi设备: ${device.name}`);
			
			// 创建BLE连接
			uni.createBLEConnection({
				deviceId: device.deviceId,
				success: (res) => {
					this.addLog('BLE连接成功: ' + JSON.stringify(res));
					uni.showToast({
						title: '连接成功',
						icon: 'success'
					});
					
					// 获取服务
					this.getBLEDeviceServices(device);
				},
				fail: (err) => {
					this.addLog('BLE连接失败: ' + JSON.stringify(err));
					uni.showModal({
						title: '连接失败',
						content: '无法连接到设备，请确保设备在范围内且未被其他应用连接',
						showCancel: false
					});
				}
			});
		},
		
		getBLEDeviceServices(device) {
			this.addLog(`获取设备服务: ${device.deviceId}`);
			
			uni.getBLEDeviceServices({
				deviceId: device.deviceId,
				success: (res) => {
					this.addLog('获取服务成功: ' + JSON.stringify(res));
					
					// 准备传递给device-config页面的连接信息
					const connectionInfo = {
						deviceId: device.deviceId,
						deviceName: device.name || device.localName,
						connectionResult: {
							success: true,
							rssi: device.RSSI,
							services: res.services || [],
							connectionTime: new Date().toLocaleString()
						}
					};
					
					this.addLog('准备跳转到配置页面，传递连接信息');
					
					// 跳转到device-config页面，并传递连接信息
					uni.navigateTo({
						url: `/pages/index/device-config?deviceId=${device.deviceId}&name=${encodeURIComponent(device.name || device.localName)}&connectionInfo=${encodeURIComponent(JSON.stringify(connectionInfo.connectionResult))}`,
						success: () => {
							this.addLog('成功跳转到设备配置页面');
						},
						fail: (err) => {
							this.addLog('跳转设备配置页面失败: ' + JSON.stringify(err));
							
							// 如果跳转失败，显示服务信息
							if (res.services && res.services.length > 0) {
								const serviceList = res.services.map(service => service.uuid).join('\n');
								uni.showModal({
									title: '设备服务',
									content: `发现 ${res.services.length} 个服务:\n${serviceList}`,
									showCancel: false,
									confirmText: '确定'
								});
							}
						}
					});
				},
				fail: (err) => {
					this.addLog('获取服务失败: ' + JSON.stringify(err));
					
					// 即使获取服务失败，也尝试跳转到配置页面
					const connectionInfo = {
						success: true,
						rssi: device.RSSI,
						services: [],
						connectionTime: new Date().toLocaleString(),
						error: err
					};
					
					uni.navigateTo({
						url: `/pages/index/device-config?deviceId=${device.deviceId}&name=${encodeURIComponent(device.name || device.localName)}&connectionInfo=${encodeURIComponent(JSON.stringify(connectionInfo))}`,
						success: () => {
							this.addLog('成功跳转到设备配置页面（服务获取失败）');
						},
						fail: (jumpErr) => {
							this.addLog('跳转设备配置页面失败: ' + JSON.stringify(jumpErr));
							uni.showModal({
								title: '获取服务失败',
								content: '无法获取设备服务信息: ' + (err.errMsg || '未知错误'),
								showCancel: false
							});
						}
					});
				}
			});
		}
	}
}
</script>

<style>
.container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	text-align: center;
	margin-bottom: 30rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.controls {
	margin-bottom: 30rpx;
}

.scan-btn {
	width: 100%;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 10rpx;
	padding: 20rpx;
	font-size: 32rpx;
}

.scan-btn:disabled {
	background-color: #ccc;
}

.status {
	background-color: white;
	padding: 20rpx;
	border-radius: 10rpx;
	margin-bottom: 30rpx;
}

.status text {
	display: block;
	margin-bottom: 10rpx;
	font-size: 28rpx;
}

.device-list {
	background-color: white;
	border-radius: 10rpx;
	margin-bottom: 30rpx;
}

.device-item {
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
}

.device-item:last-child {
	border-bottom: none;
}

.device-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 5rpx;
}

.device-id {
	font-size: 24rpx;
	color: #666;
	display: block;
	margin-bottom: 5rpx;
}

.device-rssi {
	font-size: 24rpx;
	color: #999;
	display: block;
}

.debug-section {
	background-color: white;
	padding: 20rpx;
	border-radius: 10rpx;
}

.debug-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.debug-log {
	width: 100%;
	height: 300rpx;
	border: 1rpx solid #ddd;
	border-radius: 5rpx;
	padding: 10rpx;
	font-size: 24rpx;
	background-color: #f9f9f9;
	margin-bottom: 10rpx;
}

.clear-btn {
	background-color: #ff3b30;
	color: white;
	border: none;
	border-radius: 5rpx;
	padding: 10rpx 20rpx;
	font-size: 24rpx;
}
</style> 