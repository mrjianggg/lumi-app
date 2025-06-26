/**
 * 苹果登录授权工具类
 */
class AppleAuth {
	
	/**
	 * 检查苹果登录是否可用
	 * @returns {Promise<boolean>}
	 */
	checkAppleSignInAvailable() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			// 检查iOS版本是否支持苹果登录（iOS 13.0+）
			const osVersion = plus.os.version;
			const iosVersion = parseFloat(osVersion);
			
			if (plus.os.name === 'iOS' && iosVersion >= 13.0) {
				// 检查是否有苹果登录服务
				plus.oauth.getServices((services) => {
					const appleService = services.find(service => service.id === 'apple');
					if (appleService) {
						console.log('苹果登录服务可用');
						resolve(true);
					} else {
						console.log('未找到苹果登录服务');
						resolve(false);
					}
				}, (error) => {
					console.error('获取OAuth服务失败:', error);
					resolve(false);
				});
			} else {
				console.log('当前设备不支持苹果登录 - iOS版本:', iosVersion);
				resolve(false);
			}
			// #endif
			
			// #ifndef APP-PLUS
			console.log('当前环境不支持苹果登录');
			resolve(false);
			// #endif
		});
	}
	
	/**
	 * 获取苹果授权
	 * @returns {Promise<Object>}
	 */
	getAppleAuth() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				console.log('services-------',services);
				const appleService = services.find(service => service.id === 'apple');
				
				if (!appleService) {
					reject(new Error('未找到苹果登录服务'));
					return;
				}
				
				console.log('找到苹果登录服务:', appleService);
				
				// 设置苹果登录授权参数
				const authOptions = {
					// 请求的权限范围
					scope: 'name email',
					// 随机状态参数，用于防止CSRF攻击
					state: 'apple_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
				};
				
				console.log('苹果登录授权参数:', authOptions);
				
				// 设置超时处理
				const timeoutId = setTimeout(() => {
					console.log('苹果登录授权超时');
					reject(new Error('授权超时，请重试'));
				}, 30000); // 30秒超时
				
				// 执行苹果登录授权
				appleService.login((result) => {
					clearTimeout(timeoutId);
					console.log('苹果登录授权成功:', result);
					
					// 解析苹果返回的数据
					const authResult = {
						platform: 'app',
						provider: 'apple',
						// 用户标识符 (sub)
						userIdentifier: result.user || result.userIdentifier,
						// 身份令牌
						identityToken: result.identityToken,
						// 授权码
						authorizationCode: result.authorizationCode,
						// 用户信息（首次登录时可能包含）
						fullName: result.fullName || null,
						email: result.email || null,
						// 真实用户状态
						realUserStatus: result.realUserStatus || 'unknown',
						// 原始结果
						originalResult: result,
						// 时间戳
						timestamp: new Date().toISOString()
					};
					
					resolve(authResult);
					
				}, (error) => {

				}, authOptions);
				
			}, (error) => {
				console.error('获取OAuth服务失败:', error);
				reject(new Error('获取苹果登录服务失败'));
			});
			var appleOauth = null;
			plus.oauth.getServices(function(services) {
				for (var i in services) {
					var service = services[i];
					// 获取苹果授权登录对象，苹果授权登录id 为 'apple' iOS13以下系统，不会返回苹果登录对应的 service
					if (service.id == 'apple') {
						appleOauth = service;
						break;
					}
				}
				if (!appleOauth) {
					reject(new Error('未找到苹果登录服务'));
					return;
				}
				
				console.log('找到苹果登录服务:', appleOauth);
				// 设置超时处理
				const timeoutId = setTimeout(() => {
					console.log('苹果登录授权超时');
					reject(new Error('授权超时请重试'));
				}, 30000); // 30秒超时
				appleOauth.login( function(result){
					clearTimeout(timeoutId);
					console.log('result-------',result);
					// 授权成功
					// 解析苹果返回的数据
					const authResult = {
						platform: 'app',
						provider: 'apple',
						// 用户标识符 (sub)
						userIdentifier: result.user || result.userIdentifier,
						// 身份令牌
						identityToken: result.identityToken,
						// 授权码
						authorizationCode: result.authorizationCode,
						// 用户信息（首次登录时可能包含）
						fullName: result.fullName || null,
						email: result.email || null,
						// 真实用户状态
						realUserStatus: result.realUserStatus || 'unknown',
						// 原始结果
						originalResult: result,
						// 时间戳
						timestamp: new Date().toISOString()
					};
					
					resolve(authResult);
				}, function(error) {
					console.log('error-------',error);
					clearTimeout(timeoutId);
					console.error('苹果登录授权失败:', error);
					
					// 处理不同的错误情况
					let errorMessage = '苹果登录失败';
					if (error.code) {
						switch (error.code) {
							case -1001:
								errorMessage = '用户取消了授权';
								break;
							case -1002:
								errorMessage = '授权请求无效';
								break;
							case -1003:
								errorMessage = '授权请求被拒绝';
								break;
							case -1004:
								errorMessage = '授权请求失败';
								break;
							default:
								errorMessage = error.message || '未知错误';
						}
					}
					
					reject(new Error(errorMessage));
				// 登录授权失败
				// err.code是错误码
				}, {
					// 默认只会请求用户名字信息，如需请求用户邮箱信息，需要设置 scope: 'email'
					scope: 'email'
				})
			}, function(error) {
				clearTimeout(timeoutId);
				console.error('苹果登录授权失败:', error);
				
				// 处理不同的错误情况
				let errorMessage = '苹果登录失败';
				if (error.code) {
					switch (error.code) {
						case -1001:
							errorMessage = '用户取消了授权';
							break;
						case -1002:
							errorMessage = '授权请求无效';
							break;
						case -1003:
							errorMessage = '授权请求被拒绝';
							break;
						case -1004:
							errorMessage = '授权请求失败';
							break;
						default:
							errorMessage = error.message || '未知错误';
					}
				}
				
				reject(new Error(errorMessage));
			
			})

			// #endif
			
			// #ifndef APP-PLUS
			reject(new Error('当前环境不支持苹果登录'));
			// #endif
		});
	}
	
	/**
	 * 苹果登录主方法
	 * @returns {Promise<Object>}
	 */
	async login() {
		try {
			console.log('开始苹果登录流程...');
			
			// 1. 检查苹果登录是否可用
			const isAvailable = await this.checkAppleSignInAvailable();
			if (!isAvailable) {
				throw new Error('当前设备不支持苹果登录或未配置苹果登录服务');
			}
			
			// 2. 获取苹果授权
			const authResult = await this.getAppleAuth();
			
			console.log('苹果登录成功，获取到授权信息:', authResult);
			return authResult;
			
		} catch (error) {
			console.error('苹果登录失败:', error);
			throw error;
		}
	}
	
	/**
	 * 验证身份令牌（客户端简单验证）
	 * @param {string} identityToken 身份令牌
	 * @returns {Object|null} 解析的令牌信息
	 */
	parseIdentityToken(identityToken) {
		try {
			if (!identityToken) return null;
			
			// JWT 由三部分组成，用点分隔
			const parts = identityToken.split('.');
			if (parts.length !== 3) return null;
			
			// 解码 payload 部分（第二部分）
			const payload = parts[1];
			// 添加必要的填充
			const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
			
			// Base64URL 解码
			const decodedPayload = uni.base64ToArrayBuffer(paddedPayload);
			const jsonString = String.fromCharCode.apply(null, new Uint8Array(decodedPayload));
			
			return JSON.parse(jsonString);
		} catch (error) {
			console.warn('解析身份令牌失败:', error);
			return null;
		}
	}
	
	/**
	 * 获取苹果登录状态信息（调试用）
	 * @returns {Promise<Object>}
	 */
	async getAuthStatus() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			const platform = plus.os.name;
			const osVersion = plus.os.version;
			
			plus.oauth.getServices((services) => {
				const appleService = services.find(service => service.id === 'apple');
				
				const status = {
					platform: platform,
					osVersion: osVersion,
					iosVersionSupported: platform === 'iOS' && parseFloat(osVersion) >= 13.0,
					appleServiceFound: !!appleService,
					serviceDetails: appleService ? {
						id: appleService.id,
						description: appleService.description || '未知版本'
					} : null,
					timestamp: new Date().toISOString()
				};
				
				console.log('苹果登录状态:', status);
				resolve(status);
				
			}, (error) => {
				resolve({ 
					error: '获取OAuth服务失败', 
					details: error,
					platform: platform,
					osVersion: osVersion
				});
			});
			// #endif
			
			// #ifndef APP-PLUS
			resolve({ 
				error: '当前环境不支持状态检查',
				platform: 'unknown'
			});
			// #endif
		});
	}
}

// 创建单例
const appleAuth = new AppleAuth();

export default appleAuth; 