<template>

	<div>
		<text>BLE蓝牙相关接口</text>
		<button type="primary" @click="startScan">开始扫描</button>
		<button type="primary" @click="stopScan">停止扫描</button>
		<button type="primary" @click="connect">连接</button>
		<button type="primary" @click="disconnect">断开连接</button>
		<button type="primary" @click="setProofOfPossession">设置POP</button>
		<button type="primary" @click="scanNetworks">扫描WiFi</button>
		<button type="primary" @click="doProvisioning">配网</button>
	</div>
</template>

<script>
	// 获取 module 
	var sdkModule = uni.requireNativePlugin("XM-EspIdfModule")
	const modal = uni.requireNativePlugin('modal');
	export default {
		data() {
			return {
				// address: "94F206C6-42EE-8395-3CE1-3A8F15FA57FD"
				address: "F0:A9:68:81:D5:68"
			}
		},
		onLoad() {

		},
		methods: {
			//开始扫描
			startScan() {
				sdkModule.startBleScan({
					securityType: 2,//0表示SECURITY_0，2表示SECURITY_2，暂时是写死的2
					deviceNamePrefix: 'Lumi_'//可自定义
				}, (ret) => {
					//扫描回调结果
					console.log(ret)
				});
			},
			//停止扫描
			stopScan() {
				sdkModule.stopBleScan();
			},
			connect() {
				sdkModule.connectDevice({
					/**
					 * {"success":true,"msg":"onLeScan","data":{"mBleAddress":"1AF92E22-C653-272E-06AF-46D92E4B8963","mDeviceType":2,"mBleName":"Fuwinda 6199"}}
					 */
					mac: this.address, //mac地址
					serviceUuid: ''//传给你的serviceUuid
				}, (ret) => {
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
				});
			},
			disconnect() {
				sdkModule.disconnectDevice();
			},
			setProofOfPossession() {
				// 调用异步方法
				sdkModule.setProofOfPossession({
					pop: '1234abcd' //BLE蓝牙名称，不为空才生效
				}, (ret) => {
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
				});
			},
			scanNetworks() {
				sdkModule.scanNetworks((ret) => {
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
				});
			},
			doProvisioning() {
				sdkModule.doProvisioning({
					ssidValue: '',//wifi ssid
					passphraseValue: ''//wifi 密码
				}, (ret) => {
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
				});
			}
		}
	}
</script>