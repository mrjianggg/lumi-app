<template>
	<view class="page-main">
		<head-return :toPage="2" title="设备列表"></head-return>
		<view class="page-content">
			<view class="device-list">
				<view class="device-list-item" v-for="item in deviceList" :key="item.id">
					<image src="/static/img/deviceImg.png" mode="widthFix" class="device-list-item-img"></image>
					<view class="device-list-item-info">
						<view class="device-list-item-info-name">
							<text>{{ item.name }}</text>
						</view>
						<view class="device-list-item-info-deviceId">
							<text>SN:{{ item.deviceId }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		

	</view>
</template>

<script>
	export default {
		data() {
			return {
				deviceList: [
					{
						id: 1,
						name: '设备1',
						deviceId: 'jdi2hddi89ghja'
					},
					{
						id: 2,
						name: '设备2',
						deviceId: 'jdi2hddi89ghaa'
					},
					{
						id: 3,
						name: '设备3',
						deviceId: 'jdi2hddi89ghbb'
					}
				]
			}
		},
		methods: {

		}
	}
</script>

<style scoped lang="scss">
	.page-main {
		.page-content{
			padding: 54.1rpx 40rpx 40rpx 40rpx; /* 底部增加TabBar预留空间 */
			.device-list{
				.device-list-item{
					margin-bottom: 30rpx;
					height: 223.9rpx;
					display: flex;
					align-items: center;
					justify-content: start;
					padding-left: 44.8rpx;
					border: 1px solid #D9D9D9;
					border-radius: 29.9rpx;
					.device-list-item-img{
						width: 134.3rpx;
						height: 134.3rpx;
					}
					.device-list-item-info{
						flex: 1;
						margin-left: 30rpx;
						.device-list-item-info-name{
							font-size: 29.9rpx;
							font-weight: 400;
							color: #303030;
						}
						.device-list-item-info-deviceId{
							margin-top: 10rpx;
							font-size: 26.1rpx;
							font-weight: 400;
							color: #757575;
						}
					}
				}
			}

		}
	}
</style>