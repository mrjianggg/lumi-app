/**
 * Google登录授权工具类
 */
class GoogleAuth {
	
	/**
	 * 检查Google登录是否可用
	 * @returns {Promise<boolean>}
	 */
	checkGoogleSignInAvailable() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				console.log('所有OAuth服务:', services);
				const googleService = services.find(service => service.id === 'google');
				if (googleService) {
					console.log('Google登录服务可用:', googleService);
					resolve(true);
				} else {
					console.log('未找到Google登录服务');
					resolve(false);
				}
			}, (error) => {
				console.error('获取OAuth服务失败:', error);
				resolve(false);
			});
			// #endif
			
			// #ifndef APP-PLUS
			console.log('当前环境不支持Google登录');
			resolve(false);
			// #endif
		});
	}
	
	/**
	 * 获取Google授权
	 * @returns {Promise<Object>}
	 */
	getGoogleAuth() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				const googleService = services.find(service => service.id === 'google');
				
				if (!googleService) {
					reject(new Error('未找到Google登录服务'));
					return;
				}
				
				console.log('找到Google登录服务:', googleService);
				
				
				// 设置超时处理
				const timeoutId = setTimeout(() => {
					console.log('Google登录授权超时');
					reject(new Error('授权超时，请重试'));
				}, 30000); // 30秒超时
				

				googleService.login((result) => {
					clearTimeout(timeoutId);
					console.log('Google登录授权成功:', result);
					
					// 解析Google返回的数据
					const authResult = {
						platform: 'app',
						provider: 'google',
						// 访问令牌
						access_token: result.access_token,
						// 授权码（如果有）
						code: result.code,
						// ID令牌（如果有）
						id_token: result.id_token,
						// 刷新令牌
						refresh_token: result.refresh_token,
						// 令牌类型
						token_type: result.token_type || 'Bearer',
						// 过期时间
						expires_in: result.expires_in,
						// 权限范围
						scope: result.scope,
						// 用户信息（如果包含）
						userInfo: result.userInfo || null,
						// 原始结果
						originalResult: result,
						// 时间戳
						timestamp: new Date().toISOString()
					};
					
					resolve(authResult);
					
				}, (error) => {
					clearTimeout(timeoutId);
					console.error('Google登录授权失败:', error);
					
					// 处理不同的错误情况
					let errorMessage = 'Google登录失败';
					let errorDetails = '';
					
					if (error.code) {
						switch (error.code) {
							case -1001:
								errorMessage = '用户取消了授权';
								break;
							case -1002:
								errorMessage = 'Google OAuth配置错误';
								errorDetails = '可能的原因：\n1. 应用签名(SHA-1)配置不正确\n2. 包名配置不匹配\n3. Client ID配置错误\n\n请检查Google Cloud Console中的OAuth配置';
								break;
							case -1003:
								errorMessage = '授权请求被拒绝';
								break;
							case -1004:
								errorMessage = '授权请求失败';
								break;
							case 7:
								errorMessage = 'Google Play服务配置错误';
								errorDetails = '错误码7通常表示客户端配置问题：\n1. 检查应用签名是否正确\n2. 验证Google Cloud Console配置\n3. 确认Client ID有效';
								break;
							case 10012:
								errorMessage = 'Google登录配置错误，请检查manifest.json中的clientid配置';
								break;
							default:
								errorMessage = error.message || `未知错误 (${error.code})`;
						}
					}
					
					// 创建详细的错误对象
					const detailedError = new Error(errorMessage);
					detailedError.code = error.code;
					detailedError.details = errorDetails;
					detailedError.originalError = error;
					
					reject(detailedError);
				});
				
			}, (error) => {
				console.error('获取OAuth服务失败:', error);
				reject(new Error('获取Google登录服务失败'));
			});
			// #endif
			
			// #ifndef APP-PLUS
			reject(new Error('当前环境不支持Google登录'));
			// #endif
		});
	}
	
	/**
	 * 使用访问令牌获取用户信息
	 * @param {string} accessToken 访问令牌
	 * @returns {Promise<Object>}
	 */
	async getUserInfo(accessToken) {
		try {
			const response = await uni.request({
				url: 'https://www.googleapis.com/oauth2/v2/userinfo',
				method: 'GET',
				header: {
					'Authorization': `Bearer ${accessToken}`
				}
			});
			
			if (response.statusCode === 200 && response.data) {
				console.log('Google用户信息获取成功:', response.data);
				return {
					id: response.data.id,
					email: response.data.email,
					verified_email: response.data.verified_email,
					name: response.data.name,
					given_name: response.data.given_name,
					family_name: response.data.family_name,
					picture: response.data.picture,
					locale: response.data.locale
				};
			} else {
				throw new Error('获取用户信息失败');
			}
		} catch (error) {
			console.error('获取Google用户信息失败:', error);
			throw new Error('获取用户信息失败');
		}
	}
	
	/**
	 * Google登录主方法
	 * @returns {Promise<Object>}
	 */
	async login() {
		try {
			console.log('开始Google登录流程...');
			
			// 1. 检查Google登录是否可用
			const isAvailable = await this.checkGoogleSignInAvailable();
			if (!isAvailable) {
				throw new Error('当前设备不支持Google登录或未配置Google登录服务');
			}
			
			// 2. 获取Google授权
			const authResult = await this.getGoogleAuth();
			
			// 3. 如果有访问令牌，获取用户详细信息
			if (authResult.access_token) {
				try {
					const userInfo = await this.getUserInfo(authResult.access_token);
					authResult.userInfo = userInfo;
					console.log('已获取Google用户详细信息');
				} catch (error) {
					console.warn('获取用户详细信息失败，但授权成功:', error.message);
				}
			}
			
			console.log('Google登录成功，获取到授权信息:', authResult);
			return authResult;
			
		} catch (error) {
			console.error('Google登录失败:', error);
			throw error;
		}
	}
	
	/**
	 * 刷新访问令牌
	 * @param {string} refreshToken 刷新令牌
	 * @returns {Promise<Object>}
	 */
	async refreshAccessToken(refreshToken) {
		try {
			// 注意：通常刷新令牌的操作应该在服务端进行
			// 这里只是示例，实际应用中建议通过后端API处理
			console.warn('刷新令牌操作建议在服务端进行');
			
			const response = await uni.request({
				url: 'https://oauth2.googleapis.com/token',
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					client_id: '464212692137-486u6c267vd0um9iab5vskuqov3rg6sh.apps.googleusercontent.com',
					refresh_token: refreshToken,
					grant_type: 'refresh_token'
				}
			});
			
			if (response.statusCode === 200 && response.data.access_token) {
				return {
					access_token: response.data.access_token,
					token_type: response.data.token_type,
					expires_in: response.data.expires_in,
					scope: response.data.scope
				};
			} else {
				throw new Error('刷新令牌失败');
			}
		} catch (error) {
			console.error('刷新访问令牌失败:', error);
			throw error;
		}
	}
	
	/**
	 * 撤销访问令牌（登出）
	 * @param {string} accessToken 访问令牌
	 * @returns {Promise<boolean>}
	 */
	async revokeToken(accessToken) {
		try {
			const response = await uni.request({
				url: `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			
			if (response.statusCode === 200) {
				console.log('Google令牌撤销成功');
				return true;
			} else {
				console.warn('Google令牌撤销失败');
				return false;
			}
		} catch (error) {
			console.error('撤销Google令牌失败:', error);
			return false;
		}
	}
	
	/**
	 * 获取Google登录状态信息（调试用）
	 * @returns {Promise<Object>}
	 */
	async getAuthStatus() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			const platform = plus.os.name;
			const osVersion = plus.os.version;
			
			plus.oauth.getServices((services) => {
				const googleService = services.find(service => service.id === 'google');
				
				const status = {
					platform: platform,
					osVersion: osVersion,
					googleServiceFound: !!googleService,
					serviceDetails: googleService ? {
						id: googleService.id,
						description: googleService.description || '未知版本',
						nativeClient: googleService.nativeClient
					} : null,
					timestamp: new Date().toISOString()
				};
				
				console.log('Google登录状态:', status);
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
const googleAuth = new GoogleAuth();

export default googleAuth; 