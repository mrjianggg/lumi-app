// 自定义Toast系统 - 统一H5和APP的实现
// 使用监听器模式，兼容所有平台
const globalToastState = {
  toasts: [],
  listeners: []
}

class CustomToast {
  constructor() {
    this.toastId = 0
    this.container = null
    this.init()
  }

  init() {
    // 初始化方法，现在主要用于保持兼容性
  }

  // 添加监听器
  addListener(callback) {
    globalToastState.listeners.push(callback)
  }

  // 移除监听器
  removeListener(callback) {
    const index = globalToastState.listeners.indexOf(callback)
    if (index > -1) {
      globalToastState.listeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  notifyListeners(toast) {
    globalToastState.listeners.forEach(callback => {
      try {
        callback(toast)
      } catch (error) {
        console.error('Toast监听器回调错误:', error)
      }
    })
  }

  // 不再需要DOM操作方法，统一使用Vue组件

  success(message, duration = 2000) {
    this.show('success', message, duration)
  }

  error(message, duration = 2000) {
    this.show('error', message, duration)
  }

  show(type, message, duration) {
    const toast = {
      id: ++this.toastId,
      type,
      message,
      duration,
      show: false
    }

    // 统一使用监听器系统，兼容H5和APP
    this.notifyListeners(toast)
  }
}

// 创建全局实例
const customToast = new CustomToast()

export default customToast 