<template>
	<view class="page-main">
		<view class="bluetooth-container">
			<!-- 蓝牙状态显示 -->
			<view class="status-section">
				<text class="section-title">蓝牙状态</text>
				<view class="status-item">
					<text>适配器状态：</text>
					<text :class="bluetoothState.available ? 'status-success' : 'status-error'">
						{{ bluetoothState.available ? '可用' : '不可用' }}
					</text>
				</view>
				<view class="status-item">
					<text>搜索状态：</text>
					<text :class="bluetoothState.discovering ? 'status-success' : 'status-normal'">
						{{ bluetoothState.discovering ? '搜索中' : '未搜索' }}
					</text>
				</view>
				<view class="status-item">
					<text>连接状态：</text>
					<text :class="connectedDevice ? 'status-success' : 'status-normal'">
						{{ connectedDevice ? `已连接 ${connectedDevice.name}` : '未连接' }}
					</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="button-section">
				<button @click="initBluetooth" :disabled="bluetoothState.available" class="btn-primary">
					初始化蓝牙
				</button>
				<button @click="startScan" :disabled="!bluetoothState.available || bluetoothState.discovering"
					class="btn-primary">
					{{ bluetoothState.discovering ? '搜索中...' : '开始扫描' }}
				</button>
				<button @click="stopScan" :disabled="!bluetoothState.discovering" class="btn-secondary">
					停止扫描
				</button>
				<button @click="closeBluetooth" :disabled="!bluetoothState.available" class="btn-danger">
					关闭蓝牙
				</button>
			</view>

			<!-- 设备列表 -->
			<view class="device-section">
				<text class="section-title">发现的设备</text>
				<view v-if="devices.length === 0" class="empty-tip">
					暂无发现设备，请先扫描
				</view>
				<view v-for="device in devices" :key="device.deviceId" class="device-item"
					@click="connectDevice(device)">
					<view class="device-info">
						<text class="device-name">{{ device.name || device.localName || '未知设备' }}</text>
						<text class="device-id">{{ device.deviceId }}</text>
						<text class="device-rssi">信号强度: {{ device.RSSI }}dBm</text>
					</view>
					<view class="device-status">
						<text v-if="connectedDevice && connectedDevice.deviceId === device.deviceId"
							class="connected">已连接</text>
						<text v-else class="connect-btn">点击连接</text>
					</view>
				</view>
			</view>

			<!-- 连接设备的服务和特征值 -->
			<view v-if="connectedDevice" class="service-section">
				<text class="section-title">设备服务</text>
				<view v-for="service in services" :key="service.uuid" class="service-item">
					<view class="service-header" @click="toggleService(service.uuid,service)">
						<text class="service-uuid">{{ service.uuid }}</text>
						<text class="toggle-icon">{{ expandedServices[service.uuid] ? '▼' : '▶' }}</text>
					</view>
					<view v-if="expandedServices[service.uuid]" class="characteristics-list">
						<view v-for="char in service.characteristics" :key="char.uuid" class="char-item">
							<view class="char-info">
								<text class="char-uuid">{{ char.uuid }}</text>
								<text class="char-properties">属性: {{ JSON.stringify(char.properties) }}</text>
							</view>
							<view class="char-operations">
								<button @click="readCharacteristic(service.uuid, char.uuid)"
									class="btn-small">读取</button>
								<button @click="showWriteDialog(service.uuid, char.uuid)" class="btn-small">写入</button>
								<button @click="toggleNotify(service.uuid, char.uuid)" class="btn-small">
									{{ char.notify ? '取消通知' : '开启通知' }}
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 数据显示区域 -->
			<view v-if="dataLogs.length > 0" class="data-section">
				<text class="section-title">数据日志</text>
				<view class="data-logs">
					<view v-for="(log, index) in dataLogs" :key="index" class="log-item">
						<text class="log-time">{{ log.time }}</text>
						<text class="log-type">{{ log.type }}</text>
						<text class="log-data">{{ log.data }}</text>
					</view>
				</view>
				<button @click="clearLogs" class="btn-secondary">清空日志</button>
			</view>
		</view>

		<!-- 写入数据对话框 -->
				<uni-popup ref="writeDialog" type="dialog">
			<view class="write-dialog">
				<text class="dialog-title">写入数据</text>
				<textarea v-model="writeData" placeholder="请输入要写入的数据（十六进制，如：48656C6C6F）" class="write-input"></textarea>
				<view class="dialog-buttons">
					<button @click="$refs.writeDialog.close()" class="btn-secondary">取消</button>
					<button @click="writeCharacteristic" class="btn-primary">写入</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bluetoothState: {
					available: false,
					discovering: false
				},
				devices: [], // 发现的设备列表
				connectedDevice: null, // 当前连接的设备
				services: [], // 设备服务列表
				expandedServices: {}, // 展开的服务
				dataLogs: [], // 数据日志
				writeData: '48656C6C6F', // 要写入的数据
				currentService: '', // 当前操作的服务
				currentCharacteristic: '' // 当前操作的特征值
			}
		},
		onLoad() {
			// 页面加载时自动初始化蓝牙
			this.initBluetooth();
		},
		onUnload() {
			// 页面卸载时清理资源
			this.cleanup();
		},
		methods: {
			// 初始化蓝牙适配器
			initBluetooth() {
				uni.showLoading({
					title: '初始化蓝牙...'
				});

				uni.openBluetoothAdapter({
					success: (res) => {
						console.log('蓝牙初始化成功', res);
						this.bluetoothState.available = true;
						this.getBluetoothAdapterState();
						this.addLog('系统', '蓝牙初始化成功');

						// 监听蓝牙适配器状态变化
						uni.onBluetoothAdapterStateChange((res) => {
							this.bluetoothState = res;
							this.addLog('状态', `蓝牙状态变化: 可用=${res.available}, 搜索中=${res.discovering}`);
						});

						// 监听设备发现
						uni.onBluetoothDeviceFound((res) => {
							res.devices.forEach(device => {
								// 避免重复添加设备
								const existIndex = this.devices.findIndex(d => d.deviceId ===
									device.deviceId);
								if (existIndex === -1 && device.name.includes('Lumi')) {
									console.log('device0000===', device)
									this.devices.push(device);
								} else {
									// 更新设备信息
									this.$set(this.devices, existIndex, device);
								}
							});
						});

						uni.hideLoading();
					},
					fail: (err) => {
						console.error('蓝牙初始化失败', err);
						uni.hideLoading();
						uni.showToast({
							title: `初始化失败: ${err.errMsg}`,
							icon: 'none'
						});
						this.addLog('错误', `蓝牙初始化失败: ${err.errMsg}`);
					}
				});
			},

			// 获取蓝牙适配器状态
			getBluetoothAdapterState() {
				uni.getBluetoothAdapterState({
					success: (res) => {
						this.bluetoothState = res;
					}
				});
			},

			// 开始扫描设备
			startScan() {
				if (!this.bluetoothState.available) {
					uni.showToast({
						title: '请先初始化蓝牙',
						icon: 'none'
					});
					return;
				}

				this.devices = []; // 清空设备列表

				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: false,
					success: (res) => {
						console.log('开始扫描设备', res);
						this.addLog('操作', '开始扫描蓝牙设备');
					},
					fail: (err) => {
						console.error('开始扫描失败', err);
						uni.showToast({
							title: `扫描失败: ${err.errMsg}`,
							icon: 'none'
						});
						this.addLog('错误', `扫描失败: ${err.errMsg}`);
					}
				});
			},

			// 停止扫描设备
			stopScan() {
				uni.stopBluetoothDevicesDiscovery({
					success: (res) => {
						console.log('停止扫描设备', res);
						this.addLog('操作', '停止扫描蓝牙设备');
					}
				});
			},

			// 连接设备
			connectDevice(device) {
				console.log('device----', device);
				if (this.connectedDevice && this.connectedDevice.deviceId === device.deviceId) {
					uni.showToast({
						title: '设备已连接',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '连接中...'
				});

				// 先断开之前的连接
				if (this.connectedDevice) {
					this.disconnectDevice();
				}

				uni.createBLEConnection({
					deviceId: device.deviceId,
					success: (res) => {
						console.log('连接设备成功', res);
						this.connectedDevice = device;
						this.addLog('连接', `成功连接设备: ${device.name || device.deviceId}`);

						// 连接成功后获取设备服务
						this.getBLEDeviceServices(device.deviceId);

						// 监听连接状态变化
						uni.onBLEConnectionStateChange((res) => {
							if (res.deviceId === device.deviceId) {
								if (res.connected) {
									this.addLog('状态', '设备连接状态: 已连接');
								} else {
									this.addLog('状态', '设备连接状态: 已断开');
									this.connectedDevice = null;
									this.services = [];
								}
							}
						});

						uni.hideLoading();
					},
					fail: (err) => {
						console.error('连接设备失败', err);
						uni.hideLoading();
						uni.showToast({
							title: `连接失败: ${err.errMsg}`,
							icon: 'none'
						});
						this.addLog('错误', `连接失败: ${err.errMsg}`);
					}
				});
			},

			// 断开设备连接
			disconnectDevice() {
				if (!this.connectedDevice) return;

				uni.closeBLEConnection({
					deviceId: this.connectedDevice.deviceId,
					success: (res) => {
						console.log('断开连接成功', res);
						this.addLog('连接', '设备连接已断开');
						this.connectedDevice = null;
						this.services = [];
					}
				});
			},

			// 获取设备服务
			getBLEDeviceServices(deviceId) {
				uni.getBLEDeviceServices({
					deviceId: deviceId,
					success: (res) => {
						console.log('获取设备服务成功', res);
						this.services = res.services;
						this.addLog('服务', `发现 ${res.services.length} 个服务`);

						// 为每个服务获取特征值
						res.services.forEach(service => {
							this.getBLEDeviceCharacteristics(deviceId, service.uuid);
						});
					},
					fail: (err) => {
						console.error('获取设备服务失败', err);
						this.addLog('错误', `获取服务失败: ${err.errMsg}`);
					}
				});
			},

			// 获取服务的特征值
			getBLEDeviceCharacteristics(deviceId, serviceId) {
				uni.getBLEDeviceCharacteristics({
					deviceId: deviceId,
					serviceId: serviceId,
					success: (res) => {
						console.log('获取特征值成功', res);

						// 更新服务的特征值
						const serviceIndex = this.services.findIndex(s => s.uuid === serviceId);
						if (serviceIndex !== -1) {
							// 为特征值添加通知状态
							const characteristics = res.characteristics.map(char => ({
								...char,
								notify: false
							}));
							this.$set(this.services[serviceIndex], 'characteristics', characteristics);
						}

						this.addLog('特征值', `服务 ${serviceId} 有 ${res.characteristics.length} 个特征值`);
					},
					fail: (err) => {
						console.error('获取特征值失败', err);
						this.addLog('错误', `获取特征值失败: ${err.errMsg}`);
					}
				});
			},

			// 切换服务展开状态
			toggleService(serviceId, service) {
				console.log('services---', this.services);
				console.log('service====', service);
				console.log('toggleService', serviceId);
				this.expandedServices[serviceId] = !this.expandedServices[serviceId];
				console.log('toggleService----', this.expandedServices);
				// this.$set(this.expandedServices, serviceId, !this.expandedServices[serviceId]);
			},

			// 读取特征值
			readCharacteristic(serviceId, characteristicId) {
				if (!this.connectedDevice) {
					uni.showToast({
						title: '请先连接设备',
						icon: 'none'
					});
					return;
				}

				uni.readBLECharacteristicValue({
					deviceId: this.connectedDevice.deviceId,
					serviceId: serviceId,
					characteristicId: characteristicId,
					success: (res) => {
						console.log('读取特征值成功', res);

						// 监听特征值变化
						uni.onBLECharacteristicValueChange((result) => {
							if (result.characteristicId === characteristicId) {
								const hexString = this.arrayBufferToHex(result.value);
								console.log('读取-----', result);
								console.log('读取', `${characteristicId}: ${hexString}`);
								this.addLog('读取', `${characteristicId}: ${hexString}`);
							}
						});

						uni.showToast({
							title: '读取成功',
							icon: 'success'
						});
					},
					fail: (err) => {
						console.error('读取特征值失败', err);
						uni.showToast({
							title: `读取失败: ${err.errMsg}`,
							icon: 'none'
						});
						this.addLog('错误', `读取失败: ${err.errMsg}`);
					}
				});
			},

			// 显示写入对话框
			showWriteDialog(serviceId, characteristicId) {
				this.currentService = serviceId;
				this.currentCharacteristic = characteristicId;
				this.writeData = '';
				this.$refs.writeDialog.open();
			},

			// 写入特征值
			writeCharacteristic() {
				if (!this.connectedDevice) {
					uni.showToast({
						title: '请先连接设备',
						icon: 'none'
					});
					return;
				}

				if (!this.writeData.trim()) {
					uni.showToast({
						title: '请输入要写入的数据',
						icon: 'none'
					});
					return;
				}

				try {
					const buffer = this.hexToArrayBuffer(this.writeData);

					uni.writeBLECharacteristicValue({
						deviceId: this.connectedDevice.deviceId,
						serviceId: this.currentService,
						characteristicId: this.currentCharacteristic,
						value: buffer,
						success: (res) => {
							console.log('写入特征值成功', res);
							this.addLog('写入', `${this.currentCharacteristic}: ${this.writeData}`);
							uni.showToast({
								title: '写入成功',
								icon: 'success'
							});
							this.$refs.writeDialog.close();
						},
						fail: (err) => {
							console.error('写入特征值失败', err);
							uni.showToast({
								title: `写入失败: ${err.errMsg}`,
								icon: 'none'
							});
							this.addLog('错误', `写入失败: ${err.errMsg}`);
						}
					});
				} catch (error) {
					uni.showToast({
						title: '数据格式错误',
						icon: 'none'
					});
				}
			},

			// 切换通知状态
			toggleNotify(serviceId, characteristicId) {
				if (!this.connectedDevice) {
					uni.showToast({
						title: '请先连接设备',
						icon: 'none'
					});
					return;
				}

				// 找到对应的特征值
				const service = this.services.find(s => s.uuid === serviceId);
				const characteristic = service?.characteristics?.find(c => c.uuid === characteristicId);

				if (!characteristic) return;

				const enable = !characteristic.notify;

				uni.notifyBLECharacteristicValueChange({
					deviceId: this.connectedDevice.deviceId,
					serviceId: serviceId,
					characteristicId: characteristicId,
					state: enable,
					success: (res) => {
						console.log('通知状态切换成功', res);
						characteristic.notify = enable;

						if (enable) {
							// 监听特征值变化
							uni.onBLECharacteristicValueChange((result) => {
								if (result.characteristicId === characteristicId) {
									const hexString = this.arrayBufferToHex(result.value);
									this.addLog('通知', `${characteristicId}: ${hexString}`);
								}
							});
						}

						this.addLog('通知', `${characteristicId} 通知${enable ? '开启' : '关闭'}`);
						uni.showToast({
							title: `通知${enable ? '开启' : '关闭'}成功`,
							icon: 'success'
						});
					},
					fail: (err) => {
						console.error('通知状态切换失败', err);
						uni.showToast({
							title: `操作失败: ${err.errMsg}`,
							icon: 'none'
						});
						this.addLog('错误', `通知操作失败: ${err.errMsg}`);
					}
				});
			},

			// 关闭蓝牙
			closeBluetooth() {
				this.cleanup();

				uni.closeBluetoothAdapter({
					success: (res) => {
						console.log('关闭蓝牙成功', res);
						this.bluetoothState.available = false;
						this.bluetoothState.discovering = false;
						this.devices = [];
						this.connectedDevice = null;
						this.services = [];
						this.addLog('系统', '蓝牙已关闭');
					}
				});
			},

			// 清理资源
			cleanup() {
				// 停止扫描
				if (this.bluetoothState.discovering) {
					uni.stopBluetoothDevicesDiscovery();
				}

				// 断开连接
				if (this.connectedDevice) {
					uni.closeBLEConnection({
						deviceId: this.connectedDevice.deviceId
					});
				}
			},

			// 添加日志
			addLog(type, data) {
				const now = new Date();
				const time =
					`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

				this.dataLogs.unshift({
					time: time,
					type: type,
					data: data
				});

				// 限制日志数量
				if (this.dataLogs.length > 100) {
					this.dataLogs = this.dataLogs.slice(0, 100);
				}
			},

			// 清空日志
			clearLogs() {
				this.dataLogs = [];
			},

			// ArrayBuffer转十六进制字符串
			arrayBufferToHex(buffer) {
				return Array.prototype.map.call(
					new Uint8Array(buffer),
					x => ('00' + x.toString(16)).slice(-2)
				).join('');
			},

			// 十六进制字符串转ArrayBuffer
			hexToArrayBuffer(hex) {
				const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
				const buffer = new ArrayBuffer(cleanHex.length / 2);
				const view = new Uint8Array(buffer);

				for (let i = 0; i < cleanHex.length; i += 2) {
					view[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
				}

				return buffer;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-main {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.bluetooth-container {
		background-color: white;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.status-section {
		margin-bottom: 40rpx;

		.status-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15rpx 0;
			border-bottom: 1rpx solid #eee;

			&:last-child {
				border-bottom: none;
			}
		}

		.status-success {
			color: #67C23A;
		}

		.status-error {
			color: #F56C6C;
		}

		.status-normal {
			color: #909399;
		}
	}

	.button-section {
		margin-bottom: 40rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		button {
			flex: 1;
			min-width: 200rpx;
			height: 80rpx;
			border-radius: 40rpx;
			border: none;
			font-size: 28rpx;

			&.btn-primary {
				background-color: #409EFF;
				color: white;

				&[disabled] {
					background-color: #C0C4CC;
				}
			}

			&.btn-secondary {
				background-color: #909399;
				color: white;

				&[disabled] {
					background-color: #C0C4CC;
				}
			}

			&.btn-danger {
				background-color: #F56C6C;
				color: white;

				&[disabled] {
					background-color: #C0C4CC;
				}
			}
		}
	}

	.device-section {
		margin-bottom: 40rpx;

		.empty-tip {
			text-align: center;
			color: #909399;
			padding: 40rpx 0;
		}

		.device-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			margin-bottom: 15rpx;
			background-color: #f8f9fa;
			border-radius: 12rpx;
			border: 2rpx solid transparent;

			&:active {
				border-color: #409EFF;
			}
		}

		.device-info {
			flex: 1;

			.device-name {
				display: block;
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 8rpx;
			}

			.device-id {
				display: block;
				font-size: 24rpx;
				color: #666;
				margin-bottom: 8rpx;
			}

			.device-rssi {
				display: block;
				font-size: 24rpx;
				color: #999;
			}
		}

		.device-status {
			.connected {
				color: #67C23A;
				font-size: 24rpx;
			}

			.connect-btn {
				color: #409EFF;
				font-size: 24rpx;
			}
		}
	}

	.service-section {
		margin-bottom: 40rpx;

		.service-item {
			margin-bottom: 20rpx;
			border: 2rpx solid #eee;
			border-radius: 12rpx;
		}

		.service-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			background-color: #f8f9fa;
			border-radius: 12rpx;

			.service-uuid {
				font-size: 26rpx;
				color: #333;
				flex: 1;
			}

			.toggle-icon {
				font-size: 24rpx;
				color: #666;
			}
		}

		.characteristics-list {
			padding: 0 20rpx 20rpx;
		}

		.char-item {
			padding: 15rpx;
			margin-bottom: 15rpx;
			background-color: #f5f5f5;
			border-radius: 8rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.char-info {
			margin-bottom: 15rpx;

			.char-uuid {
				display: block;
				font-size: 24rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.char-properties {
				display: block;
				font-size: 22rpx;
				color: #666;
			}
		}

		.char-operations {
			display: flex;
			gap: 10rpx;

			.btn-small {
				padding: 8rpx 16rpx;
				font-size: 22rpx;
				height: auto;
				line-height: 1.2;
				background-color: #409EFF;
				color: white;
				border: none;
				border-radius: 6rpx;
			}
		}
	}

	.data-section {
		.data-logs {
			max-height: 600rpx;
			overflow-y: auto;
			border: 2rpx solid #eee;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
		}

		.log-item {
			display: flex;
			align-items: center;
			padding: 15rpx;
			border-bottom: 1rpx solid #eee;
			gap: 20rpx;

			&:last-child {
				border-bottom: none;
			}

			.log-time {
				font-size: 22rpx;
				color: #999;
				min-width: 100rpx;
			}

			.log-type {
				font-size: 22rpx;
				color: #409EFF;
				min-width: 80rpx;
			}

			.log-data {
				font-size: 24rpx;
				color: #333;
				flex: 1;
				word-break: break-all;
			}
		}
	}

	.write-dialog {
		padding: 40rpx;

		.dialog-title {
			display: block;
			font-size: 32rpx;
			font-weight: bold;
			text-align: center;
			margin-bottom: 30rpx;
		}

		.write-input {
			width: 100%;
			height: 200rpx;
			border: 2rpx solid #eee;
			border-radius: 12rpx;
			padding: 20rpx;
			font-size: 28rpx;
			margin-bottom: 30rpx;
			box-sizing: border-box;
		}

		.dialog-buttons {
			display: flex;
			gap: 20rpx;

			button {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				border: none;
				font-size: 28rpx;
			}
		}
	}
</style>