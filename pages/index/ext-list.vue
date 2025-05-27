<template>
	<view class="uni-container">
		<view class="uni-hello-text">
			<text class="hello-text" @click="getDeviceList">uni原生插件示例</text>
		</view>
		<view @click="getDeviceList">{{text}}</view>
		<view v-show="blueDeviceList.length == 0">
			<text @tap="getDeviceList()" class="hello-text">暂无设备，请点击扫描！</text>
		</view>
		<view class="uni-panel" v-show="blueDeviceList.length > 0" v-for="(item, index) in blueDeviceList"
			:key="address">
			<view class="uni-panel-h" :class="uni-panel-h-on" @click="goDetailPage(index)">
				<view>
					<view>name: {{ item.name ? item.name : '未定义设备名' }}</view>
					<view>id: {{ item.address }}</view>
					<view>RSSI:{{item.rssi}}</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	var blueModule = uni.requireNativePlugin("XM-EspIdfModule")
	const modal = uni.requireNativePlugin('modal');

	export default {
		data() {
			return {
				blueDeviceList: [],
				navigateFlag: false,
				text: '请点击扫描'
			}
		},
		onLoad() {
			this.getDeviceList()
		},
		onUnload() {
			blueModule.stopBleScan();
		},
		methods: {
			getDeviceList() {
				let that = this
				blueModule.startBleScan({
					securityType: 2, //0表示SECURITY_0，2表示SECURITY_2，暂时是写死的2
					deviceNamePrefix: '' //可自定义
				}, (ret) => {
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
					if (ret.success && ret.msg == 'onPeripheralFound') {
						that.ArrDupRem(that.blueDeviceList, ret.data, 'deviceId')
					}
				});
			},
			goDetailPage(data) {
				var device = this.blueDeviceList[data];
				// this.deviceId = device.address
				// this.text = JSON.stringify(e)
				uni.showLoading({
					title: '连接中'
				})
				blueModule.connectDevice({
					/**
					 * {"success":true,"msg":"onLeScan","data":{"mBleAddress":"1AF92E22-C653-272E-06AF-46D92E4B8963","mDeviceType":2,"mBleName":"Fuwinda 6199"}}
					 */
					mac: device.deviceId, //mac地址
					serviceUuid: device.serviceUuid//传给你的serviceUuid
				}, (ret) => {
					uni.hideLoading()
					//扫描回调结果
					console.log(ret)
					modal.toast({
						//发送操作结果
						message: ret,
						duration: 1.5
					});
					if(ret.success && ret.msg == 'EVENT_DEVICE_CONNECTED') {
						uni.navigateTo({
							url: '/pages/index/ext-terminal?deviceId=' + device.deviceId + '&name=' + device.name
						});
					}
				});
			},
			ArrDupRem(a, o, k) {
				console.error('ArrDupRem')
				let i = a.findIndex(v => v[k] === o[k]);
				if (a.findIndex(v => v[k] === o[k]) !== -1) {
					a.splice(i, 1, o);
				} else {
					a.push(o);
				}
				return a;
			}
		}
	}
</script>

<style>

</style>