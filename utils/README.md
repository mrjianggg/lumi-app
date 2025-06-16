# HTTP请求工具封装

## 概述

这是一个基于 uni-app 的 `uni.request` 封装的HTTP请求工具，提供了完整的请求拦截、响应处理、错误处理和文件上传功能。

## 功能特性

- ✅ 基础URL配置
- ✅ 请求和响应拦截器
- ✅ 自动token处理
- ✅ 统一错误处理
- ✅ 加载状态管理
- ✅ 支持GET、POST、PUT、DELETE等HTTP方法
- ✅ 文件上传功能
- ✅ Promise和async/await支持
- ✅ 全局变量注册
- ✅ TypeScript友好（可扩展）

## 服务器配置

当前服务器地址：`http://101.126.145.3:8002`

可在 `utils/request.js` 中修改 `BASE_URL` 常量来更改服务器地址。

## 文件结构

```
utils/
├── request.js          # 核心HTTP请求封装
├── api.js             # API接口统一管理
├── 使用示例.js        # 详细使用示例
└── README.md          # 说明文档
```

## 快速开始

### 1. 全局使用（推荐）

由于已在 `main.js` 中注册为全局变量，可直接在任何页面或组件中使用：

```javascript
// 在页面或组件中直接使用
export default {
  methods: {
    async getData() {
      // 使用封装的API
      const result = await this.$api.user.getUserInfo(123)
      
      // 或使用原始HTTP方法
      const result2 = await this.$http.get('/api/data')
    }
  }
}
```

### 2. 导入使用

```javascript
import http from '@/utils/request.js'
import api from '@/utils/api.js'

// 使用
const result = await http.get('/api/data')
const userInfo = await api.user.getUserInfo(123)
```

## API方法

### 基础HTTP方法

```javascript
// GET请求
this.$http.get(url, params, config)

// POST请求
this.$http.post(url, data, config)

// PUT请求
this.$http.put(url, data, config)

// DELETE请求
this.$http.delete(url, params, config)

// 通用请求
this.$http.request(options)

// 文件上传
this.$http.upload(url, filePath, name, formData)
```

### 封装的业务API

```javascript
// 用户相关
this.$api.user.login(data)                    // 登录
this.$api.user.getUserInfo(userId)            // 获取用户信息
this.$api.user.register(data)                 // 注册
this.$api.user.updateUserInfo(data)           // 更新用户信息

// 商品相关
this.$api.product.getProductList(params)      // 获取商品列表
this.$api.product.getProductDetail(id)        // 获取商品详情
this.$api.product.createProduct(data)         // 创建商品

// 订单相关
this.$api.order.createOrder(data)             // 创建订单
this.$api.order.getOrderList(params)          // 获取订单列表
this.$api.order.payOrder(orderId, data)       // 支付订单

// 文件上传
this.$api.upload.uploadAvatar(filePath)       // 上传头像
this.$api.upload.uploadProductImage(filePath, productId) // 上传商品图片
```

## 使用示例

### 基础使用

```javascript
export default {
  data() {
    return {
      userInfo: {},
      loading: false
    }
  },
  
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const result = await this.$api.user.getUserInfo(123)
        this.userInfo = result.data
      } catch (error) {
        console.error('获取失败：', error.message)
      }
    },
    
    // 用户登录
    async login() {
      const loginData = {
        username: 'admin',
        password: '123456'
      }
      
      try {
        const result = await this.$api.user.login(loginData)
        uni.setStorageSync('token', result.data.token)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
      } catch (error) {
        // 错误已在拦截器中处理，这里可做额外处理
      }
    }
  }
}
```

### 文件上传

```javascript
methods: {
  async uploadImage() {
    try {
      // 选择图片
      const res = await uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera']
      })
      
      const filePath = res.tempFilePaths[0]
      
      // 上传图片
      const result = await this.$api.upload.uploadAvatar(filePath)
      console.log('上传成功：', result.data.url)
    } catch (error) {
      console.error('上传失败：', error.message)
    }
  }
}
```

### 并发请求

```javascript
methods: {
  async loadPageData() {
    try {
      // 同时请求多个接口
      const [userResult, productResult, orderResult] = await Promise.all([
        this.$api.user.getUserInfo(123),
        this.$api.product.getProductList({ page: 1 }),
        this.$api.order.getOrderList({ status: 'pending' })
      ])
      
      // 处理结果
      this.userInfo = userResult.data
      this.productList = productResult.data.list
      this.orderList = orderResult.data.list
    } catch (error) {
      console.error('页面数据加载失败：', error)
    }
  }
}
```

### 自定义配置

```javascript
methods: {
  async customRequest() {
    // 自定义请求头
    const config = {
      header: {
        'Custom-Header': 'custom-value'
      },
      timeout: 10000 // 10秒超时
    }
    
    const result = await this.$http.post('/api/custom', data, config)
  }
}
```

## 配置说明

### 基础配置

在 `utils/request.js` 中可修改以下配置：

```javascript
const BASE_URL = 'http://101.126.145.3:8002'  // 服务器地址
const TIMEOUT = 60000                          // 请求超时时间(毫秒)
```

### 请求头配置

默认请求头：

```javascript
{
  'Content-Type': 'application/json;charset=UTF-8'
}
```

### Token处理

请求会自动从本地存储中获取token并添加到请求头：

```javascript
// 获取token
const token = uni.getStorageSync('token')

// 自动添加到请求头
'Authorization': `Bearer ${token}`
```

## 响应数据格式

工具期望服务器返回以下格式的数据：

### 成功响应

```javascript
{
  code: 200,           // 或 success: true
  data: {},            // 实际数据
  message: '成功'      // 可选
}
```

### 错误响应

```javascript
{
  code: 400,           // 或 success: false
  message: '错误信息', // 或 msg: '错误信息'
  data: null           // 可选
}
```

## 错误处理

### HTTP状态码错误

- 401: 未授权，请重新登录
- 403: 拒绝访问
- 404: 请求地址不存在
- 500: 服务器内部错误

### 网络错误

- 超时错误
- 网络连接失败
- 其他网络异常

### 业务错误

根据服务器返回的错误信息进行处理。

## 注意事项

1. **Token管理**：登录成功后需要手动保存token到本地存储
2. **ErrorMessage**：错误信息会自动通过 `uni.showToast` 显示
3. **Loading状态**：请求期间会自动显示加载提示
4. **并发请求**：使用 `Promise.all()` 可以并发执行多个请求
5. **Vue3支持**：同时支持Vue2和Vue3的使用方式

## 扩展和自定义

### 添加新的API接口

在 `utils/api.js` 中添加新的API分组：

```javascript
export const newAPI = {
  getData() {
    return http.get('/api/new/data')
  },
  
  postData(data) {
    return http.post('/api/new/data', data)
  }
}
```

### 修改拦截器

在 `utils/request.js` 中的 `interceptRequest` 和 `interceptResponse` 方法中添加自定义逻辑。

### 添加新的HTTP方法

```javascript
// 在Request类中添加新方法
patch(url, data = {}, config = {}) {
  return this.request({
    url,
    method: 'PATCH',
    data,
    ...config
  })
}
```

## 常见问题

1. **Q: 如何修改服务器地址？**
   A: 修改 `utils/request.js` 中的 `BASE_URL` 常量

2. **Q: 如何处理特殊的响应格式？**
   A: 修改 `interceptResponse` 方法中的业务逻辑判断

3. **Q: 如何添加全局请求参数？**
   A: 在 `interceptRequest` 方法中添加到 `options.data` 或 `options.header`

4. **Q: 如何禁用自动loading提示？**
   A: 在请求配置中添加自定义标识，并在拦截器中判断处理

## 更新日志

- v1.0.0: 初始版本，包含基础HTTP请求封装
- 支持GET/POST/PUT/DELETE请求
- 支持文件上传
- 支持请求和响应拦截
- 支持全局变量注册 