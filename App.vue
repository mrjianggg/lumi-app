<script>
    import http from '@/utils/request.js'
	export default {
		onLaunch: function() {
			// const token = uni.getStorageSync('token');
			// uni.showLoading({
			// 	title: '加载中...',
			// 	mask: true
			// })
			// if(!token){
			// 	uni.navigateTo({
			// 		url: '/pages/login/index'
			// 	})
			// }
			// uni.hideLoading();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
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
