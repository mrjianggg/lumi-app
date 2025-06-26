/**
 * 微信授权登录工具类
 * 支持APP和小程序环境
 */
class WechatAuth {
	
	/**
	 * 检查微信是否安装
	 * @returns {Promise<boolean>}
	 */
	checkWechatInstalled() {
		return new Promise((resolve) => {
			console.log('开始微信登录2222');
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				console.log('微信安装状态3333:', services);
				for (let service of services) {
					if (service.id === 'weixin') {
						console.log('微信安装状态4444:', service);
						resolve(service.nativeClient);
						return;
					}
				}
				console.log('未找到微信OAuth服务');
				resolve(false);
			}, (error) => {
				console.error('获取OAuth服务失败:', error);
				resolve(false);
			});
			// #endif
			
			// #ifdef MP-WEIXIN
			// 小程序环境下默认可用
			resolve(true);
			// #endif
			
			// #ifndef APP-PLUS || MP-WEIXIN
			// 其他环境下不支持
			console.log('当前环境不支持微信登录');
			resolve(false);
			// #endif
		});
	}
	
	/**
	 * 获取微信授权
	 * @returns {Promise<Object>}
	 */
	getWechatAuth() {
		console.log('getWechatAuth1111');
		return new Promise((resolve, reject) => {
			console.log('getWechatAuth2222');
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				console.log('getWechatAuth3333:', services);
				for (let service of services) {
					if (service.id === 'weixin') {
						console.log('getWechatAuth4444:', service);
						
						// 检查微信是否已安装并可用
						if (!service.nativeClient) {
							reject(new Error('微信客户端未安装或不可用'));
							return;
						}
						try {
							service.forbid(); // 关键代码：清除本地授权缓存
						} catch (e) {
							console.warn('清除授权缓存失败:', e);
						}
						// 安卓平台特殊处理
						// #ifdef APP-PLUS-NVUE
						console.log('当前平台: NVUE');
						// #endif
						
						// 获取平台信息用于调试
						const platform = plus.os.name;
						console.log('当前操作系统:', platform);
						
						// 设置授权参数 - 使用最简配置
						const authOptions = {
							scope: 'snsapi_userinfo'
						};
						
						// 安卓平台
						if (platform === 'Android') {
							authOptions.confirm = true; // 强制显示授权确认
							authOptions.forceLogin = true;  // 强制显示授权界面
							authOptions.fastLogin = false;  // 禁用快速登录
							// 添加随机state参数防止缓存
							authOptions.state = 'anti_cache_' + Date.now() + Math.random().toString(36).substr(2);
						}
						
						console.log('授权参数:', authOptions);
						
						service.authorize((result) => {
							console.log('APP微信授权成功:', result);
							resolve({
								platform: 'app',
								code: result.code,
								access_token: result.access_token,
								openid: result.openid,
								unionid: result.unionid,
								expires_in: result.expires_in,
								refresh_token: result.refresh_token,
								scope: result.scope,
								userInfo: result.userInfo || null,
								originalResult: result // 保留原始结果用于调试
							});
						}, (error) => {
							console.log('error===',error);
							console.error('APP微信授权失败 - 详细错误:', {
								code: error.code,
								message: error.message,
								innerCode: error.innerCode,
								platform: plus.os.name,
								wechatVersion: service.description,
								fullError: error
							});
							
							
							// 针对不同错误码提供具体解决方案
							let errorMessage = '微信授权失败';
							if (error.code === -100) {
								if (error.innerCode === -6) {
									errorMessage = '应用签名验证失败，请检查微信开放平台配置';
								} else {
									errorMessage = '微信授权被拒绝或取消';
								}
							} else if (error.code === -1) {
								errorMessage = '用户取消授权';
							}
							console.log(55555555);
							reject(this.handleAuthError({
								...error,
								message: errorMessage,
								platform: plus.os.name
							}));
						}, authOptions);
						uni.hideLoading();
						console.log(222222222);
						return;
					}
				}
				console.log(333333333);
				reject(new Error('未找到微信OAuth服务'));
			}, (error) => {
				console.log(444444444);
				console.error('获取OAuth服务失败:', error);
				reject(error);
			});
			// #endif
			
			// #ifdef MP-WEIXIN
			// 小程序环境下使用微信登录
			uni.login({
				provider: 'weixin',
				success: (result) => {
					console.log('小程序微信登录成功:', result);
					resolve({
						platform: 'miniprogram',
						code: result.code,
						errMsg: result.errMsg
					});
				},
				fail: (error) => {
					console.error('小程序微信登录失败:', error);
					reject(this.handleAuthError(error));
				}
			});
			// #endif
			
			// #ifndef APP-PLUS || MP-WEIXIN
			reject(new Error('当前环境不支持微信登录'));
			// #endif
		});
	}
	
	/**
	 * 处理授权错误
	 * @param {Object} error 错误对象
	 * @returns {Error}
	 */
	handleAuthError(error) {
		console.log('处理微信授权错误:', error);
		
		if (!error) {
			return new Error('未知错误');
		}
		
		if (typeof error === 'string') {
			return new Error(error);
		}
		
		// 处理微信授权特定错误码
		if (error.code !== undefined) {
			switch (error.code) {
				case -100:
					if (error.innerCode === -6) {
						return new Error('应用签名验证失败\n\n可能的解决方案：\n1. 检查微信开放平台应用签名配置\n2. 确认安卓应用包名与微信开放平台一致\n3. 验证应用是否使用正确的签名文件');
					} else if (error.innerCode === -4) {
						return new Error('微信版本过低，请升级微信到最新版本');
					} else {
						return new Error('微信授权失败，请检查应用配置');
					}
				case -1:
					return new Error('用户取消授权');
				case -2:
					return new Error('用户拒绝授权');
				case -3:
					return new Error('微信未安装');
				case -4:
					return new Error('微信版本过低');
				case -5:
					return new Error('网络错误，请检查网络连接');
				default:
					return new Error(`微信授权失败 (错误码: ${error.code})`);
			}
		}
		
		// 处理uni-app相关错误
		if (error.errMsg) {
			if (error.errMsg.includes('cancel')) {
				return new Error('用户取消授权');
			} else if (error.errMsg.includes('deny')) {
				return new Error('用户拒绝授权');
			} else if (error.errMsg.includes('network')) {
				return new Error('网络错误，请检查网络连接');
			}
			return new Error(error.errMsg);
		}
		
		// 使用自定义错误消息
		if (error.message) {
			return new Error(error.message);
		}
		
		return new Error('微信授权失败，请重试');
	}
	
	/**
	 * 微信登录主方法
	 * @returns {Promise<Object>}
	 */
	async login() {
		try {
			console.log('开始微信登录1111');
			// 检查微信是否安装
			const isInstalled = await this.checkWechatInstalled();
			if (!isInstalled) {
				throw new Error('未检测到微信应用，请先安装微信');
			}
			console.log('微信安装状态:', isInstalled);
			// 获取微信授权
			const authResult = await this.getWechatAuth();
			console.log('微信授权结果:', authResult);
			
			return authResult;
		} catch (error) {
			console.error('微信登录过程错误:', error);
			throw error;
		}
	}
}

// 导出实例
export default new WechatAuth(); 