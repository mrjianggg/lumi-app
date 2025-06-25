/**
 * 超简化微信授权 - 专门解决安卓问题
 */
class SimpleWechatAuth {
	
	/**
	 * 最简单的微信授权 - 不传任何可选参数
	 */
	simpleAuth() {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				console.log('=== 开始最简授权测试 ===');
				for (let service of services) {
					if (service.id === 'weixin') {
						console.log('找到微信服务');
						
						// 完全不传参数，让系统使用默认值
						console.log('开始调用 authorize（无参数）...');
						service.authorize(
							// 成功回调
							(result) => {
								console.log('✅ 无参数授权成功:', result);
								resolve(result);
							},
							// 失败回调  
							(error) => {
								console.log('❌ 无参数授权失败:', error);
								
								// 第二次尝试：只传scope
								console.log('尝试第二种方案：只传scope...');
								service.authorize(
									(result2) => {
										console.log('✅ 只传scope授权成功:', result2);
										resolve(result2);
									},
									(error2) => {
										console.log('❌ 只传scope也失败:', error2);
										reject(error2);
									},
									{ scope: 'snsapi_userinfo' }
								);
							}
							// 第一次调用不传第三个参数
						);
						
						console.log('authorize 调用完成，等待结果...');
						return;
					}
				}
				reject(new Error('未找到微信服务'));
			}, (error) => {
				reject(error);
			});
			// #endif
			
			// #ifndef APP-PLUS
			reject(new Error('非APP环境'));
			// #endif
		});
	}
}

export default new SimpleWechatAuth(); 