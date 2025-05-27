<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt">
			<view>mac:{{deviceId}}</view>
			<view>name:{{name}}</view>

			<textarea v-model="content" class="hhh"></textarea>

			<text>输入POP</text>
			<input v-model="pop" class="hhh" />
			<button type="primary" @click="setProofOfPossession">设置pop</button>
			<button type="primary" @click="goForProvisioning">跳转配网</button>
			<button type="primary" @click="disConnect">断开连接</button>

			<text>输入ssid和密码配网</text>
			<input v-model="inputSsid" class="hhh" />
			<input v-model="inputPass" class="hhh" />
			<button type="primary" @click="doProvisioning">配网</button>
			<!-- 			<button type="primary" class="hhh" @tap="sendSerialData2()">发送#XM0$</button>
			<button type="primary" class="hhh" @tap="sendSerialData3()">发送#XL0$</button> -->


		</view>
	</view>
</template>

<script>
	var blueModule = uni.requireNativePlugin("XM-EspIdfModule")
	const modal = uni.requireNativePlugin('modal');

	export default {
		data() {
			return {
				title: 'Hello',
				content: '程序开始',
				deviceId: '',
				name: '',
				inputSsid: '',
				inputPass: '',
				pop: 'abcd1234'
			}
		},
		onLoad: function(option) { //option为object类型，会序列化上个页面传递的参数  
			this.deviceId = option.deviceId
			this.name = option.name
			console.log(option.deviceId); //打印出上个页面传递的参数。  
			console.log(option.name); //打印出上个页面传递的参数。  
		},
		methods: {
			add() {
				this.content = this.content + "########";
			},
			setProofOfPossession() {
				let that = this
				// 调用异步方法
				blueModule.setProofOfPossession({
					pop: this.pop
				}, (ret) => {
					//扫描回调结果
					const msg = JSON.stringify(ret);
					that.content = that.content + "##setProofOfPossession" + msg;
				});
			},
			//断开连接
			disConnect() {
				let that = this
				blueModule.disconnectDevice();
				// 返回上一页
				uni.navigateBack({
					delta: 1
				});
			},
			doProvisioning() {
				let that = this
				blueModule.doProvisioning({
					ssidValue: this.inputSsid, //wifi ssid
					passphraseValue: this.inputPass //wifi 密码
				}, (ret) => {
					//扫描回调结果
					const msg = JSON.stringify(ret);
					that.content = that.content + "##doProvisioning" + msg;
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.hhh {
		margin-top: 50upx;
		border: 1px solid #007AFF;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50upx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>