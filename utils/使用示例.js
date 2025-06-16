/**
 * HTTP请求工具使用示例
 * 展示如何在页面和组件中使用封装的请求工具
 */

// ==================== 方式一：直接导入使用 ====================

// 在页面或组件中导入
import http from './request.js'
import api from './api.js'

// 示例：在页面的methods中使用
export default {
  data() {
    return {
      userInfo: {},
      productList: [],
      loading: false
    }
  },
  
  methods: {
    // 1. 使用原始http实例
    async getUserInfo() {
      try {
        const result = await http.get('/api/user/info', { userId: 123 })
        this.userInfo = result.data
        console.log('用户信息：', result)
      } catch (error) {
        console.error('获取用户信息失败：', error.message)
      }
    },

    // 2. 使用封装的API方法
    async loginUser() {
      try {
        const loginData = {
          username: 'admin',
          password: '123456'
        }
        const result = await api.user.login(loginData)
        
        // 登录成功，保存token
        uni.setStorageSync('token', result.data.token)
        console.log('登录成功：', result)
        
        // 跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        console.error('登录失败：', error.message)
      }
    },

    // 3. 获取商品列表（带分页参数）
    async getProducts() {
      try {
        this.loading = true
        const params = {
          page: 1,
          size: 10,
          category: 'electronics'
        }
        const result = await api.product.getProductList(params)
        this.productList = result.data.list
        console.log('商品列表：', result)
      } catch (error) {
        console.error('获取商品列表失败：', error.message)
      } finally {
        this.loading = false
      }
    },

    // 4. 创建订单
    async createOrder() {
      try {
        const orderData = {
          productId: 1,
          quantity: 2,
          address: '北京市朝阳区xxx街道'
        }
        const result = await api.order.createOrder(orderData)
        console.log('订单创建成功：', result)
        
        uni.showToast({
          title: '订单创建成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('创建订单失败：', error.message)
      }
    },

    // 5. 文件上传示例
    async uploadImage() {
      try {
        // 选择图片
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        })
        
        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const result = await api.upload.uploadAvatar(filePath)
        console.log('图片上传成功：', result)
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('图片上传失败：', error.message)
      }
    }
  },

  // 页面加载时调用
  onLoad() {
    this.getUserInfo()
    this.getProducts()
  }
}

// ==================== 方式二：使用全局变量 ====================

// 在页面中直接使用全局变量（推荐方式）
export const globalUsageExample = {
  data() {
    return {
      userList: []
    }
  },
  
  methods: {
    // 使用全局的$http
    async fetchUserList() {
      try {
        const result = await this.$http.get('/api/users')
        this.userList = result.data
      } catch (error) {
        console.error('获取用户列表失败：', error)
      }
    },

    // 使用全局的$api
    async deleteUser(userId) {
      try {
        await this.$http.delete(`/api/users/${userId}`)
        // 删除成功后刷新列表
        this.fetchUserList()
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('删除用户失败：', error)
      }
    },

    // 使用封装的API方法
    async updateUserInfo(userData) {
      try {
        const result = await this.$api.user.updateUserInfo(userData)
        console.log('更新成功：', result)
      } catch (error) {
        console.error('更新失败：', error)
      }
    }
  }
}

// ==================== 方式三：在组合式API中使用 (Vue3) ====================

// Vue3 Composition API 使用示例
import { ref, onMounted, getCurrentInstance } from 'vue'

export function useUserAPI() {
  const { proxy } = getCurrentInstance()
  const userInfo = ref({})
  const loading = ref(false)

  const fetchUserInfo = async (userId) => {
    try {
      loading.value = true
      const result = await proxy.$api.user.getUserInfo(userId)
      userInfo.value = result.data
    } catch (error) {
      console.error('获取用户信息失败：', error)
    } finally {
      loading.value = false
    }
  }

  return {
    userInfo,
    loading,
    fetchUserInfo
  }
}

// ==================== 方式四：Promise和async/await混合使用 ====================

export const promiseExample = {
  methods: {
    // 使用Promise链式调用
    loginWithPromise() {
      const loginData = { username: 'test', password: '123' }
      
      this.$api.user.login(loginData)
        .then(result => {
          console.log('登录成功：', result)
          uni.setStorageSync('token', result.data.token)
          return this.$api.user.getUserInfo(result.data.userId)
        })
        .then(userResult => {
          console.log('用户信息：', userResult)
          this.userInfo = userResult.data
        })
        .catch(error => {
          console.error('操作失败：', error)
        })
    },

    // 使用async/await处理多个并发请求
    async loadPageData() {
      try {
        // 并发请求多个接口
        const [userResult, productResult, orderResult] = await Promise.all([
          this.$api.user.getUserInfo(123),
          this.$api.product.getProductList({ page: 1, size: 10 }),
          this.$api.order.getOrderList({ status: 'pending' })
        ])

        // 处理结果
        this.userInfo = userResult.data
        this.productList = productResult.data.list
        this.orderList = orderResult.data.list
        
        console.log('页面数据加载完成')
      } catch (error) {
        console.error('页面数据加载失败：', error)
      }
    }
  }
}

// ==================== 方式五：自定义配置请求 ====================

export const customConfigExample = {
  methods: {
    // 自定义请求头
    async customHeaderRequest() {
      const customConfig = {
        header: {
          'Custom-Header': 'custom-value',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      
      try {
        const result = await this.$http.post('/api/custom', { data: 'test' }, customConfig)
        console.log('自定义请求成功：', result)
      } catch (error) {
        console.error('自定义请求失败：', error)
      }
    },

    // 超时设置
    async timeoutRequest() {
      const config = {
        timeout: 5000 // 5秒超时
      }
      
      try {
        const result = await this.$http.get('/api/slow-endpoint', {}, config)
        console.log('请求成功：', result)
      } catch (error) {
        console.error('请求超时或失败：', error)
      }
    }
  }
}

// ==================== 实际页面使用示例 ====================

// 例如在 pages/user/login.vue 中的使用
/*
<template>
  <view class="login-container">
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="handleLogin" :loading="loading">登录</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        const result = await this.$api.user.login({
          username: this.username,
          password: this.password
        })
        
        // 保存token
        uni.setStorageSync('token', result.data.token)
        
        // 跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        // 错误处理已在拦截器中完成，这里可以做额外处理
        console.error('登录失败：', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
*/ 