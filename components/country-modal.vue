<template>
	<!-- 国家/地区选择弹窗 -->
	<view v-if="visible" class="country-modal-overlay" @click="handleClose">
		<view class="country-modal" @click.stop>
            <view class="header-box">
                <view class="modal-header">
                    <image src="/static/icon/close.svg" mode="widthFix" class="close-icon" @click="handleClose"></image>
                    <text class="modal-title">选择国家/地区</text>
                    <view class="close-icon"></view>
                </view>
                
                <!-- 搜索框 -->
                <view class="search-section">
                    <view class="search-box">
                        <image src="/static/icon/search.svg" mode="widthFix" class="search-icon"></image>
                        <input 
                            type="text" 
                            v-model="searchKeyword" 
                            placeholder="搜索" 
                            class="search-input"
                            @input="onSearchInput"
                        />
                    </view>
                </view>
            </view>

			
			<!-- 字母索引 -->
			<view class="alphabet-index">
				<view 
					v-for="letter in alphabetList" 
					:key="letter" 
					class="alphabet-item"
					:class="{ 'active': currentLetter === letter }"
					@click="scrollToLetter(letter)"
				>
					{{ letter }}
				</view>
			</view>
			
			<!-- 国家列表 -->
			<scroll-view 
				class="country-list" 
				scroll-y 
                enhanced
				:scroll-top="scrollTop"
				:scroll-into-view="scrollIntoView"
				scroll-with-animation="true"
				:key="scrollViewKey"
			>
				<view v-for="(group, letter) in groupedCountries" :key="letter" class="country-group">
					<view :id="`letter-${letter}`" class="group-header">{{ letter }}</view>
					<view 
						v-for="country in group" 
						:key="`${country.name}-${country.code}`" 
						class="country-item"
						@click="selectCountry(country)"
					>
						<text class="country-name">{{ country.name }}</text>
						<text class="country-code">{{ country.code }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import { countryList, getFirstLetter } from '@/components/filters.js'
	
	export default {
		name: 'CountryModal',
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				searchKeyword: '',
				scrollTop: 0,
				scrollIntoView: '',
				oldScrollTop: 0,
				scrollViewKey: 0,
				currentLetter: 'A',
			}
		},
		computed: {
			// 过滤后的国家列表
			filteredCountries() {
				if (!this.searchKeyword) {
					return countryList;
				}
				return countryList.filter(country => 
					country.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
					country.code.includes(this.searchKeyword)
				);
			},
			
			// 按字母分组的国家列表
			groupedCountries() {
				const groups = {};
				this.filteredCountries.forEach(country => {
					const firstLetter = getFirstLetter(country.name);
					if (!groups[firstLetter]) {
						groups[firstLetter] = [];
					}
					groups[firstLetter].push(country);
				});
				
				// 对每个分组内的国家进行排序
				Object.keys(groups).forEach(letter => {
					groups[letter].sort((a, b) => a.name.localeCompare(b.name));
				});
				
				return groups;
			},
			
			// 字母列表
			alphabetList() {
				return Object.keys(this.groupedCountries).sort();
			}
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					// 弹窗显示时重置状态
					this.resetModal();
				}
			}
		},
		methods: {
			// 重置弹窗状态
			resetModal() {
				this.searchKeyword = '';
				this.scrollTop = 0;
				this.oldScrollTop = 0;
				this.scrollViewKey++;
				this.currentLetter = 'A';
			},
			
			// 关闭弹窗
			handleClose() {
				this.$emit('close');
			},
			
			// 选择国家
			selectCountry(country) {
				this.$emit('select', country);
			},
			
			// 搜索输入
			onSearchInput() {
				// 搜索时重置滚动位置
				this.scrollTop = 0;
				this.oldScrollTop = 0;
				this.currentLetter = 'A';
			},
			
			// 滚动到指定字母
			scrollToLetter(letter) {
				console.log('letter===', letter);
				this.currentLetter = letter;
				
				// 简化滚动方法
				this.simpleScrollTo(letter);
			},
			
			// 简化的滚动方法
			simpleScrollTo(targetLetter) {
				// 找到目标字母在alphabetList中的索引
				const targetIndex = this.alphabetList.indexOf(targetLetter);
				if (targetIndex === -1) return;
				
				// 简单的位置计算：每个分组大约150px高度（包含标题和几个国家）
				const approximatePosition = targetIndex * 150;
				
				console.log(`滚动到字母 ${targetLetter}，索引：${targetIndex}，位置：${approximatePosition}px`);
				
				// 尝试两种方法：先用scroll-top，再用scroll-into-view作为备选
				this.scrollTop = approximatePosition;
				
				// 如果scroll-top不工作，尝试scroll-into-view
				setTimeout(() => {
					this.scrollIntoView = '';
					this.scrollIntoView = `letter-${targetLetter}`;
				}, 100);
			},
		}
	}
</script>

<style lang="scss" scoped>
	// 国家选择弹窗样式
	.country-modal-overlay {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		min-height: 100vh;
		background-color: #FFFFFF;
		z-index: 99;
		
		.country-modal {
            height: 100%;
			width: 100%;
			background-color: #FFFFFF;
			display: flex;
			flex-direction: column;
			
            .header-box{
                width: 100%;
                background-color: #FFFFFF;
                z-index: 100;
                position: fixed;
                top: 0;
                left: 0;
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 120rpx;
                    border-bottom: 1rpx solid #E5E5E5;
                    .close-icon {
                        margin-left: 40rpx;
                        width: 25rpx;
                        height: 25rpx;
                    }
                    .modal-title {
                        font-size: 36rpx;
                        font-weight: 500;
                        color: #2C2C2C;
                    }
                }
                
                .search-section {
                    padding: 30rpx 40rpx;
                    border-bottom: 1rpx solid #E5E5E5;
                    
                    .search-box {
                        display: flex;
                        align-items: center;
                        background-color: #F5F5F5;
                        border-radius: 20rpx;
                        padding: 0 30rpx;
                        height: 80rpx;
                        
                        .search-icon {
                            width: 32rpx;
                            height: 32rpx;
                            margin-right: 20rpx;
                            opacity: 0.6;
                        }
                        
                        .search-input {
                            flex: 1;
                            font-size: 28rpx;
                            color: #2C2C2C;
                            
                            &::placeholder {
                                color: #999999;
                            }
                        }
                    }
                }
            }

			.alphabet-index {
				position: fixed;
				right: 20rpx;
				top: 50%;
				transform: translateY(-50%);
				display: flex;
				flex-direction: column;
				z-index: 10;
				
				.alphabet-item {
					width: 40rpx;
					height: 40rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24rpx;
					color: #666666;
					margin-bottom: 4rpx;
					cursor: pointer;
					border-radius: 50%;
					transition: all 0.2s ease;
					
					/* &.active {
						background-color: #007AFF;
						color: #FFFFFF;
						font-weight: 600;
					} */
				}
			}
			
			.country-list {
				position: absolute;
				top: 280rpx;
				left: 0;
				right: 0;
				bottom: 0;
				.country-group {
                    padding-right: 80rpx;
					.group-header {
						padding: 20rpx 40rpx;
						font-size: 28rpx;
						font-weight: 600;
						color: #666666;
					}
					
					.country-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 30rpx 0 30rpx 40rpx;
						border-bottom: 1rpx solid #F0F0F0;
						
						&:active {
							background-color: #F8F8F8;
						}
						
						.country-name {
							font-size: 32rpx;
							color: #2C2C2C;
						}
						
						.country-code {
							font-size: 28rpx;
							color: #666666;
						}
					}
				}
			}
		}
	}
</style>