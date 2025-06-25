/**
 * 获取应用签名工具
 * 用于获取当前安卓应用的签名信息
 */
export function getAppSignature() {
	return new Promise((resolve, reject) => {
		// #ifdef APP-PLUS
		if (plus.os.name === 'Android') {
			try {
				// 导入Android类
				const Context = plus.android.importClass("android.content.Context");
				const PackageManager = plus.android.importClass("android.content.pm.PackageManager");
				const MessageDigest = plus.android.importClass("java.security.MessageDigest");
				
				// 获取应用上下文
				const main = plus.android.runtimeMainActivity();
				const packageManager = main.getPackageManager();
				const packageName = main.getPackageName();
				
				console.log('获取应用信息:', { packageName });
				
				// 使用正确的方式调用getPackageInfo
				const GET_SIGNATURES = 64;
				const packageInfo = plus.android.invoke(packageManager, "getPackageInfo", packageName, GET_SIGNATURES);
				
				if (!packageInfo) {
					reject(new Error('无法获取应用包信息'));
					return;
				}
				
				// 获取签名数组
				const signatures = plus.android.getAttribute(packageInfo, "signatures");
				
				if (!signatures || signatures.length === 0) {
					reject(new Error('无法获取应用签名信息'));
					return;
				}
				
				// 获取第一个签名
				const signature = signatures[0];
				const signatureBytes = plus.android.invoke(signature, "toByteArray");
				
				// 计算MD5哈希
				const md = MessageDigest.getInstance("MD5");
				const digest = plus.android.invoke(md, "digest", signatureBytes);
				
				// 转换为十六进制字符串
				let hexString = "";
				for (let i = 0; i < digest.length; i++) {
					let hex = (digest[i] & 0xFF).toString(16);
					if (hex.length === 1) {
						hexString += "0";
					}
					hexString += hex;
				}
				
				const result = {
					packageName: packageName,
					signature: hexString.toLowerCase(),
					signatureFormatted: hexString.toLowerCase().replace(/(.{2})/g, '$1:').slice(0, -1)
				};
				
				console.log('签名获取成功:', result);
				resolve(result);
				
			} catch (error) {
				console.error('获取签名详细错误:', error);
				reject(new Error('获取签名失败: ' + error.message));
			}
		} else {
			reject(new Error('仅支持安卓平台'));
		}
		// #endif
		
		// #ifndef APP-PLUS
		reject(new Error('仅支持APP环境'));
		// #endif
	});
} 