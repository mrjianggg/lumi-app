<script>
	import { setStatusBarDark } from '@/utils/statusBar.js'
	
	export default {
		onLaunch: function() {
			console.log('App onLaunch')
			// 全局设置状态栏样式为深色（黑色文字）
			this.setStatusBarStyle()
		},
		onShow: function() {
			console.log('App Show')
			// 每次显示时也设置状态栏样式，确保一致性
			this.setStatusBarStyle()
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			setStatusBarStyle() {
				// 延迟执行，确保页面加载完成
				setTimeout(() => {
					setStatusBarDark()
				}, 100)
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* 全局样式 */
	page {
		background-color: #fff;
	}

</style>
