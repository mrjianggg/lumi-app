<template>
	<view class="role-page">
		<head-return :toPage="0" :title="fName"></head-return>
		<view class="page-content">
            <view v-for="(content, contentIndex) in contentList" :key="contentIndex + 'content'">
                <view
                    :class="['content-item', playContentIndex === contentIndex ? 'content-item-play' : '']"
                    :style="playContentIndex === contentIndex ? {backgroundColor: currentColorPair.background, borderColor: currentColorPair.background} : {}"
                    @click="playContent(contentIndex,content)">
                    <view class="content-item-left">
                        <!-- <audio-lines-icon v-if="playContentIndex === contentIndex" :color="currentColorPair.icon" /> -->
                        <view class="content-item-left-text">
                            {{content.title}}
                        </view>
                    </view>
                    <!-- 加载状态 -->
                    <image class="content-item-bt loading-icon" src="/static/icon/item-loading.svg" v-if="playContentIndex === contentIndex"></image>
                    <!-- 暂停状态 -->
                    <image class="content-item-bt" src="/static/icon/item-play.svg" v-else></image>

                </view>
            </view>
		</view>
		
		<!-- 自定义TabBar -->
		<custom-tabbar :current="0" @change="handleTabChange" />
	</view>
</template>

<script>
    import AudioLinesIcon from '@/components/audio-lines-icon.vue'
    import http from '@/utils/request.js'
	export default {
		components: {
			AudioLinesIcon
		},
		data() {
			return {
                contentList: [
                ],
                playContentIndex: -1,
                currentColorPair: { background: '#FFE8A3', icon: '#FF9B21' },
				// 颜色配对数组
				colorPairs: [
					{ background: '#FFE8A3', icon: '#FF9B21' },
					{ background: '#CFF7D3', icon: '#21B200' },
					{ background: '#FDD3D0', icon: '#FF3F21' },
					{ background: '#CFE9FF', icon: '#209BFF' },
					{ background: '#EBE7FF', icon: '#6D5BE3' }
				],
                fId: '',
                fName: ''
			}
		},
		onLoad() {
		},
		onUnload() {
		},
		computed: {

		},
        mounted() {
            this.fId = this.$route.query.id;
            this.fName = decodeURIComponent(this.$route.query.name);
            if(this.fId){
                this.getRecommend();
            }
        },
		methods: {
            getRecommend() {
                this.contentList = [];
                http.get(`/content/collection/${this.fId}?page=1&limit=10`).then(res => {
                    console.log('res===',res);
                    if(res.code === 0){
                        this.contentList = res.data.list;
                    }else{
                        uni.showToast({
                            title: res.msg,
                            icon: 'none'
                        });
                    }
                })
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
			},
            playContent(contentIndex,content) {
				if (this.playContentIndex === contentIndex) {
					// 如果点击的是当前播放的内容，则切换播放/暂停状态
				} else {
					// 点击新的内容，切换到新内容并播放
					this.playContentIndex = contentIndex;
					// 随机选择一个颜色配对
					const randomIndex = Math.floor(Math.random() * this.colorPairs.length);
					this.currentColorPair = this.colorPairs[randomIndex];

                    console.log('content===',content);
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.role-page {
		.page-content{
			padding: 74.6rpx 74.6rpx 220rpx 74.6rpx; /* 底部增加TabBar预留空间 */
            .content-item-play {
                /* 背景色和边框色现在通过动态样式设置 */
            }
    
            .content-item {
                font-size: 29.9rpx;
                font-weight: 400;
                color: #303030;
                height: 104.5rpx;
                border-radius: 59.7rpx;
                border: 1px solid #D9D9D9;
                padding: 0 50rpx;
                margin-bottom: 30rpx;
                display: flex;
                align-items: center;
                justify-content: space-between;
    
                .content-item-bt {
                    width: 44.8rpx;
                    height: 44.8rpx;
                }
                .content-item-left{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    .content-item-left-text{
                        margin-left: 7.5rpx;
                    }
                }
            }
            
            // 加载图标旋转动画
            .loading-icon {
                animation: rotate 1s linear infinite;
            }
            
            @keyframes rotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
		}
	}
</style>