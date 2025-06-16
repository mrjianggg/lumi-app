/**
 * API接口统一管理
 * 使用封装的HTTP请求工具
 */
import http from './request.js'

/**
 * 用户相关API
 */
export const userAPI = {
  // 用户登录
  login(data) {
    return http.post('/api/user/login', data)
  },

  // 获取用户信息
  getUserInfo(userId) {
    return http.get('/api/user/info', { userId })
  },

  // 更新用户信息
  updateUserInfo(data) {
    return http.put('/api/user/info', data)
  },

  // 用户注册
  register(data) {
    return http.post('/api/user/register', data)
  },

  // 修改密码
  changePassword(data) {
    return http.post('/api/user/change-password', data)
  }
}

/**
 * 商品相关API
 */
export const productAPI = {
  // 获取商品列表
  getProductList(params) {
    return http.get('/api/products', params)
  },

  // 获取商品详情
  getProductDetail(productId) {
    return http.get(`/api/products/${productId}`)
  },

  // 创建商品
  createProduct(data) {
    return http.post('/api/products', data)
  },

  // 更新商品
  updateProduct(productId, data) {
    return http.put(`/api/products/${productId}`, data)
  },

  // 删除商品
  deleteProduct(productId) {
    return http.delete(`/api/products/${productId}`)
  }
}

/**
 * 订单相关API
 */
export const orderAPI = {
  // 创建订单
  createOrder(data) {
    return http.post('/api/orders', data)
  },

  // 获取订单列表
  getOrderList(params) {
    return http.get('/api/orders', params)
  },

  // 获取订单详情
  getOrderDetail(orderId) {
    return http.get(`/api/orders/${orderId}`)
  },

  // 取消订单
  cancelOrder(orderId) {
    return http.put(`/api/orders/${orderId}/cancel`)
  },

  // 支付订单
  payOrder(orderId, data) {
    return http.post(`/api/orders/${orderId}/pay`, data)
  }
}

/**
 * 文件上传API
 */
export const uploadAPI = {
  // 上传头像
  uploadAvatar(filePath) {
    return http.upload('/api/upload/avatar', filePath, 'avatar')
  },

  // 上传商品图片
  uploadProductImage(filePath, productId) {
    return http.upload('/api/upload/product', filePath, 'image', { productId })
  },

  // 批量上传图片
  uploadImages(filePaths) {
    const promises = filePaths.map(filePath => 
      http.upload('/api/upload/image', filePath, 'image')
    )
    return Promise.all(promises)
  }
}

/**
 * 通用API - 直接导出http实例供灵活使用
 */
export { http }

/**
 * 所有API的默认导出
 */
export default {
  user: userAPI,
  product: productAPI,
  order: orderAPI,
  upload: uploadAPI,
  http
} 