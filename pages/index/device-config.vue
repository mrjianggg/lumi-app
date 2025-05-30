<template>
	<view class="config-container">
		<!-- 设备信息头部 -->
		<view class="device-header">
			<view class="device-icon">📱</view>
			<text class="device-name">{{deviceName}}</text>
			<text class="device-id">{{deviceId}}</text>
			<view class="connection-status">
				<view class="status-dot"></view>
				<text class="status-text">已连接</text>
			</view>
			<!-- 调试开关 -->
			<view class="debug-toggle" @click="toggleDebug">
				<text class="debug-text">{{showDebug ? '隐藏调试' : '显示调试'}}</text>
			</view>
		</view>
		
		<!-- 连接信息卡片 -->
		<view v-if="connectionInfo" class="connection-info-card">
			<view class="info-header">
				<text class="info-title">🔗 连接信息</text>
				<view class="connection-badge" :class="{'success': connectionInfo.success, 'error': !connectionInfo.success}">
					<text class="badge-text">{{connectionInfo.success ? '连接成功' : '连接失败'}}</text>
				</view>
			</view>
			
			<view class="info-content">
				<view class="info-item">
					<text class="info-label">信号强度:</text>
					<text class="info-value">{{connectionInfo.rssi}} dBm</text>
				</view>
				<view class="info-item">
					<text class="info-label">连接时间:</text>
					<text class="info-value">{{connectionInfo.connectionTime}}</text>
				</view>
				<view class="info-item" v-if="connectionInfo.message">
					<text class="info-label">连接消息:</text>
					<text class="info-value">{{connectionInfo.message}}</text>
				</view>
				<view class="info-item" v-if="connectionInfo.serviceUuid">
					<text class="info-label">服务UUID:</text>
					<text class="info-value">{{connectionInfo.serviceUuid}}</text>
				</view>
				<view class="info-item" v-if="connectionInfo.services && connectionInfo.services.length > 0">
					<text class="info-label">发现服务:</text>
					<text class="info-value">{{connectionInfo.services.length}} 个</text>
				</view>
				<view class="info-item" v-if="connectionInfo.error">
					<text class="info-label">错误信息:</text>
					<text class="info-value error-text">{{connectionInfo.error.errMsg || '未知错误'}}</text>
				</view>
				
				<!-- 设备能力信息 -->
				<view v-if="connectionInfo.deviceCapabilities && connectionInfo.deviceCapabilities.length > 0" class="capabilities-section">
					<text class="capabilities-title">🔧 设备能力</text>
					<view class="capability-tags">
						<view class="capability-tag" v-for="(cap, index) in connectionInfo.deviceCapabilities" :key="index">
							<text class="capability-text">{{cap}}</text>
						</view>
					</view>
				</view>
				
				<!-- Provisioning 详细信息 -->
				<view v-if="connectionInfo.provisioningInfo" class="prov-info-section">
					<text class="prov-info-title">⚙️ Provisioning 信息</text>
					<view class="prov-info-content">
						<view class="prov-info-item">
							<text class="prov-label">协议版本:</text>
							<text class="prov-value">{{connectionInfo.provisioningInfo.ver || '未知'}}</text>
						</view>
						<view class="prov-info-item">
							<text class="prov-label">安全版本:</text>
							<text class="prov-value">{{connectionInfo.provisioningInfo.sec_ver || '未知'}}</text>
						</view>
						<view class="prov-info-item" v-if="connectionInfo.provisioningInfo.sec_patch_ver !== undefined">
							<text class="prov-label">安全补丁:</text>
							<text class="prov-value">{{connectionInfo.provisioningInfo.sec_patch_ver}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 原始数据展示区域 -->
			<view v-if="connectionInfo.rawData" class="raw-data-section">
				<text class="raw-data-title">📄 原始返回数据</text>
				<view class="raw-data-content">
					<text class="raw-data-text">{{JSON.stringify(connectionInfo, null, 2)}}</text>
				</view>
			</view>
			
			<view v-if="connectionInfo.services && connectionInfo.services.length > 0" class="services-section">
				<text class="services-title">📋 设备服务列表</text>
				<view class="service-item" v-for="(service, index) in connectionInfo.services" :key="index">
					<text class="service-uuid">{{service.uuid}}</text>
					<text class="service-type">{{service.isPrimary ? '主要服务' : '次要服务'}}</text>
				</view>
			</view>
		</view>
		
		<!-- 配置步骤 -->
		<view class="config-steps">
			<!-- 步骤1: POP设置 -->
			<view class="step-card" :class="{'active': currentStep === 1}">
				<view class="step-header">
					<view class="step-number">1</view>
					<text class="step-title">设置安全密钥 (POP)</text>
				</view>
				
				<view v-if="currentStep === 1" class="step-content">
					<text class="input-label">请输入设备安全密钥</text>
					<input 
						class="config-input"
						v-model="popValue"
						placeholder="例如: abcd1234"
						maxlength="8"
					/>
					<text class="input-tip">密钥通常在设备标签上</text>
					
					<button class="primary-button" @click="setProofOfPossession">
						确认设置
					</button>
				</view>
			</view>
			
			<!-- 步骤2: WiFi配置 -->
			<view class="step-card" :class="{'active': currentStep === 2}">
				<view class="step-header">
					<view class="step-number" :class="{'completed': currentStep > 1}">2</view>
					<text class="step-title">连接 WiFi 网络</text>
				</view>
				
				<view v-if="currentStep === 2" class="step-content">
					<!-- WiFi扫描按钮 -->
					<view class="scan-wifi-button" @click="scanWifiNetworks">
						<text class="scan-wifi-icon">📡</text>
						<text class="scan-wifi-text">扫描可用网络</text>
					</view>
					
					<!-- WiFi列表 -->
					<view v-if="wifiList.length > 0" class="wifi-list">
						<view class="wifi-item" 
							v-for="(wifi, index) in wifiList" 
							:key="index"
							@click="selectWifi(wifi)">
							<text class="wifi-name">{{wifi.ssid}}</text>
							<view class="wifi-signal">
								<text class="signal-icon">{{getWifiSignalIcon(wifi.rssi)}}</text>
							</view>
						</view>
					</view>
					
					<!-- 手动输入 -->
					<view class="manual-input">
						<text class="input-label">WiFi 名称 (SSID)</text>
						<input 
							class="config-input"
							v-model="ssidValue"
							placeholder="请输入 WiFi 名称"
						/>
						
						<text class="input-label">WiFi 密码</text>
						<input 
							class="config-input"
							v-model="passwordValue"
							type="password"
							placeholder="请输入 WiFi 密码"
						/>
					</view>
					
					<button class="primary-button" @click="startProvisioning">
						开始配网
					</button>
				</view>
			</view>
			
			<!-- 步骤3: 完成 -->
			<view class="step-card" :class="{'active': currentStep === 3}">
				<view class="step-header">
					<view class="step-number" :class="{'completed': currentStep > 2}">3</view>
					<text class="step-title">配置完成</text>
				</view>
				
				<view v-if="currentStep === 3" class="step-content success">
					<text class="success-icon">✅</text>
					<text class="success-text">设备配置成功！</text>
					<text class="success-tip">设备已成功连接到网络</text>
					
					<button class="primary-button" @click="finishConfig">
						完成
					</button>
				</view>
			</view>
		</view>
		
		<!-- 底部操作 -->
		<view class="bottom-actions">
			<button class="secondary-button" @click="disconnectDevice">
				断开连接
			</button>
		</view>
		
		<!-- 调试信息（可选显示） -->
		<view v-if="showDebug" class="debug-info">
			<view class="debug-header">
				<text class="debug-title">调试信息</text>
				<view class="debug-actions">
					<button class="debug-btn test-btn" @click="testWifiScan">测试扫描</button>
					<button class="debug-btn test-btn" @click="testGetDeviceInfo">获取设备信息</button>
					<button class="debug-btn copy-btn" @click="copyDebugLog">复制日志</button>
					<button class="debug-btn clear-btn" @click="clearDebugLog">清空日志</button>
				</view>
			</view>
			<textarea 
				class="debug-content"
				v-model="debugLog"
				disabled
				placeholder="调试日志将显示在这里..."
			></textarea>
		</view>
	</view>
</template>

<script>
var blueModule = uni.requireNativePlugin("XM-EspIdfModule")

export default {
	data() {
		return {
			deviceId: '',
			deviceName: '',
			currentStep: 1,
			popValue: 'abcd1234',
			ssidValue: '',
			passwordValue: '',
			wifiList: [],
			debugLog: '',
			showDebug: false,
			isProvisioning: false,
			connectionInfo: null
		}
	},
	onLoad(options) {
		this.deviceId = options.deviceId || '';
		this.deviceName = options.name || '未知设备';
		
		// 初始化日志
		this.addDebugLog('=== 设备配置页面初始化 ===');
		this.addDebugLog(`设备名称: ${this.deviceName}`);
		this.addDebugLog(`设备ID: ${this.deviceId}`);
		this.addDebugLog(`当前步骤: ${this.currentStep}`);
		
		// 处理从device-list页面传递过来的连接结果信息
		if (options.connectionResult) {
			try {
				const connectionResult = JSON.parse(decodeURIComponent(options.connectionResult));
				this.addDebugLog('=== ESP设备连接结果 ===');
				this.addDebugLog(`连接时间: ${connectionResult.timestamp}`);
				this.addDebugLog(`连接状态: ${connectionResult.success ? '成功' : '失败'}`);
				this.addDebugLog(`连接消息: ${connectionResult.message}`);
				
				// 显示设备信息
				this.addDebugLog('--- 设备详细信息 ---');
				this.addDebugLog(`设备ID: ${connectionResult.deviceInfo.deviceId}`);
				this.addDebugLog(`设备名称: ${connectionResult.deviceInfo.name}`);
				this.addDebugLog(`信号强度: ${connectionResult.deviceInfo.rssi} dBm`);
				this.addDebugLog(`服务UUID: ${connectionResult.deviceInfo.serviceUuid || '未知'}`);
				
				// 显示完整的原始返回数据
				this.addDebugLog('--- 原始连接响应数据 ---');
				this.addDebugLog('完整返回信息: ' + JSON.stringify(connectionResult.rawData, null, 2));
				
				// 如果有具体的连接响应数据，逐项显示
				if (connectionResult.connectionResponse) {
					this.addDebugLog('--- 连接响应详情 ---');
					Object.keys(connectionResult.connectionResponse).forEach(key => {
						const value = connectionResult.connectionResponse[key];
						this.addDebugLog(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
					});
				}
				
				this.addDebugLog('=== 连接结果信息处理完成 ===');
				
				// 设置连接信息用于界面显示
				this.connectionInfo = {
					success: connectionResult.success,
					rssi: connectionResult.deviceInfo.rssi,
					connectionTime: connectionResult.timestamp,
					message: connectionResult.message,
					serviceUuid: connectionResult.deviceInfo.serviceUuid,
					rawData: connectionResult.rawData
				};
				
				// 如果连接成功，显示提示并自动显示调试信息
				if (connectionResult.success) {
					uni.showToast({
						title: '设备连接成功',
						icon: 'success',
						duration: 2000
					});
					this.showDebug = true;
				} else {
					// 连接失败时也显示调试信息
					uni.showToast({
						title: '连接失败，查看日志了解详情',
						icon: 'none',
						duration: 3000
					});
					this.showDebug = true;
				}
				
			} catch (error) {
				this.addDebugLog('解析连接结果信息失败: ' + error.toString());
			}
		}
		
		// 处理从蓝牙扫描页面传递过来的连接信息（保持兼容性）
		if (options.connectionInfo) {
			try {
				const connectionInfo = JSON.parse(decodeURIComponent(options.connectionInfo));
				this.addDebugLog('=== 蓝牙连接信息 ===');
				this.addDebugLog(`连接状态: ${connectionInfo.success ? '成功' : '失败'}`);
				this.addDebugLog(`信号强度: ${connectionInfo.rssi} dBm`);
				this.addDebugLog(`连接时间: ${connectionInfo.connectionTime}`);
				
				if (connectionInfo.services && connectionInfo.services.length > 0) {
					this.addDebugLog(`发现服务数量: ${connectionInfo.services.length}`);
					connectionInfo.services.forEach((service, index) => {
						this.addDebugLog(`服务 ${index + 1}: ${service.uuid} (${service.isPrimary ? '主要' : '次要'})`);
					});
				} else {
					this.addDebugLog('未发现任何服务或服务获取失败');
				}
				
				if (connectionInfo.error) {
					this.addDebugLog('连接错误信息: ' + JSON.stringify(connectionInfo.error));
				}
				
				this.addDebugLog('=== 连接信息处理完成 ===');
				
				// 如果是Lumi设备且连接成功，显示提示
				if (this.deviceName.startsWith('Lumi_') && connectionInfo.success) {
					uni.showToast({
						title: '设备连接成功',
						icon: 'success',
						duration: 2000
					});
					
					// 自动显示调试信息
					this.showDebug = true;
				}
				
				this.connectionInfo = connectionInfo;
				
			} catch (error) {
				this.addDebugLog('解析连接信息失败: ' + error.toString());
			}
		}
		
		if (!options.connectionResult && !options.connectionInfo) {
			this.addDebugLog('未收到连接信息参数');
		}
		
		this.addDebugLog('页面加载完成');
		
		// 检查原生插件是否可用
		if (blueModule) {
			this.addDebugLog('原生插件 XM-EspIdfModule 加载成功');
			
			// 设置事件监听器来捕获设备信息
			this.setupEventListeners();
			
			// 列出插件的所有可用方法
			try {
				const availableMethods = Object.keys(blueModule).filter(key => typeof blueModule[key] === 'function');
				this.addDebugLog('插件可用方法: ' + availableMethods.join(', '));
				
				// 检查是否有获取设备信息相关的方法
				const deviceInfoMethods = availableMethods.filter(method => 
					method.toLowerCase().includes('info') || 
					method.toLowerCase().includes('version') || 
					method.toLowerCase().includes('capabilities') ||
					method.toLowerCase().includes('proto')
				);
				
				if (deviceInfoMethods.length > 0) {
					this.addDebugLog('发现设备信息相关方法: ' + deviceInfoMethods.join(', '));
				} else {
					this.addDebugLog('未发现明显的设备信息获取方法');
				}
			} catch (error) {
				this.addDebugLog('检查插件方法时出错: ' + error.toString());
			}
		} else {
			this.addDebugLog('警告: 原生插件 XM-EspIdfModule 未找到');
		}
		
		// 如果设备连接成功，获取设备信息和能力
		if (this.connectionInfo && this.connectionInfo.success) {
			// 延迟一秒后获取设备信息，确保连接稳定
			setTimeout(() => {
				this.getDeviceInfo();
			}, 1000);
		} else {
			this.addDebugLog('设备未连接成功，跳过获取设备信息');
		}
	},
	methods: {
		// 获取设备信息和能力
		getDeviceInfo() {
			this.addDebugLog('开始获取设备信息11...');
			this.addDebugLog('根据ESP-IDF BLE传输层实现，设备信息应该在连接时就已经获取');
			
			uni.showLoading({
				title: '获取设备信息...'
			});
			
			try {
				// 根据ESP-IDF协议，设备信息通常在连接建立时就已经获取
				// 我们尝试通过不同的方式来访问这些信息
				
				this.addDebugLog('尝试通过插件内部状态获取设备信息...');
				
				// 方法1: 尝试通过现有的插件状态获取信息
				// 在ESP-IDF Android库中，设备信息存储在transport层
				let deviceInfoFound = false;
				
				// 检查是否可以通过某种方式获取插件内部状态
				if (typeof blueModule.getDeviceState === 'function') {
					this.addDebugLog('尝试使用 getDeviceState 方法');
					blueModule.getDeviceState((ret) => {
						uni.hideLoading();
						this.addDebugLog('getDeviceState 结果: ' + JSON.stringify(ret, null, 2));
						this.handleDeviceInfoResult(ret);
					});
					deviceInfoFound = true;
				}
				
				// 方法2: 尝试通过发送一个简单的请求来触发设备信息返回
				if (!deviceInfoFound && typeof blueModule.sendData === 'function') {
					this.addDebugLog('尝试发送简单请求来获取设备响应');
					blueModule.sendData({
						type: 'status',
						data: ''
					}, (ret) => {
						uni.hideLoading();
						this.addDebugLog('sendData status 结果: ' + JSON.stringify(ret, null, 2));
						this.handleDeviceInfoResult(ret);
					});
					deviceInfoFound = true;
				}
				
				// 方法3: 基于设备连接成功的事实，推断设备能力
				if (!deviceInfoFound) {
					uni.hideLoading();
					this.addDebugLog('基于连接成功状态推断设备信息...');
				}
				
			} catch (error) {
				uni.hideLoading();
				this.addDebugLog('获取设备信息异常: ' + error.toString());
				
			}
		},
		
		// 处理设备信息获取结果
		handleDeviceInfoResult(ret) {
			this.addDebugLog('处理设备信息获取结果...');
			
			if (ret && ret.success) {
				// 处理设备信息
				this.processDeviceInfo(ret);
			} else {
				this.addDebugLog('获取设备信息失败: ' + (ret ? ret.msg || '未知错误' : '回调数据为空'));
				
			}
		},
		
		// 处理设备信息
		processDeviceInfo(ret) {
			try {
				let deviceInfo = null;
				
				// 尝试解析不同格式的返回数据
				if (ret.data) {
					if (typeof ret.data === 'string') {
						try {
							deviceInfo = JSON.parse(ret.data);
						} catch (e) {
							this.addDebugLog('解析设备信息字符串失败: ' + e.toString());
							deviceInfo = { raw: ret.data };
						}
					} else if (typeof ret.data === 'object') {
						deviceInfo = ret.data;
					}
				} else if (ret.deviceInfo) {
					deviceInfo = ret.deviceInfo;
				}
				
				if (deviceInfo) {
					this.addDebugLog('=== 设备信息解析结果 ===');
					this.addDebugLog('完整设备信息: ' + JSON.stringify(deviceInfo, null, 2));
					
					// 检查是否有prov信息
					if (deviceInfo.prov) {
						const provInfo = deviceInfo.prov;
						this.addDebugLog('--- Provisioning 信息 ---');
						this.addDebugLog(`版本: ${provInfo.ver || '未知'}`);
						this.addDebugLog(`安全版本: ${provInfo.sec_ver || '未知'}`);
						this.addDebugLog(`安全补丁版本: ${provInfo.sec_patch_ver || '未知'}`);
						
						if (provInfo.cap && Array.isArray(provInfo.cap)) {
							this.addDebugLog(`设备能力: [${provInfo.cap.join(', ')}]`);
							
							// 检查设备是否支持WiFi扫描
							if (provInfo.cap.includes('wifi_scan')) {
								this.addDebugLog('✓ 设备支持WiFi扫描功能');
							} else {
								this.addDebugLog('✗ 设备不支持WiFi扫描功能');
							}
							
							// 检查其他能力
							if (provInfo.cap.includes('no_pop')) {
								this.addDebugLog('✓ 设备支持无POP模式');
							}
							if (provInfo.cap.includes('no_sec')) {
								this.addDebugLog('✓ 设备支持无安全模式');
							}
							if (provInfo.cap.includes('ble_transport')) {
								this.addDebugLog('✓ 设备支持BLE传输');
							}
							if (provInfo.cap.includes('wifi_prov')) {
								this.addDebugLog('✓ 设备支持WiFi配网');
							}
						} else {
							this.addDebugLog('设备能力信息不可用');
						}
						
						// 更新连接信息，添加设备能力
						if (this.connectionInfo) {
							this.connectionInfo.deviceCapabilities = provInfo.cap || [];
							this.connectionInfo.provisioningInfo = provInfo;
							this.connectionInfo.fullDeviceInfo = deviceInfo;
						}
						
						// 显示成功提示
						const isInferred = ret.inferred || false;
						uni.showToast({
							title: isInferred ? '设备信息推断完成' : '设备信息获取成功',
							icon: isInferred ? 'none' : 'success',
							duration: 2000
						});
						
					} else {
						this.addDebugLog('未找到prov信息，可能是设备信息格式不标准');
						this.addDebugLog('尝试查找其他格式的设备信息...');
						
						// 检查是否有其他应用信息
						Object.keys(deviceInfo).forEach(key => {
							if (key !== 'prov') {
								this.addDebugLog(`发现应用信息 "${key}": ${JSON.stringify(deviceInfo[key])}`);
							}
						});
					}
				} else {
					this.addDebugLog('无法解析设备信息数据');
				}
				
				this.addDebugLog('=== 设备信息处理完成 ===');
				
			} catch (error) {
				this.addDebugLog('处理设备信息时发生错误: ' + error.toString());
			}
		},
		
		// 设置POP
		setProofOfPossession() {
			if (!this.popValue) {
				uni.showToast({
					title: '请输入安全密钥',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '设置中...'
			});
			
			blueModule.setProofOfPossession({
				pop: this.popValue
			}, (ret) => {
				uni.hideLoading();
				this.addDebugLog('POP设置结果: ' + JSON.stringify(ret));
				
				if (ret.success) {
					// 检查是否有错误信息
					if (ret.data && ret.data.includes('failed')) {
						this.addDebugLog('POP设置可能有问题，但继续下一步: ' + ret.data);
						uni.showModal({
							title: '提示',
							content: 'POP设置可能有问题，是否继续WiFi配置？',
							success: (res) => {
								if (res.confirm) {
									this.currentStep = 2;
								}
							}
						});
					} else {
						uni.showToast({
							title: '设置成功',
							icon: 'success'
						});
						this.currentStep = 2;
					}
				} else {
					uni.showToast({
						title: '设置失败',
						icon: 'none'
					});
					// 即使失败也提供继续的选项
					uni.showModal({
						title: '设置失败',
						content: '是否跳过POP设置直接进行WiFi配置？',
						success: (res) => {
							if (res.confirm) {
								this.currentStep = 2;
							}
						}
					});
				}
			});
		},
		
		// 扫描WiFi
		scanWifiNetworks() {
			this.addDebugLog('开始扫描WiFi网络...');
			
			uni.showLoading({
				title: '扫描中...'
			});
			
			try {
				blueModule.scanNetworks((ret) => {
					console.log('WiFi扫描回调:', ret);
					uni.hideLoading();
					
					// 记录详细的回调信息
					this.addDebugLog('WiFi扫描回调: ' + JSON.stringify(ret, null, 2));
					
					if (ret && ret.success) {
						this.addDebugLog('扫描成功，处理返回数据...');
						
						// 处理不同的消息类型和数据格式
						let wifiData = null;
						
						if (ret.msg === 'onWifiListReceived' && ret.data) {
							wifiData = ret.data;
							this.addDebugLog('收到onWifiListReceived消息，数据: ' + JSON.stringify(ret.data));
						} else if (ret.data) {
							wifiData = ret.data;
							this.addDebugLog('收到其他格式数据: ' + JSON.stringify(ret.data));
						} else if (ret.wifiList) {
							wifiData = ret.wifiList;
							this.addDebugLog('收到wifiList数据: ' + JSON.stringify(ret.wifiList));
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
							
							this.addDebugLog(`处理后的WiFi列表长度: ${this.wifiList.length}`);
							
							if (this.wifiList.length === 0) {
								uni.showToast({
									title: '未发现可用网络',
									icon: 'none'
								});
								this.addDebugLog('WiFi列表为空');
							} else {
								uni.showToast({
									title: `发现 ${this.wifiList.length} 个网络`,
									icon: 'success'
								});
								this.addDebugLog(`成功发现 ${this.wifiList.length} 个WiFi网络`);
								
								// 打印转换后的WiFi信息
								this.wifiList.forEach((wifi, index) => {
									this.addDebugLog(`转换后WiFi ${index + 1}: ${JSON.stringify(wifi)}`);
								});
							}
						} else {
							this.addDebugLog('未找到有效的WiFi数据');
							uni.showToast({
								title: '未发现可用网络',
								icon: 'none'
							});
						}
					} else {
						this.addDebugLog('扫描失败: ' + (ret ? ret.msg || '未知错误' : '回调数据为空'));
						uni.showToast({
							title: ret && ret.msg ? ret.msg : '扫描失败',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				uni.hideLoading();
				this.addDebugLog('扫描WiFi异常: ' + error.toString());
				uni.showToast({
					title: '扫描异常',
					icon: 'none'
				});
			}
		},
		
		// 选择WiFi
		selectWifi(wifi) {
			this.ssidValue = wifi.ssid;
			// 如果是开放网络，清空密码
			if (wifi.auth === 0) {
				this.passwordValue = '';
			}
		},
		
		// 开始配网
		startProvisioning() {
			if (!this.ssidValue) {
				uni.showToast({
					title: '请输入WiFi名称',
					icon: 'none'
				});
				return;
			}
			
			if (this.isProvisioning) return;
			this.isProvisioning = true;
			
			uni.showLoading({
				title: '配网中...'
			});
			
			blueModule.doProvisioning({
				ssidValue: this.ssidValue,
				passphraseValue: this.passwordValue
			}, (ret) => {
				this.isProvisioning = false;
				this.addDebugLog('配网结果: ' + JSON.stringify(ret));
				
				if (ret.success) {
					uni.hideLoading();
					uni.showToast({
						title: '配网成功',
						icon: 'success'
					});
					this.currentStep = 3;
				} else if (ret.msg && ret.msg.includes('progress')) {
					// 更新进度提示
					uni.showLoading({
						title: '配网中... ' + (ret.progress || '')
					});
				} else {
					uni.hideLoading();
					uni.showToast({
						title: ret.msg || '配网失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 断开连接
		disconnectDevice() {
			uni.showModal({
				title: '提示',
				content: '确定要断开连接吗？',
				success: (res) => {
					if (res.confirm) {
						blueModule.disconnectDevice();
						uni.navigateBack();
					}
				}
			});
		},
		
		// 完成配置
		finishConfig() {
			uni.navigateBack({
				delta: 2
			});
		},
		
		// WiFi信号图标
		getWifiSignalIcon(rssi) {
			if (!rssi && rssi !== 0) return '📶';
			
			// 根据信号强度返回不同的图标
			if (rssi >= -50) return '📶'; // 强信号
			if (rssi >= -70) return '📶'; // 中等信号  
			if (rssi >= -80) return '📶'; // 弱信号
			return '📶'; // 很弱信号
		},
		
		// 添加调试日志
		addDebugLog(log) {
			const time = new Date().toLocaleTimeString();
			this.debugLog += `[${time}] ${log}\n`;
		},
		
		// 切换调试状态
		toggleDebug() {
			this.showDebug = !this.showDebug;
		},
		
		// 复制调试日志
		copyDebugLog() {
			uni.setClipboardData({
				data: this.debugLog,
				success: () => {
					uni.showToast({
						title: '日志已复制到剪贴板',
						icon: 'success'
					});
				},
				fail: (error) => {
					uni.showToast({
						title: '复制日志失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 清空调试日志
		clearDebugLog() {
			this.debugLog = '';
			uni.showToast({
				title: '调试日志已清空',
				icon: 'success'
			});
		},
		
		// 测试WiFi扫描
		testWifiScan() {
			this.addDebugLog('开始测试WiFi扫描...');
			this.scanWifiNetworks();
		},
		
		// 测试获取设备信息
		testGetDeviceInfo() {
			this.addDebugLog('开始测试获取设备信息...');
			this.getDeviceInfo();
		},
		
		// 设置事件监听器来捕获设备信息
		setupEventListeners() {
			// 监听可能的设备信息事件
			const eventTypes = ['deviceInfo', 'versionInfo', 'capabilities', 'protoVer', 'deviceConnected'];
			
			eventTypes.forEach(eventType => {
				try {
					blueModule.addEventListener(eventType, (ret) => {
						this.addDebugLog(`${eventType} 事件结果222: ` + JSON.stringify(ret, null, 2));
						if (ret && (ret.success || ret.data || ret.prov)) {
							this.handleDeviceInfoResult(ret);
						}
					});
					this.addDebugLog(`已添加 ${eventType} 事件监听器`);
				} catch (e) {
					this.addDebugLog(`添加 ${eventType} 事件监听器失败: ${e.toString()}`);
				}
			});
		}
	}
}
</script>

<style>
.config-container {
	min-height: 100vh;
	background-color: #f5f7fa;
}

/* 设备头部信息 */
.device-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	padding: 40rpx 30rpx;
	text-align: center;
}

.device-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.device-name {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.device-id {
	font-size: 24rpx;
	opacity: 0.8;
	display: block;
	margin-bottom: 20rpx;
}

.connection-status {
	display: inline-flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.2);
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	background: #10b981;
	border-radius: 50%;
	margin-right: 10rpx;
	animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
	0% {
		box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
	}
	70% {
		box-shadow: 0 0 0 10rpx rgba(16, 185, 129, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
	}
}

.status-text {
	font-size: 24rpx;
}

/* 连接信息卡片 */
.connection-info-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
	transition: all 0.3s ease;
	padding: 30rpx;
}

.info-header {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.info-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #666;
	margin-right: 15rpx;
}

.connection-badge {
	background: #e5e7eb;
	border-radius: 15rpx;
	padding: 5rpx 10rpx;
}

.connection-badge.success {
	background: #10b981;
}

.connection-badge.success .badge-text {
	color: #fff;
}

.connection-badge.error {
	background: #ef4444;
}

.connection-badge.error .badge-text {
	color: #fff;
}

.badge-text {
	font-size: 24rpx;
	font-weight: bold;
	color: #333;
}

.info-content {
	margin-bottom: 20rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.info-label {
	font-size: 28rpx;
	color: #666;
}

.info-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.info-value.error-text {
	color: #ef4444;
}

.services-section {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #e5e7eb;
}

.services-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
}

.service-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 5rpx;
}

.service-uuid {
	font-size: 28rpx;
	color: #666;
}

.service-type {
	font-size: 24rpx;
	color: #999;
}

/* 配置步骤 */
.config-steps {
	padding: 30rpx;
}

.step-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
	transition: all 0.3s ease;
}

.step-card.active {
	box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.2);
}

.step-header {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background: #fafbfc;
}

.step-number {
	width: 50rpx;
	height: 50rpx;
	background: #e5e7eb;
	color: #9ca3af;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	margin-right: 20rpx;
	transition: all 0.3s ease;
}

.step-card.active .step-number {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
}

.step-number.completed {
	background: #10b981;
	color: #fff;
}

.step-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.step-content {
	padding: 30rpx;
}

/* 输入框样式 */
.input-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 15rpx;
	display: block;
}

.config-input {
	width: 100%;
	height: 90rpx;
	background: #f5f7fa;
	border: 2rpx solid #e5e7eb;
	border-radius: 15rpx;
	padding: 0 30rpx;
	font-size: 30rpx;
	margin-bottom: 20rpx;
	box-sizing: border-box;
}

.config-input:focus {
	border-color: #667eea;
	background: #fff;
}

.input-tip {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 30rpx;
}

/* 按钮样式 */
.primary-button {
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.primary-button:active {
	transform: scale(0.98);
}

.secondary-button {
	width: 100%;
	height: 80rpx;
	background: #fff;
	color: #666;
	border: 2rpx solid #e5e7eb;
	border-radius: 40rpx;
	font-size: 30rpx;
}

/* WiFi扫描按钮 */
.scan-wifi-button {
	width: 100%;
	height: 80rpx;
	background: #667eea !important;
	border: 2rpx solid #667eea;
	border-radius: 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30rpx;
	color: #fff;
	cursor: pointer;
}

.scan-wifi-button:active {
	background: #5a6fd8 !important;
	transform: scale(0.98);
}

.scan-wifi-icon {
	font-size: 36rpx;
	margin-right: 15rpx;
	color: #fff !important;
}

.scan-wifi-text {
	font-size: 28rpx;
	color: #fff !important;
}

/* WiFi列表 */
.wifi-list {
	margin-bottom: 30rpx;
	max-height: 400rpx;
	overflow-y: auto;
}

.wifi-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx;
	background: #fff;
	border: 2rpx solid #e5e7eb;
	border-radius: 15rpx;
	margin-bottom: 15rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.wifi-item:active {
	background: #f0f9ff;
	border-color: #667eea;
}

.wifi-name {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.wifi-signal {
	display: flex;
	align-items: center;
}

.signal-icon {
	font-size: 32rpx;
	color: #667eea;
}

/* 手动输入区域 */
.manual-input {
	padding-top: 20rpx;
	border-top: 2rpx solid #e5e7eb;
}

/* 成功状态 */
.step-content.success {
	text-align: center;
	padding: 60rpx 30rpx;
}

.success-icon {
	font-size: 100rpx;
	display: block;
	margin-bottom: 30rpx;
}

.success-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 15rpx;
}

.success-tip {
	font-size: 28rpx;
	color: #666;
	display: block;
	margin-bottom: 40rpx;
}

/* 底部操作 */
.bottom-actions {
	padding: 30rpx;
}

/* 调试信息 */
.debug-info {
	margin: 30rpx;
	padding: 20rpx;
	background: #f5f7fa;
	border-radius: 15rpx;
}

.debug-header {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.debug-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #666;
	margin-right: 15rpx;
}

.debug-actions {
	display: flex;
	align-items: center;
}

.debug-btn {
	background: #fff;
	border: 2rpx solid #e5e7eb;
	border-radius: 15rpx;
	padding: 10rpx 20rpx;
	margin-left: 10rpx;
}

.debug-btn:active {
	background: #f0f9ff;
}

.debug-content {
	width: 100%;
	height: 200rpx;
	background: #fff;
	border: 2rpx solid #e5e7eb;
	border-radius: 10rpx;
	padding: 15rpx;
	font-size: 24rpx;
	color: #666;
	box-sizing: border-box;
}

/* 调试开关 */
.debug-toggle {
	background: #fff;
	border: 2rpx solid #e5e7eb;
	border-radius: 15rpx;
	padding: 10rpx 20rpx;
	margin-top: 20rpx;
	margin-left: auto;
}

.debug-text {
	font-size: 28rpx;
	color: #666;
	font-weight: bold;
}

/* 测试扫描按钮 */
.debug-btn.test-btn {
	background: #667eea;
	color: #fff;
}

.debug-btn.test-btn:active {
	background: #5a6fd8;
}

/* 跳转到步骤2按钮 */
.debug-btn.step-btn {
	background: #667eea;
	color: #fff;
}

.debug-btn.step-btn:active {
	background: #5a6fd8;
}

/* 原始数据展示区域 */
.raw-data-section {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #e5e7eb;
}

.raw-data-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	display: block;
}

.raw-data-content {
	background: #f8f9fa;
	border: 2rpx solid #e5e7eb;
	border-radius: 10rpx;
	padding: 15rpx;
	max-height: 300rpx;
	overflow-y: auto;
}

.raw-data-text {
	font-size: 24rpx;
	color: #666;
	font-family: 'Courier New', monospace;
	line-height: 1.4;
	word-break: break-all;
}

/* 设备能力信息 */
.capabilities-section {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #e5e7eb;
}

.capabilities-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	display: block;
}

.capability-tags {
	display: flex;
	flex-wrap: wrap;
}

.capability-tag {
	background: #f0f9ff;
	border: 2rpx solid #e5e7eb;
	border-radius: 15rpx;
	padding: 5rpx 10rpx;
	margin-right: 10rpx;
	margin-bottom: 10rpx;
}

.capability-text {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

/* Provisioning 详细信息 */
.prov-info-section {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #e5e7eb;
}

.prov-info-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
	display: block;
}

.prov-info-content {
	display: flex;
	flex-wrap: wrap;
}

.prov-info-item {
	width: 50%;
	margin-bottom: 10rpx;
}

.prov-label {
	font-size: 28rpx;
	color: #666;
}

.prov-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}
</style> 