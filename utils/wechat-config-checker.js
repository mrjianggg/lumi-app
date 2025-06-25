/**
 * 微信配置检查工具
 * 用于诊断微信登录配置问题
 */
class WechatConfigChecker {
	
	/**
	 * 检查应用配置
	 * @returns {Promise<Object>}
	 */
	async checkAppConfig() {
		const result = {
			platform: '',
			packageName: '',
			appId: '',
			wechatAppId: '',
			manifestConfig: {},
			plusReady: false,
			issues: [],
			recommendations: []
		};
		
		try {
			// 检查平台信息
			// #ifdef APP-PLUS
			result.platform = plus.os.name || 'Unknown';
			result.plusReady = true;
			
			// 获取应用信息
			if (plus.runtime) {
				result.packageName = plus.runtime.appid || '';
				result.appId = plus.runtime.appid || '';
			}
			
			// 检查manifest配置
			// 注意：这里需要根据实际的manifest配置来获取
			const manifestInfo = await this.getManifestInfo();
			result.manifestConfig = manifestInfo;
			result.wechatAppId = manifestInfo.wechatAppId || '';
			
			// #endif
			
			// #ifdef MP-WEIXIN
			result.platform = '微信小程序';
			// #endif
			
			// #ifndef APP-PLUS || MP-WEIXIN
			result.platform = 'H5或其他';
			result.issues.push('当前平台不支持微信登录');
			// #endif
			
		} catch (error) {
			result.issues.push(`配置检查失败: ${error.message}`);
		}
		
		return result;
	}
	
	/**
	 * 获取manifest配置信息
	 * @returns {Promise<Object>}
	 */
	async getManifestInfo() {
		// 这里需要根据实际情况获取manifest信息
		// 在实际项目中，可能需要通过其他方式获取配置
		const config = {
			wechatAppId: 'wxb69142fc8e996ffe', // 从您的manifest.json中获取
			packageName: '',
			permissions: []
		};
		
		// #ifdef APP-PLUS
		if (plus.runtime) {
			config.packageName = plus.runtime.appid;
		}
		// #endif
		
		return config;
	}
	
	/**
	 * 检查微信服务状态
	 * @returns {Promise<Object>}
	 */
	async checkWechatService() {
		const result = {
			serviceAvailable: false,
			wechatInstalled: false,
			serviceInfo: null,
			issues: [],
			recommendations: []
		};
		
		try {
			// #ifdef APP-PLUS
			const services = await this.getOAuthServices();
			console.log('可用的OAuth服务:', services);
			
			const wechatService = services.find(service => service.id === 'weixin');
			if (wechatService) {
				result.serviceAvailable = true;
				result.serviceInfo = {
					id: wechatService.id,
					description: wechatService.description,
					nativeClient: wechatService.nativeClient
				};
				
				// 检查微信是否安装
				result.wechatInstalled = !!wechatService.nativeClient;
				
				if (!result.wechatInstalled) {
					result.issues.push('微信客户端未安装');
					result.recommendations.push('请安装微信客户端');
				}
			} else {
				result.issues.push('未找到微信OAuth服务配置');
				result.recommendations.push('请检查manifest.json中的OAuth配置');
			}
			// #endif
			
			// #ifdef MP-WEIXIN
			result.serviceAvailable = true;
			result.wechatInstalled = true;
			// #endif
			
		} catch (error) {
			result.issues.push(`微信服务检查失败: ${error.message}`);
		}
		
		return result;
	}
	
	/**
	 * 获取OAuth服务列表
	 * @returns {Promise<Array>}
	 */
	getOAuthServices() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				resolve(services || []);
			}, (error) => {
				reject(error);
			});
			// #endif
			
			// #ifndef APP-PLUS
			resolve([]);
			// #endif
		});
	}
	
	/**
	 * 检查网络连接
	 * @returns {Promise<Object>}
	 */
	async checkNetworkStatus() {
		const result = {
			connected: false,
			networkType: '',
			issues: [],
			recommendations: []
		};
		
		try {
			const networkInfo = await this.getNetworkType();
			result.networkType = networkInfo.networkType;
			result.connected = networkInfo.networkType !== 'none';
			
			if (!result.connected) {
				result.issues.push('网络未连接');
				result.recommendations.push('请检查网络连接');
			}
		} catch (error) {
			result.issues.push(`网络状态检查失败: ${error.message}`);
		}
		
		return result;
	}
	
	/**
	 * 获取网络类型
	 * @returns {Promise<Object>}
	 */
	getNetworkType() {
		return new Promise((resolve) => {
			uni.getNetworkType({
				success: (res) => {
					resolve(res);
				},
				fail: (error) => {
					resolve({ networkType: 'unknown', error });
				}
			});
		});
	}
	
	/**
	 * 生成诊断报告
	 * @returns {Promise<Object>}
	 */
	async generateDiagnosticReport() {
		console.log('开始生成微信登录诊断报告...');
		
		const report = {
			timestamp: new Date().toISOString(),
			appConfig: await this.checkAppConfig(),
			wechatService: await this.checkWechatService(),
			networkStatus: await this.checkNetworkStatus(),
			overallStatus: 'unknown',
			criticalIssues: [],
			allRecommendations: []
		};
		
		// 汇总所有问题和建议
		const allIssues = [
			...report.appConfig.issues,
			...report.wechatService.issues,
			...report.networkStatus.issues
		];
		
		const allRecommendations = [
			...report.appConfig.recommendations,
			...report.wechatService.recommendations,
			...report.networkStatus.recommendations
		];
		
		// 判断整体状态
		if (allIssues.length === 0) {
			report.overallStatus = 'healthy';
		} else if (allIssues.some(issue => issue.includes('未安装') || issue.includes('不支持') || issue.includes('未找到'))) {
			report.overallStatus = 'critical';
			report.criticalIssues = allIssues.filter(issue => 
				issue.includes('未安装') || issue.includes('不支持') || issue.includes('未找到')
			);
		} else {
			report.overallStatus = 'warning';
		}
		
		report.allRecommendations = [...new Set(allRecommendations)]; // 去重
		
		console.log('微信登录诊断报告:', report);
		return report;
	}
	
	/**
	 * 输出诊断报告到控制台
	 * @param {Object} report 诊断报告
	 */
	printDiagnosticReport(report) {
		console.log('\n=== 微信登录诊断报告 ===');
		console.log(`生成时间: ${report.timestamp}`);
		console.log(`整体状态: ${report.overallStatus}`);
		
		console.log('\n--- 应用配置 ---');
		console.log(`平台: ${report.appConfig.platform}`);
		console.log(`应用ID: ${report.appConfig.appId}`);
		console.log(`微信AppID: ${report.appConfig.wechatAppId}`);
		
		console.log('\n--- 微信服务 ---');
		console.log(`服务可用: ${report.wechatService.serviceAvailable}`);
		console.log(`微信已安装: ${report.wechatService.wechatInstalled}`);
		
		console.log('\n--- 网络状态 ---');
		console.log(`网络连接: ${report.networkStatus.connected}`);
		console.log(`网络类型: ${report.networkStatus.networkType}`);
		
		if (report.criticalIssues.length > 0) {
			console.log('\n--- 关键问题 ---');
			report.criticalIssues.forEach((issue, index) => {
				console.log(`${index + 1}. ${issue}`);
			});
		}
		
		if (report.allRecommendations.length > 0) {
			console.log('\n--- 建议解决方案 ---');
			report.allRecommendations.forEach((rec, index) => {
				console.log(`${index + 1}. ${rec}`);
			});
		}
		
		console.log('\n========================\n');
	}
}

// 导出实例
export default new WechatConfigChecker(); 