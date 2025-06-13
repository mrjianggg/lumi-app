<template>
	<view class="provisioning-container">
		<!-- 返回按钮 -->
		<head-return v-if="currentStage === 'checking' || currentStage === 'provisioningSuccess'" :toPage="0" title=""></head-return>

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
			<view v-if="currentStage !== 'wifiConfig'">
				<text class="stage-title">{{getStageTitle()}}</text>
				
				<!-- 统一的状态列表 -->
				<view class="status-list">
					<view 
						v-for="(step, index) in statusSteps" 
						:key="index"
						class="status-item-wrapper"
					>
						<!-- 状态项 -->
						<view 
							class="status-item" 
							:class="getStepClass(index)"
						>
							<view class="status-icon" :class="getStepClass(index)">
								<!-- 加载中图标 -->
								<image v-if="getStepClass(index) === 'active'" src="/static/icon/loading.svg"   class="loading-icon"/>
								<!-- 成功图标 -->
								<image v-else-if="getStepClass(index) === 'completed'" src="/static/icon/status-success.svg"/>
								<!-- 错误图标 -->
								<image v-else-if="getStepClass(index) === 'error'" src="/static/icon/status-error.svg" />
								<!-- 默认图标 -->
								<image v-else src="/static/icon/default.svg"  class="status-default-icon"/>
							</view>
							
							<view class="status-content">
								<text class="status-text">{{step.text}}</text>
								<!-- 权限检查重试按钮 -->
								<view @click="checkPermissionsAndNetwork" v-if="index === 0 && getStepClass(index) === 'error'" style="margin-left: 16rpx;">🔄</view>
								<!-- 配网失败重试按钮 -->
								<view @click="retryProvisioning" v-if="index === 6 && getStepClass(index) === 'error'" style="margin-left: 16rpx;">🔄</view>
								<!-- 权限检查步骤显示详细信息 -->
								<text v-if="index === 0" class="status-detail">{{getPermissionDetailText()}}</text>
								<!-- 配网失败错误信息 -->
								<text v-if="index === 6 && currentStage === 'provisioningFailed'" class="status-detail">{{provisioningStatus.errorMessage || '配网失败，请重试'}}</text>
							</view>
						</view>
						<!-- 连接线 -->
						<view class="connection-line" v-if="index < statusSteps.length - 1"></view>
					</view>
													

				</view>
				
				<!-- 发现设备弹窗 -->
				<view v-if="currentStage === 'deviceFound'" class="device-modal">
					<view class="modal-content">
						<view class="modal-header">
							<view class="close-button"></view>
							<view class="modal-title">附近设备</view>
							<image @click="closeModal" class="close-button" src="/static/icon/model-close.svg" mode="widthFix"></image>
						</view>
						

						<image class="device-img" src="/static/img/deviceImg.png" mode="widthFix"></image>

						<view class="device-name">
							{{foundDevice.name}}
						</view>
						
						<view class="modal-buttons">
							<view class="modal-btn cancel-btn" @click="closeModal">忽略设备</view>
							<view class="modal-btn confirm-btn" @click="connectDevice">开始绑定</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 阶段4: WiFi配置 -->
			<view v-if="currentStage === 'wifiConfig'">
				<text class="stage-title">设置{{foundDevice.name}}的Wi-Fi</text>
				
				<!-- WiFi图标 -->
				<image class="wifi-icon" src="/static/img/Wifi.png" mode="widthFix"></image>
				
				<!-- WiFi名称输入 -->
				<view class="wifi-input-section">
					<view class="wifi-input-container">
						<input 
							class="wifi-input" 
							v-model="wifiName" 
							placeholder="手动输入Wi-Fi名字"
							@focus="showWifiList = false"
						/>
					</view>
				</view>
				
				<!-- 密码输入 -->
				<view class="password-input-section" v-if="provisioningPage === 2">
					<view class="input-label">输入密码</view>
					<view class="password-input-container">
						<input 
							class="password-input" 
							v-model="wifiPassword" 
							:type="passwordVisible ? 'text' : 'password'"
							placeholder=""
						/>
						<image class="password-toggle" @click="togglePasswordVisible" src="/static/icon/Eye.svg" mode="widthFix"></image>
					</view>
				</view>
				
				<!-- WiFi列表 -->
				<view class="wifi-list-section" v-if="provisioningPage === 1">
					<view class="wifi-list-header" @click="toggleWifiList">
						<text class="list-title">Wi-Fi 列表</text>
						<image class="refresh-button" @click="scanWifiNetworks" src="/static/icon/Refresh.svg" mode="widthFix"></image>
					</view>
					<view v-if="showWifiList && wifiList.length > 0">
						<view class="wifi-list">
							<view 
								v-for="(wifi, index) in wifiList" 
								:key="index"
								class="wifi-item"
								@click="selectWifi(wifi)"
							>
								<text class="wifi-name">{{wifi.ssid}}</text>
								<image class="wifi-item-icon" src="/static/icon/Wifi-hui.svg" mode="widthFix"></image>
							</view>
						</view>
					</view>
				</view>
				
				<view style="padding: 50rpx;" @click="sendDataToCustomEndPoint">
					发送数据到自定义端点
				</view>

				<view class="connect-wifi-btn" @click="onSelectWifi" v-if="provisioningPage === 1">
					选择 Wi-Fi
				</view>

				<!-- 连接按钮 -->
				<view class="connect-wifi-btn" @click="startDoProvisioning" v-if="provisioningPage === 2">
					连接 Wi-Fi
				</view>
			</view>
		</view>

		<view style="padding: 50rpx;" @click="sendDataToCustomEndPoint">
			发送数据到自定义端点
		</view>

		<view style="padding: 50rpx;" @click="disconnectDevice">
			断开设备
		</view>
	</view>
</template>

<script>
var blueModule = uni.requireNativePlugin("XM-EspIdfModule")

export default {
	data() {
		return {
			currentStage: 'checking', // checking, scanning, deviceFound, setingPop, wifiConfig, provisioning, provisioningSuccess, provisioningFailed
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
			// 配网阶段状态跟踪
			provisioningStatus: {
				wifiConfigPushed: false,    // WiFi配置是否已推送成功
				isWaitingForPairing: false, // 是否正在等待配对
				pairingResult: null,        // 配对结果：'success' | 'failed' | null
				errorMessage: ''            // 错误信息
			},
			provisioningPage: 1,
			// 蓝牙和网络状态检查
			permissionStatus: {
				bluetooth: false,        // 蓝牙开启状态
				network: false,         // 网络连接状态
				wifi: false,           // WiFi功能状态
				checking: true         // 是否正在检查中
			},
			// 状态步骤定义
			statusSteps: [
				{ text: '权限及网络正常' },
				{ text: '正在扫描 BubblePal 蓝牙信号' },
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
				'provisioning': `等待${this.foundDevice.name}配对`,
				'provisioningSuccess': `${this.foundDevice.name}配网成功`,
				'provisioningFailed': `${this.foundDevice.name}配网失败`
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
				'checking': 0,                // 第0步进行中（权限检查）
				'scanning': 1,                // 第1步进行中
				'deviceFound': 1,             // 第1步完成
				'setingPop': 1,               // 设置POP阶段保持在第1步（隐藏的步骤）
				'wifiConfig': 2,              // 第2步进行中（原来的第3步）
				'provisioning': 6,            // 第6步进行中（等待配对）
				'provisioningSuccess': 6,     // 第6步完成（配网成功）
				'provisioningFailed': 6       // 第6步失败（配网失败）
			};
			
			const currentStep = stageStepMap[this.currentStage];
			
			// 特殊处理第6步（等待BubblePal配对）
			if (stepIndex === 6) {
				if (this.currentStage === 'provisioning' && this.provisioningStatus.isWaitingForPairing) {
					return 'active'; // 显示loading状态
				} else if (this.currentStage === 'provisioningSuccess') {
					return 'completed'; // 配网成功
				} else if (this.currentStage === 'provisioningFailed') {
					return 'error'; // 配网失败
				} else if (currentStep > 6) {
					return 'completed';
				}
			}
			
			if (stepIndex < currentStep) {
				return 'completed';
			} else if (stepIndex === currentStep) {
				// 特殊处理：如果是scanning阶段且scanningActive为true
				if (this.currentStage === 'scanning' && stepIndex === 1 && this.scanningActive) {
					return 'active';
				}
				// 特殊处理：如果是配网阶段且在等待配对
				if (this.currentStage === 'provisioning' && stepIndex === 6 && this.provisioningStatus.isWaitingForPairing) {
					return 'active';
				}
				return 'active';
			} else if (this.currentStage === 'provisioningSuccess' || this.currentStage === 'provisioningFailed') {
				// 配网结束后，所有步骤都显示相应状态
				if (stepIndex <= 6) {
					return this.currentStage === 'provisioningSuccess' ? 'completed' : 'completed';
				}
			}
			return '';
		},
		
		// 获取权限检查的详细文本
		getPermissionDetailText() {
			
			let details = [];
			
			// 蓝牙状态简化显示
			if (!this.permissionStatus.bluetooth) {
				details.push('蓝牙✗(未开启)');
			}
			
			// 网络状态
			if (!this.permissionStatus.network) details.push('网络✗(未连接)');
			
			// WiFi状态
			if (!this.permissionStatus.wifi) details.push('WiFi✗(未开启)');
			
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
			console.log('setProofOfPossession11111');
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
						this.provisioningPage = 1;
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
					// 设置POP（后台执行，用户不可见）
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
			console.log('selectWifi11111',wifi);
			this.wifiName = wifi.ssid;
			// this.showWifiList = false;
		},
		
		// 切换WiFi列表显示
		toggleWifiList() {
			this.showWifiList = !this.showWifiList;
		},
		
		// 切换密码可见性
		togglePasswordVisible() {
			this.passwordVisible = !this.passwordVisible;
		},
		onSelectWifi(){
			if(this.wifiName.trim() !== ''){
				this.provisioningPage = 2;
			}
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
			
			// 重置配网状态
			this.provisioningStatus = {
				wifiConfigPushed: false,
				isWaitingForPairing: false,
				pairingResult: null,
				errorMessage: ''
			};
			
			this.isConnecting = true;
			
			if (blueModule) {
				blueModule.doProvisioning({
					ssidValue: this.wifiName,
					passphraseValue: this.wifiPassword
				}, (ret) => {
					console.log('doProvisioning===', ret);
					
					// 处理WiFi配置推送状态
					if (ret.success && ret.msg === 'wifiConfigApplied') {
						console.log('✅ WiFi配置推送成功');
						this.provisioningStatus.wifiConfigPushed = true;
						
						// 切换到配网阶段，显示状态列表
						this.currentStage = 'provisioning';
						this.pushStep('provisioning');
						
						// 设置等待配对状态
						this.provisioningStatus.isWaitingForPairing = true;
						this.isConnecting = false;
						
						uni.showToast({
							title: 'WiFi配置推送成功',
							icon: 'success'
						});
						
						return;
					}
					
					// 处理配网结果状态  此时等待配对状态
					if(this.provisioningStatus.isWaitingForPairing === true){
						if (ret.success && ret.msg === 'deviceProvisioningSuccess') {
							console.log('✅ 配网成功');
							this.handleProvisioningResult('success', '配网成功');
							return;
						}else{
							console.log('❌ 配网失败：WiFi密码错误');
							this.handleProvisioningResult('failed', 'WiFi名称或密码错误');
							return;
						}
					}
					
					// 处理其他错误情况
					if (!ret.success) {
						console.log('❌ 配网过程出错:', ret.msg);
						this.handleProvisioningResult('failed', ret.msg || '配网失败');
					}
				});
			} else {
				this.isConnecting = false;
				uni.showToast({
					title: '配网插件未找到',
					icon: 'none'
				});
			}
		},
		
		// 处理配网结果
		handleProvisioningResult(result, message) {
			this.provisioningStatus.isWaitingForPairing = false;
			this.provisioningStatus.pairingResult = result;
			this.isConnecting = false;
			
			if (result === 'success') {
				this.currentStage = 'provisioningSuccess';
				uni.showToast({
					title: message,
					icon: 'success'
				});
				
				// 3秒后可以返回或执行其他操作
				setTimeout(() => {
					// 这里可以跳转到成功页面或返回首页
					console.log('配网成功，可以执行后续操作');
				}, 3000);
			} else {
				this.currentStage = 'provisioningFailed';
				// 将错误信息存储到provisioningStatus中
				this.provisioningStatus.errorMessage = message;
				uni.showToast({
					title: message,
					icon: 'none',
					duration: 3000
				});
			}
		},
		// 获取设备ID
		sendDataToCustomEndPoint() {
			console.log('sendDataToCustomEndPoint11111');
			blueModule.sendDataToCustomEndPoint({
				path: 'device',
				bytes: [0xFF, 0xF0], //优先级第一
				hexStr: 'FFF0' //优先级第二
			}, (ret) => {
				//扫描回调结果
				console.log('sendDataToCustomEndPoint===',ret)

			});
		},
		// 获取版本信息
		getVersionInfo() {
			blueModule.getVersionInfo((ret) => {
				console.log('获取版本信息ret:',ret)
			});
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
					// 从设置POP返回到扫描阶段（隐藏步骤，通常不会被用户触发）
					console.log('从设置POP返回到扫描');
					this.goToStep('scanning');
					break;
					
				case 'wifiConfig':
					// 从WiFi配置返回到扫描阶段（因为POP步骤对用户隐藏）
					console.log('从WiFi配置返回到扫描');
					this.goToStep('scanning');
					break;
					
				case 'provisioning':
					// 从配网返回到WiFi配置
					console.log('从配网返回到WiFi配置');
					this.goToStep('wifiConfig');
					break;
					
				case 'provisioningSuccess':
					// 配网成功，返回到WiFi配置重新配网或退出
					console.log('配网成功，返回到WiFi配置');
					this.goToStep('wifiConfig');
					break;
					
				case 'provisioningFailed':
					// 配网失败，返回到WiFi配置重新尝试
					console.log('配网失败，返回到WiFi配置重新尝试');
					this.goToStep('wifiConfig');
					break;
					
				default:
					// 默认返回到上一页
					console.log('未知阶段，退出页面');
					uni.navigateBack();
					break;
			}
		},
		
		// 重试配网
		retryProvisioning() {
			console.log('重试配网');
			// 重置状态回到WiFi配置阶段
			this.provisioningStatus = {
				wifiConfigPushed: false,
				isWaitingForPairing: false,
				pairingResult: null,
				errorMessage: ''
			};
			this.currentStage = 'wifiConfig';
			this.pushStep('wifiConfig');
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
	padding: 29.9rpx 29.9rpx 29.9rpx 46.6rpx;
	min-height: 100vh;
	box-sizing: border-box;
	/* 通用样式 */
	.stage-title {
		font-size: 44.8rpx;
		font-weight: 600;
		color: #303030;
		text-align: center;
	}
	/* 状态列表 */
	.status-list {
		margin-top: 97rpx;
		margin-bottom: 40rpx;
		padding: 0 46.6rpx;
		.status-item-wrapper {
			.status-item {
				display: flex;
				align-items: center;
				.status-icon {
					width: 48rpx;
					height: 48rpx;
					image{
						width: 44.8rpx;
						height: 44.8rpx;
					}
					.loading-icon {
						animation: spin 2.5s linear infinite;
					}
				}
				.status-content {
					margin-left: 9.3rpx;
					flex: 1;
					display: flex;
					align-items: center;
					position: relative;
					.status-text {
						font-size: 29.9rpx;
						color: #1E1E1E;
						font-weight: 400;
					}
					.status-detail {
						position: absolute;
						top: 50rpx;
						left: 0;
						font-size: 28rpx;
						color: #666;
						line-height: 1.3;
						margin-bottom: 10rpx;
					}
				}
			}
			.connection-line {
				width: 1px;
				height: 59.7rpx;
				background: #D9D9D9;
				margin-left: 20rpx;
			}
		}
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
		align-items: end;
		justify-content: center;
		z-index: 1000;
		.modal-content {
			margin-bottom: 48.5rpx;
			background: #fff;
			border-radius: 24rpx;
			padding: 44.8rpx;
			position: relative;
			max-width: 550rpx;
			width: 100%;

			.modal-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				.modal-title {
					font-size: 29.9rpx;
					font-weight: 400;
					color: #1E1E1E;
				}
				.close-button {
					width: 44.8rpx;
					height: 44.8rpx;
				}
			}
			.device-img {
				width: 320.9rpx;
				margin: 29.9rpx 0;
				margin-left: 50%;
				transform: translateX(-50%);
			}
			.device-name {
				text-align: center;
				font-size: 29.9rpx;
				color: #1E1E1E;
				font-weight: 400;
			}
		
			.modal-buttons {
				display: flex;
				gap: 7.5rpx;
				margin-top: 29.9rpx;
				.modal-btn {
					flex: 1;
					height: 85.8rpx;
					border-radius: 50rpx;
					font-size: 29.9rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: 400;
				}
				
				.cancel-btn {
					background: #F5F5F5;
					color: #757575;
				}
				
				.confirm-btn {
					background: #EBE7FF;
					color: #1E1E1E;
				}
			}
			



		}
		

		

		

	}
}











.status-default-icon {
	width: 44.8rpx;
}



@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}





/* WiFi配置阶段 */
.wifi-icon{
	margin-top: 100rpx;
	width: 304.1rpx;
	margin-left: 50%;
	transform: translateX(-50%);
}

/* 输入区域 */
.wifi-input-section, .password-input-section {
	margin-bottom: 37.3rpx;
}

.input-label {
	font-size: 29.9rpx;
	color: #303030;
	margin-bottom: 37.3rpx;
}


.wifi-input-container, .password-input-container {
	border: 1rpx solid #D9D9D9;
	background: #F5F5F5;
	border-radius: 29.9rpx;
	padding: 0 30rpx;
	display: flex;
	align-items: center;
}

.wifi-input{
	flex: 1;
	height: 104.5rpx;
	font-size: 29.9rpx;
	background: transparent;
	border: none;
	color: #303030;
}

.password-input {
	flex: 1;
	height: 134.3rpx;
	font-size: 29.9rpx;
	background: transparent;
	border: none;
	color: #303030;
}

.password-toggle {
	width: 44.8rpx;
}



/* WiFi列表 */
.wifi-list-section {
	margin-bottom: 40rpx;
	.wifi-list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 37.3rpx;
		.list-title {
			font-size: 29.9rpx;
			color: #1E1E1E;
		}
		.refresh-button {
			width: 37.3rpx;
		}
	}
	.wifi-list {
		background: #fff;
		border-radius: 16rpx;
		padding: 14.9rpx;
		background-color: #F5F5F5;
		border: 1px solid #D9D9D9;
		border-radius: 29.9rpx;
		.wifi-item {
			padding: 14.9rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			.wifi-name {
				font-size: 29.9rpx;
				color: #1E1E1E;
			}
			
			.wifi-item-icon {
				width: 44.8rpx;
			}
		}
	}
	

}










/* 连接按钮 */
.connect-wifi-btn {
	position: fixed;
	bottom: 22.4rpx;
	left: 22.4rpx;
	width: calc(100% - 44.8rpx);
	height: 85.8rpx;
	background: #6D5BE3;
	color: #fff;
	border: none;
	border-radius: 74.6rpx;
	font-size: 29.9rpx;
	font-weight: 400;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style> 