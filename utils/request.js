/**
 * HTTP请求封装
 * 基于uni.request封装的通用请求工具
 */

// 基础配置
import { BASE_URL } from '@/components/filters.js'

const TIMEOUT = 60000 // 60秒超时

/**
 * 封装的请求类
 */
class Request {
  constructor() {
    this.baseURL = BASE_URL + '/lumi'
    this.timeout = TIMEOUT
    this.header = {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }

  /**
   * 请求拦截器
   * @param {Object} options 请求配置
   */
  interceptRequest(options) {
    // 显示加载提示
    // uni.showLoading({
    //   title: '加载中...',
    //   mask: true
    // })

    // 添加token到请求头（如果存在）
    const token = uni.getStorageSync('token')
    if (token) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }

    // 处理URL
    if (!options.url.startsWith('http')) {
      options.url = this.baseURL + options.url
    }

    console.log('token===', token)
    console.log('请求地址：', options.url)
    console.log('请求参数：', options.data)
    
    return options
  }

  /**
   * 响应拦截器
   * @param {Object} response 响应数据
   */
  interceptResponse(response) {
    // 隐藏加载提示
    // uni.hideLoading()

    console.log('响应数据：', response)

    const { statusCode, data } = response

    // HTTP状态码检查
    if (statusCode === 200) {
      // 业务状态码检查
      if (data.code === 0) {
        return Promise.resolve(data)
      } else if(data.code === 401){
        // 未授权，跳转登录
        uni.navigateTo({
          url: '/pages/login/index'
        })
      } else {
        // 业务错误
        const errorMsg = data.message || data.msg || data.errMsg || '请求失败'
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        })
        return Promise.reject(new Error(errorMsg))
      }
    } else {
      // HTTP错误
      let errorMsg = '网络错误'
      switch (statusCode) {
        case 401:
          errorMsg = '未授权，请重新登录'
          // 可以在这里处理登录跳转
          break
        case 403:
          errorMsg = '拒绝访问'
          break
        case 404:
          errorMsg = '请求地址不存在'
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        default:
          errorMsg = `网络错误(${statusCode})`
      }
      
      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
      return Promise.reject(new Error(errorMsg))
    }
  }

  /**
   * 通用请求方法
   * @param {Object} options 请求配置
   */
  request(options = {}) {
    // 默认配置
    const defaultOptions = {
      method: 'GET',
      timeout: this.timeout,
      header: this.header,
      dataType: 'json',
      responseType: 'text'
    }

    // 合并配置
    options = Object.assign(defaultOptions, options)

    // 请求拦截
    options = this.interceptRequest(options)

    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success: (response) => {
          this.interceptResponse(response)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          // uni.hideLoading()
          console.error('请求失败：', error)
          
          let errorMsg = '网络连接失败'
          if (error.errMsg.includes('timeout')) {
            errorMsg = '请求超时'
          } else if (error.errMsg.includes('fail')) {
            errorMsg = '网络连接失败'
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          })
          reject(new Error(errorMsg))
        }
      })
    })
  }

  /**
   * GET请求
   * @param {String} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} config 其他配置
   */
  get(url, params = {}, config = {}) {
    return this.request({
      url,
      method: 'GET',
      data: params,
      ...config
    })
  }

  /**
   * POST请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 其他配置
   */
  post(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} config 其他配置
   */
  put(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   * @param {String} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} config 其他配置
   */
  delete(url, params = {}, config = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data: params,
      ...config
    })
  }

  /**
   * 文件上传
   * @param {String} url 上传地址
   * @param {String} filePath 文件路径
   * @param {String} name 文件对应的 key
   * @param {Object} formData 其他表单数据
   */
  upload(url, filePath, name = 'file', formData = {}) {
    if (!url.startsWith('http')) {
      url = this.baseURL + url
    }

    const token = uni.getStorageSync('token')
    const header = {}
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    // uni.showLoading({
    //   title: '上传中...',
    //   mask: true
    // })

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url,
        filePath,
        name,
        formData,
        header,
        success: (response) => {
          // uni.hideLoading()
          console.log('上传响应：', response)
          
          if (response.statusCode === 200) {
            try {
              const data = JSON.parse(response.data)
              // 适配不同的成功状态码格式
              if (data.code === 0 || data.code === 200 || data.success === true) {
                resolve(data)
              } else {
                const errorMsg = data.message || data.msg || data.errMsg || '上传失败'
                uni.showToast({
                  title: errorMsg,
                  icon: 'none'
                })
                reject(new Error(errorMsg))
              }
            } catch (e) {
              console.error('响应数据解析失败:', e)
              reject(new Error('响应数据解析失败'))
            }
          } else {
            const errorMsg = `上传失败(HTTP ${response.statusCode})`
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            })
            reject(new Error(errorMsg))
          }
        },
        fail: (error) => {
          // uni.hideLoading()
          console.error('上传失败：', error)
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }
}

// 创建请求实例
const http = new Request()

export default http 