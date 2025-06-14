<template>
	<svg 
		:width="size" 
		:height="size" 
		viewBox="0 0 24 24" 
		fill="none" 
		xmlns="http://www.w3.org/2000/svg"
		:class="className"
	>
		<path 
			d="M2 10V13M6 6V17M10 3V21M14 8V15M18 5V18M22 10V13" 
			:stroke="color" 
			:stroke-width="strokeWidth" 
			stroke-linecap="round" 
			stroke-linejoin="round"
		/>
	</svg>
</template>

<script>
export default {
	name: 'AudioLinesIcon',
	props: {
		// 图标颜色
		color: {
			type: String,
			default: '#FF9B21'
		},
		// 图标大小
		size: {
			type: [String, Number],
			default: 24
		},
		// 线条粗细
		strokeWidth: {
			type: [String, Number],
			default: 2
		},
		// 自定义CSS类名
		className: {
			type: String,
			default: ''
		}
	}
}
</script>

<style scoped>
/* 可以在这里添加一些默认样式 */
svg {
	display: inline-block;
	vertical-align: middle;
}
</style> 