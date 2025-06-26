<template>
	<view class="container">
		<view class="header">
			<text class="title">字体演示页面</text>
		</view>
		
		<view class="demo-section">
			<text class="section-title">Inter 英文字体</text>
			<view class="font-demo font-en">
				<text class="demo-text font-light">Light: The quick brown fox jumps over the lazy dog</text>
				<text class="demo-text font-regular">Regular: The quick brown fox jumps over the lazy dog</text>
				<text class="demo-text font-medium">Medium: The quick brown fox jumps over the lazy dog</text>
				<text class="demo-text font-semibold">Semibold: The quick brown fox jumps over the lazy dog</text>
				<text class="demo-text font-bold">Bold: The quick brown fox jumps over the lazy dog</text>
			</view>
		</view>
		
		<view class="demo-section">
			<text class="section-title">Noto Sans SC 中文字体</text>
			<view class="font-demo font-zh">
				<text class="demo-text font-light">细体：快速的棕色狐狸跳过懒狗</text>
				<text class="demo-text font-regular">常规：快速的棕色狐狸跳过懒狗</text>
				<text class="demo-text font-medium">中等：快速的棕色狐狸跳过懒狗</text>
				<text class="demo-text font-semibold">半粗：快速的棕色狐狸跳过懒狗</text>
				<text class="demo-text font-bold">粗体：快速的棕色狐狸跳过懒狗</text>
			</view>
		</view>
		
		<view class="demo-section">
			<text class="section-title">混合字体（推荐）</text>
			<view class="font-demo font-mixed">
				<text class="demo-text font-regular">English and 中文混合显示 Mixed Text</text>
				<text class="demo-text font-medium">Hello 你好 World 世界!</text>
				<text class="demo-text font-semibold">Inter + Noto Sans SC = Perfect!</text>
			</view>
		</view>
		
		<view class="demo-section">
			<text class="section-title">不同字号演示</text>
			<view class="font-demo font-mixed">
				<text class="demo-text font-regular" style="font-size: 12px;">12px - 小号文本</text>
				<text class="demo-text font-regular" style="font-size: 14px;">14px - 正文文本</text>
				<text class="demo-text font-regular" style="font-size: 16px;">16px - 副标题文本</text>
				<text class="demo-text font-medium" style="font-size: 18px;">18px - 标题文本</text>
				<text class="demo-text font-semibold" style="font-size: 20px;">20px - 大标题</text>
				<text class="demo-text font-bold" style="font-size: 24px;">24px - 特大标题</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding: 20px;
	background-color: #fff;
}

.header {
	text-align: center;
	margin-bottom: 30px;
	
	.title {
		font-size: 24px;
		font-weight: 600;
		color: $uni-color-title;
	}
}

.demo-section {
	margin-bottom: 30px;
	
	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: $uni-color-subtitle;
		margin-bottom: 15px;
		display: block;
	}
	
	.font-demo {
		padding: 15px;
		background-color: $uni-bg-color-grey;
		border-radius: $uni-border-radius-lg;
		
		.demo-text {
			display: block;
			margin-bottom: 10px;
			line-height: 1.5;
			color: $uni-text-color;
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}
</style> 