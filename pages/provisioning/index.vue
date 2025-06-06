<template>
	<view class="provisioning-container">
		<!-- 返回按钮 -->
		<head-return v-if="currentStage === 'checking'" :toPage="0" title=""></head-return>

		<view class="page-header" v-else>
			<image @click="goBack" src="/static/icon/head-return.svg" mode="widthFix" class="page-header-back"></image>
			<view class="page-header-title">
			<text>{{ title }}</text>
			</view>
			<view class="page-header-back"></view>
		</view>
		
		
		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 通用阶段显示 -->
			<view v-if="currentStage !== 'wifiConfig'" class="common-stage">
				<text class="stage-title">{{getStageTitle()}}</text>
				
				<!-- 统一的状态列表 -->
				<view class="status-list">
					<view 
						v-for="(step, index) in statusSteps" 
						:key="index"
						class="status-item" 
						:class="getStepClass(index)"
					>
						<view class="status-icon">
							<view v-if="getStepClass(index) === 'active'" class="loading-icon"></view>
							<text v-else>{{getStepIcon(index)}}</text>
						</view>
						<view class="status-text-container">
							<text class="status-text">{{step.text}}</text>
							<!-- 权限检查步骤显示详细信息 -->
							<text v-if="index === 0" class="status-detail">{{getPermissionDetailText()}}</text>
						</view>
						<view @click="checkPermissionsAndNetwork" v-if="index === 0 && getStepClass(index) === 'error'">
							<text>重试</text>
						</view>
					</view>
				</view>
				
				<!-- 发现设备弹窗 -->
				<view v-if="currentStage === 'deviceFound'" class="device-modal">
					<view class="modal-content">
						<text class="modal-title">附近设备</text>
						<view class="close-button" @click="closeModal">×</view>
						
						<view class="device-info">
							<view class="device-avatar">
								<text class="device-emoji">🐑</text>
							</view>
							<text class="device-name">{{foundDevice.name}}</text>
						</view>
						
						<view class="modal-buttons">
							<button class="modal-btn cancel-btn" @click="closeModal">忽略设备</button>
							<button class="modal-btn confirm-btn" @click="connectDevice">开始绑定</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 阶段4: WiFi配置 -->
			<view v-if="currentStage === 'wifiConfig'" class="wifi-config-stage">
				<text class="stage-title">设置{{foundDevice.name}}的Wi-Fi</text>
				
				<!-- WiFi图标 -->
				<view class="wifi-icon-container">
					<view class="wifi-icon">
						<view class="wifi-signal"></view>
						<view class="wifi-signal"></view>
						<view class="wifi-signal"></view>
						<view class="wifi-dot"></view>
					</view>
				</view>
				
				<!-- WiFi名称输入 -->
				<view class="wifi-input-section">
					<text class="input-label">手动输入Wi-Fi名字</text>
					<view class="wifi-input-container">
						<input 
							class="wifi-input" 
							v-model="wifiName" 
							placeholder="请输入Wi-Fi名称"
							@focus="showWifiList = false"
						/>
					</view>
				</view>
				
				<!-- 密码输入 -->
				<view class="password-input-section">
					<text class="input-label">输入密码</text>
					<view class="password-input-container">
						<input 
							class="password-input" 
							v-model="wifiPassword" 
							:type="passwordVisible ? 'text' : 'password'"
							placeholder="请输入密码"
						/>
						<view class="password-toggle" @click="togglePasswordVisible">
							<text class="password-icon">{{passwordVisible ? '🙈' : '👁'}}</text>
						</view>
					</view>
				</view>
				
				<!-- WiFi列表 -->
				<view class="wifi-list-section">
					<view class="wifi-list-header" @click="toggleWifiList">
						<text class="list-title">Wi-Fi 列表</text>
						<view class="refresh-button" @click="scanWifiNetworks">
							<text class="refresh-icon">🔄</text>
						</view>
					</view>
					
					<view v-if="showWifiList" class="wifi-list">
						<view 
							v-for="(wifi, index) in wifiList" 
							:key="index"
							class="wifi-item"
							@click="selectWifi(wifi)"
						>
							<text class="wifi-name">{{wifi.ssid}}</text>
							<view class="wifi-signal-strength">
								<text class="signal-icon">📶</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 连接按钮 -->
				<button class="connect-wifi-btn" @click="startDoProvisioning" :disabled="!wifiName || !wifiPassword">
					连接 Wi-Fi
				</button>
			</view>
		</view>
	</view>
</template>

<script>
var blueModule = uni.requireNativePlugin("XM-EspIdfModule2")

export default {
	data() {
		return {
			currentStage: 'checking', // checking, scanning, deviceFound, setingPop, wifiConfig, provisioning
			scanningActive: true,
			setPopActive: true,
			foundDevice: {
				name: 'Namyvera',
				deviceId: '',
				rssi: -45
			},
			wifiName: '',
			wifiPassword: '',
			wifiList: [],
			showWifiList: true,
			passwordVisible: false,
			isConnecting: false,
			wifiScanRetryCount: 0,
			maxRetryCount: 3,
			// 添加步骤历史记录
			stepHistory: ['checking'],
			// 蓝牙和网络状态检查
			permissionStatus: {
				bluetooth: false,        // 蓝牙开启状态
				network: false,         // 网络连接状态
				wifi: false,           // WiFi功能状态
				checking: true         // 是否正在检查中
			},
			// 状态步骤定义
			statusSteps: [
				{ text: '蓝牙开启及WiFi连接检查' },
				{ text: '正在扫描 BubblePal 蓝牙信号' },
				{ text: '设置安全密钥 (POP)' },
				{ text: '扫描 BubblePal wifi 信号' },
				{ text: '手机连接 BubblePal' },
				{ text: '用户输入 wifi 密码' },
				{ text: '推送 WiFi 配置至 BubblePal' },
				{ text: '等待 BubblePal 配对' }
			]
		}
	},
	onLoad(options) {
		// 首先检查蓝牙和网络状态
		this.checkPermissionsAndNetwork();
	},
	onUnload() {
		if (blueModule) {
			blueModule.stopBleScan();
		}
	},
	methods: {
		// 检查权限和网络状态
		async checkPermissionsAndNetwork() {
			this.permissionStatus.checking = true;
			
			// 添加超时机制，避免无限加载
			const checkTimeout = setTimeout(() => {
				console.log('蓝牙和网络检查超时，设置为失败状态');
				this.permissionStatus.checking = false;
				this.permissionStatus.bluetooth = false;
				this.permissionStatus.network = false;
				this.permissionStatus.wifi = false;
				this.showPermissionError();
			}, 10000); // 10秒超时
			
			try {
				// 并行检查所有状态
				const [bluetoothResult, networkResult, wifiResult] = await Promise.allSettled([
					this.checkBluetoothPermission(),
					this.checkNetworkStatus(),
					this.checkWifiStatus()
				]);
				
				// 清除超时定时器
				clearTimeout(checkTimeout);
				
				this.permissionStatus.bluetooth = bluetoothResult.status === 'fulfilled' ? bluetoothResult.value : false;
				this.permissionStatus.network = networkResult.status === 'fulfilled' ? networkResult.value : false;
				this.permissionStatus.wifi = wifiResult.status === 'fulfilled' ? wifiResult.value : false;
				this.permissionStatus.checking = false;
				
				console.log('蓝牙和网络检查结果:', {
					bluetooth: this.permissionStatus.bluetooth,
					network: this.permissionStatus.network,
					wifi: this.permissionStatus.wifi
				});
				
				// 检查完成后，如果所有状态都正常，自动开始扫描
				const allOk = this.isPermissionAllOk();
				console.log('所有状态是否通过:', allOk);
				
				if (allOk) {
					console.log('✅ 所有状态检查通过，1秒后开始扫描蓝牙');
					setTimeout(() => {
						this.currentStage = 'scanning';
						this.pushStep('scanning');
						this.startScanningProcess();
					}, 1000);
				} else {
					// 状态检查失败，显示详细错误信息
					console.log('❌ 状态检查失败，显示错误信息');
					this.showPermissionError();
				}
			} catch (error) {
				clearTimeout(checkTimeout);
				console.error('蓝牙和网络检查异常:', error);
				this.permissionStatus.checking = false;
				this.permissionStatus.bluetooth = false;
				this.permissionStatus.network = false;
				this.permissionStatus.wifi = false;
				uni.showToast({
					title: '状态检查失败',
					icon: 'none'
				});
			}
		},
		
		// 检查蓝牙状态
		checkBluetoothPermission() {
			return new Promise((resolve) => {
				console.log('检查蓝牙是否开启...');
				
				// 设置超时
				const timeout = setTimeout(() => {
					console.log('蓝牙检查超时');
					resolve(false);
				}, 5000);
				
				// 尝试初始化蓝牙适配器
				uni.openBluetoothAdapter({
					success: (res) => {
						console.log('蓝牙适配器初始化成功');
						// 获取蓝牙状态
						uni.getBluetoothAdapterState({
							success: (stateRes) => {
								clearTimeout(timeout);
								console.log('蓝牙状态:', stateRes);
								// 检查蓝牙是否可用且已开启
								if (stateRes.available && stateRes.discovering !== undefined) {
									console.log('✅ 蓝牙已开启');
									resolve(true);
								} else {
									console.log('❌ 蓝牙未开启');
									resolve(false);
								}
							},
							fail: (err) => {
								clearTimeout(timeout);
								console.log('获取蓝牙状态失败:', err);
								resolve(false);
							}
						});
					},
					fail: (err) => {
						clearTimeout(timeout);
						console.log('蓝牙适配器初始化失败:', err);
						// 错误码10001表示蓝牙未打开
						if (err.errCode === 10001) {
							console.log('❌ 蓝牙未打开');
						}
						resolve(false);
					}
				});
			});
		},
		
		// 检查网络状态
		checkNetworkStatus() {
			return new Promise((resolve) => {
				console.log('检查网络连接...');
				
				uni.getNetworkType({
					success: (res) => {
						console.log('网络类型:', res.networkType);
						if (res.networkType !== 'none' && res.networkType !== 'unknown') {
							console.log('✅ 网络已连接');
							resolve(true);
						} else {
							console.log('❌ 网络未连接');
							resolve(false);
						}
					},
					fail: (err) => {
						console.log('获取网络状态失败:', err);
						resolve(false);
					}
				});
			});
		},
		
		// 检查WiFi功能状态
		checkWifiStatus() {
			return new Promise((resolve) => {
				console.log('检查WiFi是否开启...');
				
				uni.getNetworkType({
					success: (res) => {
						console.log('当前网络类型:', res.networkType);
						// 检查网络类型是否为WiFi
						if (res.networkType === 'wifi') {
							console.log('✅ WiFi已开启');
							resolve(true);
						} else if (res.networkType === 'none') {
							console.log('❌ 无网络连接');
							resolve(false);
						} else {
							console.log('❌ WiFi未开启 (当前使用:', res.networkType + ')');
							resolve(false);
						}
					},
					fail: (err) => {
						console.log('获取网络类型失败:', err);
						resolve(false);
					}
				});
			});
		},
		
		// 检查所有状态是否都正常
		isPermissionAllOk() {
			return this.permissionStatus.bluetooth && 
				   this.permissionStatus.network && 
				   this.permissionStatus.wifi;
		},
		
		// 显示状态错误详情
		showPermissionError() {
			let errorMessages = [];
			
			if (!this.permissionStatus.bluetooth) {
				errorMessages.push('蓝牙未开启');
			}
			if (!this.permissionStatus.network) {
				errorMessages.push('网络未连接');
			}
			if (!this.permissionStatus.wifi) {
				errorMessages.push('WiFi未开启');
			}

		},
		
		// 获取阶段标题
		getStageTitle() {
			const titles = {
				'checking': '正在检查系统状态',
				'scanning': '正在扫描蓝牙信号',
				'deviceFound': '正在扫描蓝牙信号',
				'setingPop': '正在扫描蓝牙信号',
				'provisioning': `等待${this.foundDevice.name}配对`
			};
			return titles[this.currentStage] || '正在处理...';
		},
		
		// 获取步骤样式类
		getStepClass(stepIndex) {
			// 特殊处理第0步（权限检查）
			if (stepIndex === 0) {
				if (this.permissionStatus.checking) {
					return 'active';
				} else if (this.isPermissionAllOk()) {
					return 'completed';
				} else {
					return 'error';
				}
			}
			
			const stageStepMap = {
				'checking': 0,      // 第0步进行中（权限检查）
				'scanning': 1,      // 第1步进行中
				'deviceFound': 1,   // 第1步完成
				'setingPop': 2,     // 第2步进行中
				'provisioning': 7   // 第7步完成，全部完成
			};
			
			const currentStep = stageStepMap[this.currentStage];
			
			if (stepIndex < currentStep) {
				return 'completed';
			} else if (stepIndex === currentStep) {
				// 特殊处理：如果是scanning阶段且scanningActive为true，或者setingPop阶段且setPopActive为true
				if ((this.currentStage === 'scanning' && stepIndex === 1 && this.scanningActive) ||
					(this.currentStage === 'setingPop' && stepIndex === 2 && this.setPopActive)) {
					return 'active';
				}
				return this.currentStage === 'provisioning' ? 'completed' : 'active';
			} else if (this.currentStage === 'provisioning') {
				return 'completed'; // 配网阶段所有步骤都显示完成
			}
			return '';
		},
		
		// 获取步骤图标
		getStepIcon(stepIndex) {
			const stepClass = this.getStepClass(stepIndex);
			if (stepClass === 'completed') {
				return '✓';
			} else if (stepClass === 'error') {
				return '✗';
			}
			return '○';
		},
		
		// 获取权限检查的详细文本
		getPermissionDetailText() {
			if (this.permissionStatus.checking) {
				return '正在检查蓝牙和网络状态...';
			}
			
			let details = [];
			
			// 蓝牙状态简化显示
			if (this.permissionStatus.bluetooth) {
				details.push('蓝牙✓');
			} else {
				details.push('蓝牙✗(未开启)');
			}
			
			// 网络状态
			if (this.permissionStatus.network) details.push('网络✓');
			else details.push('网络✗(未连接)');
			
			// WiFi状态
			if (this.permissionStatus.wifi) details.push('WiFi✓');
			else details.push('WiFi✗(未开启)');
			
			return details.join(' ');
		},

		// 开始扫描蓝牙
		startScanningProcess() {
			console.log('准备开始蓝牙扫描...');
			console.log('当前状态:', {
				bluetooth: this.permissionStatus.bluetooth,
				network: this.permissionStatus.network,
				wifi: this.permissionStatus.wifi,
				checking: this.permissionStatus.checking
			});
			
			// 只有在状态检查通过后才能开始扫描
			if (!this.isPermissionAllOk()) {
				console.log('❌ 状态检查未通过，无法开始扫描');
				uni.showToast({
					title: '请先完成状态检查',
					icon: 'none'
				});
				return;
			}
			
			console.log('✅ 开始蓝牙扫描流程');
			this.scanningActive = true;
			console.log('blueModule111===',blueModule);
			if (blueModule) {
				console.log('blueModule===',blueModule);
				blueModule.startBleScan({
					securityType: 2,
					deviceNamePrefix: 'Lumi_'
				}, (ret) => {
					console.log('蓝牙扫描结果ret:',ret)
					if (ret.success && ret.msg == 'onPeripheralFound') {
						this.foundDevice = {
							name: ret.data.name,
							deviceId: ret.data.deviceId,
							serviceUuid: ret.data.serviceUuid
						};
						this.currentStage = 'deviceFound';
						this.pushStep('deviceFound');
					}
				});
			}
		},
		
		// 关闭设备发现弹窗
		closeModal() {
			// 回到扫描状态
			this.currentStage = 'scanning';
			this.pushStep('scanning');
			this.startScanningProcess();
		},
		
		// 设置POP
		setProofOfPossession() {
			this.setPopActive = true;
			blueModule.setProofOfPossession({
				pop: 'abcd1234'
			}, (ret) => {
				console.log('POP设置结果: ' + JSON.stringify(ret));
				setTimeout(() => {
					if (ret.success) {
						this.setPopActive = false;
						// 自动扫描WiFi网络 - 先检查权限
						this.currentStage = 'wifiConfig';
						this.pushStep('wifiConfig');
						this.scanWifiNetworks();
					} else {
						// 设置POP失败
						uni.showToast({
							title: '设置安全密钥 (POP)失败',
							icon: 'success'
						});
						this.setPopActive = true;
					}
				}, 2000);
			});
		},

		// 连接设备
		connectDevice() {
			
			blueModule.connectDevice({
				/**
				 * {"success":true,"msg":"onLeScan","data":{"mBleAddress":"1AF92E22-C653-272E-06AF-46D92E4B8963","mDeviceType":2,"mBleName":"Fuwinda 6199"}}
				 */
				mac: this.foundDevice.deviceId, //mac地址
				serviceUuid: this.foundDevice.serviceUuid //传给你的serviceUuid
			}, (ret) => {
				//扫描回调结果
				console.log('连接设备ret:',ret)
				if (ret.success && ret.msg == 'EVENT_DEVICE_CONNECTED') {
					// 设置POP
					this.currentStage = 'setingPop';
					this.pushStep('setingPop');
					this.setProofOfPossession();
				}
			});

		},
		// 断开连接
		disconnectDevice() {
			blueModule.disconnectDevice();
		},

		// 扫描WiFi网络
		scanWifiNetworks() {
			console.log('扫描WiFi1111');
			
			if (blueModule) {
				console.log('插件blueModule===',blueModule);
				uni.showLoading({
					title: `扫描WiFi中...`
				});
				
				// 添加超时处理 - 缩短超时时间以便快速重试
				let scanTimeout = setTimeout(() => {
					uni.hideLoading();
					console.log('WiFi扫描超时');
				}, 6000); // 改为6秒超时
				
				try {
					console.log('扫描WiFi2222');
					
					blueModule.scanNetworks((ret) => {
						// 清除超时定时器
						clearTimeout(scanTimeout);
						uni.hideLoading();
						
						console.log('扫描WiFi3333');
						// 记录详细的回调信息
						console.log('WiFi扫描回调: ' + JSON.stringify(ret, null, 2));
						
						
						if (ret && ret.success) {
							console.log('扫描成功，处理返回数据...');
							
							// 处理不同的消息类型和数据格式
							let wifiData = null;
							
							if (ret.msg === 'onWifiListReceived' && ret.data) {
								wifiData = ret.data;
								console.log('收到onWifiListReceived消息，数据: ' + JSON.stringify(ret.data));
							} else if (ret.data) {
								wifiData = ret.data;
								console.log('收到其他格式数据: ' + JSON.stringify(ret.data));
							} else if (ret.wifiList) {
								wifiData = ret.wifiList;
								console.log('收到wifiList数据: ' + JSON.stringify(ret.wifiList));
							}
							
							if (wifiData) {
								// 确保数据是数组格式
								const rawWifiList = Array.isArray(wifiData) ? wifiData : [wifiData];
								
								// 数据格式转换：将wifiName转换为ssid
								this.wifiList = rawWifiList.map(wifi => {
									return {
										ssid: wifi.wifiName || wifi.ssid || '未知网络',
										rssi: wifi.rssi || 0,
										security: wifi.security || 0,
										stability: wifi.stability || 0,
										auth: wifi.security || wifi.auth || 0
									};
								});
								
								console.log(`处理后的WiFi列表长度: ${this.wifiList.length}`);
								
								if (this.wifiList.length === 0) {
									uni.showToast({
										title: '未发现可用网络',
										icon: 'none'
									});
									console.log('WiFi列表为空');
								} else {
									uni.showToast({
										title: `发现 ${this.wifiList.length} 个网络`,
										icon: 'success'
									});
									console.log(`成功发现 ${this.wifiList.length} 个WiFi网络`);
									
									// 打印转换后的WiFi信息
									this.wifiList.forEach((wifi, index) => {
										console.log(`转换后WiFi ${index + 1}: ${JSON.stringify(wifi)}`);
									});
								}
							} else {
								console.log('未找到有效的WiFi数据');
							}
						} else {
							console.log('扫描失败: ' + (ret ? ret.msg || '未知错误' : '回调数据为空'));
						}
					});
				} catch (error) {
					clearTimeout(scanTimeout);
					uni.hideLoading();
					console.log('扫描WiFi异常: ' + error.toString());
				}
			} else {
				uni.showToast({
					title: '扫描Wi-Fi插件未找到',
					icon: 'none'
				});
			}
		},
		
		// 选择WiFi
		selectWifi(wifi) {
			this.wifiName = wifi.ssid;
			this.showWifiList = false;
		},
		
		// 切换WiFi列表显示
		toggleWifiList() {
			this.showWifiList = !this.showWifiList;
		},
		
		// 切换密码可见性
		togglePasswordVisible() {
			this.passwordVisible = !this.passwordVisible;
		},
		
		// 开始配网
		startDoProvisioning() {
			if (!this.wifiName) {
				uni.showToast({
					title: '请输入WiFi名称',
					icon: 'none'
				});
				return;
			}

			if (!this.wifiPassword) {
				uni.showToast({
					title: '请输入WiFi密码',
					icon: 'none'
				});
				return;
			}
			
			this.isConnecting = true;
			this.currentStage = 'provisioning';
			this.pushStep('provisioning');
			
			if (blueModule) {
				blueModule.doProvisioning({
					ssidValue: this.wifiName,
					passphraseValue: this.wifiPassword
				}, (ret) => {
					this.isConnecting = false;
					if (ret.success) {
						uni.showToast({
							title: '配网成功',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: ret.msg || '配网失败',
							icon: 'none'
						});
					}
				});
			} else {
				uni.showToast({
					title: '配网插件未找到',
					icon: 'none'
				});
			}
		},
		
		// 添加步骤到历史记录
		pushStep(step) {
			if (this.stepHistory[this.stepHistory.length - 1] !== step) {
				this.stepHistory.push(step);
				console.log('步骤历史更新:', this.stepHistory);
			}
		},
		
		// 清理当前阶段的状态和操作
		cleanupCurrentStage() {
			console.log('清理当前阶段:', this.currentStage);
			
			// 停止蓝牙扫描
			if (blueModule) {
				try {
					blueModule.stopBleScan();
					console.log('已停止蓝牙扫描');
				} catch (error) {
					console.log('停止蓝牙扫描失败:', error);
				}
			}
			
			// 重置各种活动状态
			this.scanningActive = false;
			this.setPopActive = false;
			this.isConnecting = false;
			
			// 隐藏加载提示
			uni.hideLoading();
			
			// 根据当前阶段进行特定清理
			switch (this.currentStage) {
				case 'wifiConfig':
					// 清理WiFi相关数据
					this.wifiName = '';
					this.wifiPassword = '';
					this.wifiList = [];
					this.showWifiList = true;
					this.passwordVisible = false;
					this.disconnectDevice();
					break;
				case 'deviceFound':
					// 重置设备信息
					this.foundDevice = {
						name: 'Namyvera',
						deviceId: '',
						rssi: -45
					};
					break;
				case 'provisioning':
					// 重置连接状态
					this.isConnecting = false;
					break;
			}
		},
		
		// 返回到指定步骤
		goToStep(targetStep) {
			console.log(`从 ${this.currentStage} 返回到 ${targetStep}`);
			
			// 清理当前状态
			this.cleanupCurrentStage();
			
			// 更新当前阶段
			this.currentStage = targetStep;
			
			// 更新步骤历史 - 移除当前步骤之后的所有步骤
			const targetIndex = this.stepHistory.lastIndexOf(targetStep);
			if (targetIndex !== -1) {
				this.stepHistory = this.stepHistory.slice(0, targetIndex + 1);
			} else {
				// 如果目标步骤不在历史中，添加它
				this.pushStep(targetStep);
			}
			
			// 根据目标步骤执行相应操作
			switch (targetStep) {
				case 'checking':
					// 重新检查权限和网络
					this.permissionStatus.checking = true;
					this.checkPermissionsAndNetwork();
					break;
				case 'scanning':
					// 重新开始扫描
					this.scanningActive = true;
					this.startScanningProcess();
					break;
				case 'wifiConfig':
					// 重新扫描WiFi网络
					this.scanWifiNetworks();
					break;
			}
		},
		
		// 返回
		goBack() {
			console.log('当前阶段:', this.currentStage);
			console.log('步骤历史:', this.stepHistory);
			
			// 根据当前阶段确定返回逻辑
			switch (this.currentStage) {
				case 'checking':
					// 如果在检查阶段，退出页面
					console.log('在检查阶段，退出页面');
					uni.navigateBack();
					break;
					
				case 'scanning':
					// 从扫描阶段返回到检查阶段
					console.log('从扫描返回到检查');
					this.goToStep('checking');
					break;
					
				case 'deviceFound':
					// 从设备发现返回到扫描阶段
					console.log('从设备发现返回到扫描');
					this.goToStep('scanning');
					break;
					
				case 'setingPop':
					// 从设置POP返回到扫描阶段
					console.log('从设置POP返回到扫描');
					this.goToStep('scanning');
					break;
					
				case 'wifiConfig':
					// 从WiFi配置返回到扫描阶段
					console.log('从WiFi配置返回到扫描');
					this.goToStep('scanning');
					break;
					
				case 'provisioning':
					// 从配网返回到WiFi配置
					console.log('从配网返回到WiFi配置');
					this.goToStep('wifiConfig');
					break;
					
				default:
					// 默认返回到上一页
					console.log('未知阶段，退出页面');
					uni.navigateBack();
					break;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 134.3rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #D9D9D9;

  .page-header-back {
    margin-left: 30rpx;
    width: 44.8rpx;
    height: 44.8rpx;
  }

  .page-header-title {
    font-size: 44.8rpx;
    font-weight: 400;
    color: #303030;
  }
}
.provisioning-container {
	min-height: 100vh;
	position: relative;
	padding-top: var(--status-bar-height);
}

/* 返回按钮 */
.back-button {
	position: fixed;
	top: calc(var(--status-bar-height) + 20rpx);
	left: 20rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 30rpx;
}

.back-icon {
	font-size: 40rpx;
	color: #fff;
	font-weight: bold;
}

/* 主要内容 */
.main-content {
	padding: calc(var(--status-bar-height) + 100rpx) 40rpx 40rpx;
	min-height: 100vh;
	box-sizing: border-box;
}

/* 通用样式 */
.stage-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 60rpx;
}

/* 状态列表 */
.status-list {
	margin-bottom: 40rpx;
}

.status-item {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	padding: 20rpx;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.status-item.completed .status-icon {
	background: #4CAF50;
	color: #fff;
}

.status-item.active .status-icon {
	background: #2196F3;
	color: #fff;
}

.status-item.error .status-icon {
	background: #f44336;
	color: #fff;
}

.status-item.error {
	border-left: 4rpx solid #f44336;
}

.status-icon {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: #E0E0E0;
	color: #999;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	font-size: 24rpx;
	font-weight: bold;
	flex-shrink: 0;
}

.loading-icon {
	width: 20rpx;
	height: 20rpx;
	border: 3rpx solid #fff;
	border-top: 3rpx solid transparent;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.status-text-container {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.status-text {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 4rpx;
}

.status-detail {
	font-size: 24rpx;
	color: #666;
	line-height: 1.3;
}

/* 设备发现弹窗 */
.device-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	margin: 40rpx;
	position: relative;
	max-width: 500rpx;
	width: 100%;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 40rpx;
	color: #333;
}

.close-button {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #999;
}

.device-info {
	text-align: center;
	margin-bottom: 40rpx;
}

.device-avatar {
	width: 120rpx;
	height: 120rpx;
	margin: 0 auto 20rpx;
	border-radius: 50%;
	overflow: hidden;
	background: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.device-emoji {
	font-size: 60rpx;
	line-height: 1;
}

.device-name {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
}

.modal-buttons {
	display: flex;
	gap: 20rpx;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	border: none;
	color: #fff;
}

.cancel-btn {
	background: #E0E0E0;
	color: #666;
}

.confirm-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* WiFi配置阶段 */
.wifi-icon-container {
	text-align: center;
	margin-bottom: 60rpx;
}

.wifi-icon {
	display: inline-block;
	position: relative;
	width: 120rpx;
	height: 80rpx;
}

.wifi-signal {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	border: 6rpx solid #C5A3FF;
	border-bottom: none;
	border-radius: 120rpx 120rpx 0 0;
}

.wifi-signal:nth-child(1) {
	width: 100rpx;
	height: 50rpx;
}

.wifi-signal:nth-child(2) {
	width: 70rpx;
	height: 35rpx;
}

.wifi-signal:nth-child(3) {
	width: 40rpx;
	height: 20rpx;
}

.wifi-dot {
	position: absolute;
	bottom: 10rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 12rpx;
	height: 12rpx;
	background: #C5A3FF;
	border-radius: 50%;
}

/* 输入区域 */
.wifi-input-section, .password-input-section {
	margin-bottom: 40rpx;
}

.input-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
	display: block;
}

.wifi-input-container, .password-input-container {
	background: #F5F5F5;
	border-radius: 16rpx;
	padding: 0 30rpx;
	display: flex;
	align-items: center;
}

.wifi-input, .password-input {
	flex: 1;
	height: 80rpx;
	font-size: 28rpx;
	background: transparent;
	border: none;
}

.password-toggle {
	padding: 10rpx;
}

.password-icon {
	font-size: 32rpx;
	color: #999;
}

/* WiFi列表 */
.wifi-list-section {
	margin-bottom: 40rpx;
}

.wifi-list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.list-title {
	font-size: 28rpx;
	color: #666;
}

.refresh-button {
	padding: 10rpx;
}

.refresh-icon {
	font-size: 28rpx;
	color: #666;
}

.wifi-list {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.wifi-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.wifi-item:last-child {
	border-bottom: none;
}

.wifi-name {
	font-size: 28rpx;
	color: #333;
}

.wifi-signal-strength {
	color: #666;
}

.signal-icon {
	font-size: 24rpx;
}

/* 连接按钮 */
.connect-wifi-btn {
	width: 100%;
	height: 80rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.connect-wifi-btn:disabled {
	background: #E0E0E0;
	color: #999;
}
</style> 