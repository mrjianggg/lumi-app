<template>
	<view class="role-page">
		<head-return :toPage="0" title="角色档案"></head-return>
		<view class="page-content">
			<view class="my-role">
				<view class="my-role-info">
					<image  class="role-img" mode="widthFix" src="/static/img/roleImg.png"></image>
					<view class="role-info">
						<view class="role-info-name">
							<text>梦想精灵</text>
						</view>
						<view class="role-info-desc">
							<text>梦想精灵是一个充满幻想的精灵，她拥有着细腻的内心和丰富的想象力</text>
						</view>
					</view>
				</view>
				<view class="my-role-story">
					<view class="my-role-story-title">
						<text>角色故事</text>
						<image src="/static/icon/voice.svg" mode="widthFix" class="my-role-story-title-icon"></image>
					</view>
					<view class="my-role-story-content">
						<text>梦想精灵是一个充满幻想的精灵，她拥有着细腻的内心和丰富的想象力，她拥有着细腻的内心和丰富的想象力</text>
					</view>
				</view>
			</view>
			<view class="change-role">
				<view class="change-role-title">
					<text>切换角色</text>
				</view>
				<view class="change-role-list">
					<view class="change-role-list-item" :class="{'change-role-list-item-active': changeRoleIndex === item.id}" v-for="item in roleList" :key="item.id" @click="changeRole(item)">
						<image :src="item.img" mode="widthFix" class="change-role-list-item-img"></image>
						<view class="change-role-list-item-info">
							<view class="change-role-list-item-name">
								<text>{{ item.name }}</text>
							</view>
							<view class="change-role-list-item-desc">
								<text>{{ item.desc }}</text>
							</view>
						</view>

					</view>
				</view>
			</view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				roleList: [
					{
						id: 1,
						name: '梦想精灵1',
						desc: '梦想精灵1是一个充满幻想的精灵，她拥有着细腻的内心和丰富的想象力',
						img: '/static/img/roleImg.png',
					},
					{
						id: 2,
						name: '梦想精灵2',
						desc: '梦想精灵2是一个充满幻想的精灵，她拥有着细腻的内心和丰富的想象力',
						img: '/static/img/roleImg.png',
					},
					{
						id: 3,
						name: '梦想精灵3',
						desc: '梦想精灵3是一个充满幻想的精灵，她拥有着细腻的内心和丰富的想象力',
						img: '/static/img/roleImg.png',
					}
				],
				changeRoleIndex: 1,
			}
		},
		methods: {
			changeRole(item) {
				console.log(item);
				this.changeRoleIndex = item.id;
			},
			// TabBar切换事件处理
			handleTabChange(index) {
				const tabPages = [
					'/pages/tabbar-container/index?tab=0', // 设备页面
					'/pages/tabbar-container/index?tab=1', // 聊天页面  
					'/pages/tabbar-container/index?tab=2'  // 个人页面
				];
				
				if (tabPages[index]) {
					uni.reLaunch({
						url: tabPages[index]
					});
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.role-page {
		.page-content{
			padding: 0 40rpx 220rpx 40rpx; /* 底部增加TabBar预留空间 */
			.my-role{
				padding: 40rpx;
				margin-top: 60rpx;
				border: 1px solid #D9D9D9;
				border-radius: 59.7rpx;
				.my-role-info{
					display: flex;
					align-items: center;
					.role-img{
						width: 134.3rpx;
					}
					.role-info{
						flex: 1;
						margin-left: 20rpx;
						.role-info-name{
							font-size: 29.9rpx;
							font-weight: 400;
							color: #303030;
						}
						.role-info-desc{	
							margin-top: 10rpx;
							font-size: 26.1rpx;
							font-weight: 400;
							color: #757575;
						}
					}
				}
				.my-role-story{
					.my-role-story-title{
						margin-top: 40rpx;
						display: flex;
						align-items: center;
						font-size: 29.9rpx;
						font-weight: 400;
						color: #303030;
						.my-role-story-title-icon{
							width: 37.3rpx;
							margin-left: 10rpx;
						}
					}
					.my-role-story-content{
						min-height: 200rpx;
						background: #F5F5F5;
						padding: 40rpx;
						border-radius: 29.9rpx;
						border: 1px solid #D9D9D9;
						margin-top: 20rpx;
						font-size: 29.9rpx;
						font-weight: 400;
						color: #757575;
					}
				}
			}
			.change-role{
				padding: 40rpx;
				margin-top: 30rpx;
				border: 1px solid #D9D9D9;
				border-radius: 59.7rpx;
				.change-role-title{
					font-size: 29.9rpx;
					font-weight: 400;
					color: #303030;
				}
				.change-role-list{
					.change-role-list-item-active{
						background: #D5CFFF;
						border: 1px solid #75757500 !important;
					}
					.change-role-list-item{
						margin-top: 30rpx;
						border-radius: 59.7rpx;
						display: flex;
						align-items: start;
						padding: 40rpx;
						border: 1px solid #D9D9D9;
						.change-role-list-item-img{
							width: 134.3rpx;
							border-radius: 100%;
						}
						.change-role-list-item-info{
							flex: 1;
							margin-left: 20rpx;
							.change-role-list-item-name{
								font-size: 29.9rpx;
								font-weight: 400;
								color: #303030;
							}
							.change-role-list-item-desc{
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
	}
</style>