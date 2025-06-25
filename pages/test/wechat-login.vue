<template>
	<view class="test-page">
		<view class="test-header">
			<text class="test-title">微信登录测试</text>
		</view>
		
		<view class="test-content">
			<!-- 状态显示 -->
			<view class="status-section">
				<text class="section-title">当前状态</text>
				<view class="status-item">
					<text>环境: {{ currentPlatform }}</text>
				</view>
				<view class="status-item">
					<text>微信安装状态: {{ wechatInstalled ? '已安装' : '未安装' }}</text>
				</view>
				<view class="status-item">
					<text>登录状态: {{ loginStatus }}</text>
				</view>
			</view>
			
			<!-- 测试按钮 -->
			<view class="test-buttons">
				<button 
					class="test-btn check-btn" 
					@click="checkWechatStatus"
					:disabled="checking"
				>
					{{ checking ? '检查中...' : '检查微信状态' }}
				</button>
				
				<button 
					class="test-btn detailed-check-btn" 
					@click="checkWechatDetailedStatus"
					:disabled="detailedChecking"
				>
					{{ detailedChecking ? '检查中...' : '详细状态检查' }}
				</button>
				
				<button 
					class="test-btn auth-btn" 
					@click="testWechatAuth"
					:disabled="authing"
				>
					{{ authing ? '授权中...' : '测试微信授权' }}
				</button>
				
				<button 
					class="test-btn login-btn" 
					@click="testWechatLogin"
					:disabled="logging"
				>
					{{ logging ? '登录中...' : '测试完整登录流程' }}
				</button>
				
				<button 
					class="test-btn config-btn" 
					@click="runDiagnostic"
					:disabled="diagnosing"
				>
					{{ diagnosing ? '诊断中...' : '运行配置诊断' }}
				</button>
				
				<button 
					class="test-btn signature-btn" 
					@click="getSignature"
					:disabled="gettingSignature"
				>
					{{ gettingSignature ? '获取中...' : '获取应用签名' }}
				</button>
				
				<button 
					class="test-btn simple-auth-btn" 
					@click="testSimpleAuth"
					:disabled="simpleAuthing"
				>
					{{ simpleAuthing ? '测试中...' : '超简化授权测试' }}
				</button>
				
				<button 
					class="test-btn clear-btn" 
					@click="clearLogs"
				>
					清空日志
				</button>
				
				<button 
					class="test-btn package-btn" 
					@click="getCurrentPackageName"
				>
					获取当前包名
				</button>
			</view>
			
			<!-- 日志显示 -->
			<view class="log-section">
				<text class="section-title">执行日志</text>
				<scroll-view 
					class="log-container" 
					scroll-y="true"
					:scroll-top="scrollTop"
				>
					<view 
						v-for="(log, index) in logs" 
						:key="index" 
						class="log-item"
						:class="log.type"
					>
						<text class="log-time">{{ log.time }}</text>
						<text class="log-content">{{ log.message }}</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import WechatAuth from '@/utils/wechat-auth.js'
	import SimpleWechatAuth from '@/utils/wechat-auth-simple.js'
	import WechatConfigChecker from '@/utils/wechat-config-checker.js'
	import { getAppSignature } from '@/utils/get-signature.js'
	import http from '@/utils/request.js'
	
	export default {
		data() {
			return {
				currentPlatform: '',
				wechatInstalled: false,
				loginStatus: '未登录',
				checking: false,
				detailedChecking: false,
				authing: false,
				logging: false,
				diagnosing: false,
				gettingSignature: false,
				simpleAuthing: false,
				logs: [],
				scrollTop: 0
			}
		},
		
		mounted() {
			this.initPlatform();
			this.addLog('页面初始化完成', 'info');
		},
		
		methods: {
			// 初始化平台信息
			initPlatform() {
				// #ifdef APP-PLUS
				this.currentPlatform = 'APP';
				// #endif
				
				// #ifdef MP-WEIXIN
				this.currentPlatform = '微信小程序';
				// #endif
				
				// #ifdef H5
				this.currentPlatform = 'H5';
				// #endif
				
				// #ifndef APP-PLUS || MP-WEIXIN || H5
				this.currentPlatform = '其他平台';
				// #endif
				
				this.addLog(`当前平台: ${this.currentPlatform}`, 'info');
			},
			
			// 检查微信状态
			async checkWechatStatus() {
				this.checking = true;
				this.addLog('开始检查微信状态...', 'info');
				
				try {
					const installed = await WechatAuth.checkWechatInstalled();
					this.wechatInstalled = installed;
					this.addLog(`微信安装状态: ${installed ? '已安装' : '未安装'}`, installed ? 'success' : 'error');
				} catch (error) {
					this.addLog(`检查微信状态失败: ${error.message}`, 'error');
				} finally {
					this.checking = false;
				}
			},
			
			// 详细状态检查
			async checkWechatDetailedStatus() {
				this.detailedChecking = true;
				this.addLog('开始详细状态检查...', 'info');
				
				try {
					const status = await WechatAuth.checkWechatAppStatus();
					this.addLog('微信应用详细状态:', 'info');
					this.addLog(`- 安装状态: ${status.installed}`, status.installed ? 'success' : 'error');
					this.addLog(`- 服务ID: ${status.serviceId || 'N/A'}`, 'info');
					this.addLog(`- 描述: ${status.description || 'N/A'}`, 'info');
					this.addLog(`- 客户端状态: ${status.nativeClient}`, 'info');
					this.addLog(`- 平台: ${status.platform || 'N/A'}`, 'info');
					this.addLog(`- 版本: ${status.version || 'N/A'}`, 'info');
					
					if (status.error) {
						this.addLog(`- 错误信息: ${status.error}`, 'error');
					}
					
					// 安卓平台特殊提示
					if (status.platform === 'Android' && status.installed) {
						this.addLog('安卓平台提示: 如果授权无响应，请检查:', 'warning');
						this.addLog('1. 微信应用版本是否为最新', 'warning');
						this.addLog('2. 应用签名是否与微信开放平台配置一致', 'warning');
						this.addLog('3. 包名是否正确配置', 'warning');
					}
					
				} catch (error) {
					this.addLog(`详细状态检查失败: ${error.message}`, 'error');
				} finally {
					this.detailedChecking = false;
				}
			},
			
			// 测试微信授权
			async testWechatAuth() {
				this.authing = true;
				this.addLog('开始测试微信授权...', 'info');
				
				try {
					const authResult = await WechatAuth.getWechatAuth();
					this.addLog('微信授权成功', 'success');
					this.addLog(`授权结果: ${JSON.stringify(authResult, null, 2)}`, 'info');
				} catch (error) {
					this.addLog(`微信授权失败: ${error.message}`, 'error');
				} finally {
					this.authing = false;
				}
			},
			
			// 测试完整登录流程
			async testWechatLogin() {
				this.logging = true;
				this.addLog('开始测试完整微信登录流程...', 'info');
				
				try {
					// 步骤1: 微信授权
					this.addLog('步骤1: 获取微信授权...', 'info');
					const authResult = await WechatAuth.login();
					this.addLog('微信授权成功', 'success');
					this.addLog(`授权数据: ${JSON.stringify(authResult, null, 2)}`, 'info');
					
					// 步骤2: 调用登录接口
					this.addLog('步骤2: 调用后端登录接口...', 'info');
					const loginResult = await http.post('/auth/wechat', {
						platform: authResult.platform,
						code: authResult.code,
						access_token: authResult.access_token,
						openid: authResult.openid,
						unionid: authResult.unionid,
						userInfo: authResult.userInfo
					});
					
					if (loginResult.code === 0) {
						this.loginStatus = '登录成功';
						this.addLog('登录成功!', 'success');
						this.addLog(`用户信息: ${JSON.stringify(loginResult.data, null, 2)}`, 'info');
						
						// 保存登录信息
						uni.setStorageSync('token', loginResult.data.token);
						if (loginResult.data.userInfo) {
							uni.setStorageSync('userInfo', loginResult.data.userInfo);
						}
					} else {
						this.addLog(`登录失败: ${loginResult.msg || '未知错误'}`, 'error');
					}
					
				} catch (error) {
					this.loginStatus = '登录失败';
					this.addLog(`登录流程失败: ${error.message}`, 'error');
				} finally {
					this.logging = false;
				}
			},
			
			// 添加日志
			addLog(message, type = 'info') {
				const time = new Date().toLocaleTimeString();
				this.logs.push({
					time,
					message,
					type
				});
				
				// 自动滚动到底部
				this.$nextTick(() => {
					this.scrollTop = this.logs.length * 50;
				});
				
				console.log(`[${type.toUpperCase()}] ${time} - ${message}`);
			},
			
			// 运行配置诊断
			async runDiagnostic() {
				this.diagnosing = true;
				this.addLog('开始运行配置诊断...', 'info');
				
				try {
					const report = await WechatConfigChecker.generateDiagnosticReport();
					
					this.addLog('=== 配置诊断报告 ===', 'info');
					this.addLog(`整体状态: ${report.overallStatus}`, 
						report.overallStatus === 'healthy' ? 'success' : 
						report.overallStatus === 'critical' ? 'error' : 'info'
					);
					
					// 应用配置信息
					this.addLog(`平台: ${report.appConfig.platform}`, 'info');
					this.addLog(`应用ID: ${report.appConfig.appId}`, 'info');
					this.addLog(`微信AppID: ${report.appConfig.wechatAppId}`, 'info');
					
					// 微信服务状态
					this.addLog(`微信服务可用: ${report.wechatService.serviceAvailable}`, 
						report.wechatService.serviceAvailable ? 'success' : 'error');
					this.addLog(`微信已安装: ${report.wechatService.wechatInstalled}`, 
						report.wechatService.wechatInstalled ? 'success' : 'error');
					
					// 网络状态
					this.addLog(`网络连接: ${report.networkStatus.connected}`, 
						report.networkStatus.connected ? 'success' : 'error');
					this.addLog(`网络类型: ${report.networkStatus.networkType}`, 'info');
					
					// 关键问题
					if (report.criticalIssues.length > 0) {
						this.addLog('=== 关键问题 ===', 'error');
						report.criticalIssues.forEach((issue, index) => {
							this.addLog(`${index + 1}. ${issue}`, 'error');
						});
					}
					
					// 建议解决方案
					if (report.allRecommendations.length > 0) {
						this.addLog('=== 建议解决方案 ===', 'info');
						report.allRecommendations.forEach((rec, index) => {
							this.addLog(`${index + 1}. ${rec}`, 'info');
						});
					}
					
					// 也在控制台输出完整报告
					WechatConfigChecker.printDiagnosticReport(report);
					
				} catch (error) {
					this.addLog(`配置诊断失败: ${error.message}`, 'error');
				} finally {
					this.diagnosing = false;
				}
			},
			
			// 获取应用签名
			async getSignature() {
				this.gettingSignature = true;
				this.addLog('开始获取应用签名...', 'info');
				
				try {
					const signatureInfo = await getAppSignature();
					this.addLog('=== 应用签名信息 ===', 'success');
					this.addLog(`包名: ${signatureInfo.packageName}`, 'info');
					this.addLog(`MD5签名: ${signatureInfo.signature}`, 'info');
					this.addLog(`格式化签名: ${signatureInfo.signatureFormatted}`, 'info');
					
					this.addLog('=== 解决方案 ===', 'error');
					this.addLog('1. 复制上面的MD5签名', 'error');
					this.addLog('2. 登录微信开放平台 (open.weixin.qq.com)', 'error');
					this.addLog('3. 找到您的安卓应用配置', 'error');
					this.addLog('4. 更新应用签名为上面显示的MD5值', 'error');
					this.addLog('5. 重新打包安装应用测试', 'error');
					
				} catch (error) {
					this.addLog(`获取签名失败: ${error.message}`, 'error');
				} finally {
					this.gettingSignature = false;
				}
			},
			
			// 超简化授权测试
			async testSimpleAuth() {
				this.simpleAuthing = true;
				this.addLog('=== 开始超简化授权测试 ===', 'info');
				this.addLog('这个测试专门解决安卓authorize无响应问题', 'warning');
				
				try {
					const result = await SimpleWechatAuth.simpleAuth();
					this.addLog('🎉 超简化授权成功!', 'success');
					this.addLog(`结果: ${JSON.stringify(result, null, 2)}`, 'success');
				} catch (error) {
					this.addLog(`超简化授权失败: ${error.message}`, 'error');
				} finally {
					this.simpleAuthing = false;
				}
			},
			
			// 清空日志
			clearLogs() {
				this.logs = [];
				this.scrollTop = 0;
				this.addLog('日志已清空', 'info');
			},
			
			/**
			 * 获取当前应用的实际包名
			 */
			async getCurrentPackageName() {
				this.addLog('开始获取当前应用包名...', 'info');
				
				try {
					// #ifdef APP-PLUS
					if (plus.runtime) {
						const appInfo = plus.runtime.appinfo;
						const uniAppId = plus.runtime.appid; // uni-app内部ID
						
						this.addLog('=== 应用包名信息 ===', 'info');
						this.addLog(`uni-app ID: ${uniAppId}`, 'info');
						
						// 获取真实的Android包名
						let realPackageName = 'unknown';
						try {
							// 使用签名工具获取真实包名
							const signatureTool = new GetSignature();
							const packageInfo = await signatureTool.getPackageInfo();
							realPackageName = packageInfo.packageName;
							this.addLog(`真实包名: ${realPackageName}`, 'success');
						} catch (error) {
							this.addLog(`获取真实包名失败: ${error.message}`, 'warning');
							this.addLog('注意：plus.runtime.appid返回的是uni-app内部ID，不是真实包名', 'warning');
						}
						
						this.addLog(`应用名称: ${appInfo ? appInfo.name : '未知'}`, 'info');
						this.addLog(`版本号: ${appInfo ? appInfo.version : '未知'}`, 'info');
						
						// 检查真实包名
						if (realPackageName === 'com.lumi.app') {
							this.addLog('⚠️ 警告：当前使用的是旧包名 com.lumi.app', 'warning');
							this.addLog('如果微信开放平台配置的是新包名，需要更新应用包名', 'warning');
						} else if (realPackageName === 'com.namyvera.app') {
							this.addLog('✅ 当前使用新包名 com.namyvera.app', 'success');
							this.addLog('请确保微信开放平台配置了这个包名', 'info');
						} else if (realPackageName !== 'unknown') {
							this.addLog(`当前包名: ${realPackageName}`, 'info');
							this.addLog('请确保此包名已在微信开放平台正确配置', 'warning');
						}
						
						// 获取更多系统信息
						const platform = uni.getSystemInfoSync();
						this.addLog(`=== 系统信息 ===`, 'info');
						this.addLog(`平台: ${platform.platform}`, 'info');
						this.addLog(`系统版本: ${platform.system}`, 'info');
						this.addLog(`应用版本: ${platform.appVersion}`, 'info');
						this.addLog(`设备品牌: ${platform.brand}`, 'info');
						
						return realPackageName;
					} else {
						this.addLog('❌ plus.runtime 不可用', 'error');
					}
					// #endif
					
					// #ifndef APP-PLUS
					this.addLog('❌ 此功能仅在APP中可用', 'error');
					// #endif
					
				} catch (error) {
					this.addLog(`❌ 获取包名失败: ${error.message}`, 'error');
					console.error('获取包名失败:', error);
				}
			},

			/**
			 * 检查配置诊断
			 */
			async checkConfiguration() {
				this.addLog('开始配置诊断...', 'info');
				
				try {
					// 先获取包名
					const packageName = await this.getCurrentPackageName();
					
					const configChecker = new WechatConfigChecker();
					const report = await configChecker.generateDiagnosticReport();
					
					this.addLog('=== 配置诊断报告 ===', 'info');
					this.addLog(`微信安装状态: ${report.wechatInstalled ? '✅ 已安装' : '❌ 未安装'}`, 
						report.wechatInstalled ? 'success' : 'error');
					this.addLog(`网络状态: ${report.networkConnected ? '✅ 已连接' : '❌ 未连接'}`, 
						report.networkConnected ? 'success' : 'error');
					this.addLog(`微信服务: ${report.wechatServiceAvailable ? '✅ 可用' : '❌ 不可用'}`, 
						report.wechatServiceAvailable ? 'success' : 'error');
					
					if (report.error) {
						this.addLog(`配置错误: ${report.error}`, 'error');
					}
					
					// 提供包名相关建议
					this.addLog('=== 包名配置建议 ===', 'info');
					this.addLog('1. 确保微信开放平台中配置的包名与当前应用包名一致', 'warning');
					this.addLog('2. 确保应用签名与微信开放平台中配置的签名一致', 'warning');
					this.addLog('3. 如果更改了包名，需要重新在微信开放平台配置', 'warning');
					
				} catch (error) {
					this.addLog(`❌ 配置检查失败: ${error.message}`, 'error');
					console.error('配置检查失败:', error);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.test-page {
		padding: 40rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.test-header {
		text-align: center;
		margin-bottom: 40rpx;
		
		.test-title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
		}
	}
	
	.test-content {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
	}
	
	.status-section {
		margin-bottom: 40rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.status-item {
			margin-bottom: 15rpx;
			padding: 15rpx;
			background-color: #f8f9fa;
			border-radius: 10rpx;
			
			text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
	
	.test-buttons {
		margin-bottom: 40rpx;
		
		.test-btn {
			width: 100%;
			margin-bottom: 20rpx;
			height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			border: none;
			
			&.check-btn {
				background-color: #007AFF;
				color: white;
			}
			
			&.detailed-check-btn {
				background-color: #5856D6;
				color: white;
			}
			
			&.auth-btn {
				background-color: #5CC928;
				color: white;
			}
			
			&.login-btn {
				background-color: #6D5BE3;
				color: white;
			}
			
			&.config-btn {
				background-color: #FF9500;
				color: white;
			}
			
			&.signature-btn {
				background-color: #34C759;
				color: white;
			}
			
			&.simple-auth-btn {
				background-color: #FF2D92;
				color: white;
				font-weight: bold;
			}
			
			&.clear-btn {
				background-color: #FF3B30;
				color: white;
			}
			
			&.package-btn {
				background-color: #FF9500;
				color: white;
			}
			
			&:disabled {
				opacity: 0.6;
			}
		}
	}
	
	.log-section {
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.log-container {
			height: 600rpx;
			border: 1px solid #e0e0e0;
			border-radius: 10rpx;
			padding: 20rpx;
			background-color: #fafafa;
			
			.log-item {
				margin-bottom: 15rpx;
				padding: 10rpx;
				border-radius: 6rpx;
				
				&.info {
					background-color: #e3f2fd;
					border-left: 4px solid #2196f3;
				}
				
				&.success {
					background-color: #e8f5e8;
					border-left: 4px solid #4caf50;
				}
				
				&.error {
					background-color: #ffebee;
					border-left: 4px solid #f44336;
				}
				
				&.warning {
					background-color: #fff8e1;
					border-left: 4px solid #ff9800;
				}
				
				.log-time {
					font-size: 24rpx;
					color: #999;
					margin-right: 20rpx;
				}
				
				.log-content {
					font-size: 26rpx;
					color: #333;
					word-break: break-all;
				}
			}
		}
	}
</style> 