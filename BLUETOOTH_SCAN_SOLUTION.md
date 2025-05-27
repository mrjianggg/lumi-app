# 蓝牙设备扫描解决方案

## 问题分析

您遇到的问题是：**ESP-IDF Provisioning 插件只能扫描 `PROV_` 开头的设备，无法扫描 `Lumi_` 开头的设备**。

### 根本原因

1. **插件限制**：`XM-EspIdfModule` 是专门为 ESP-IDF Provisioning 协议设计的插件
2. **协议特性**：ESP-IDF Provisioning 协议默认只识别 `PROV_` 前缀的设备
3. **内部过滤**：插件内部可能硬编码了设备名称过滤逻辑

根据搜索结果显示，[蓝牙设备名称过滤](https://devzone.nordicsemi.com/f/nordic-q-a/112633/bluetooth-filter-name) 是在蓝牙协议层面实现的，不同的蓝牙库有不同的过滤机制。

## 解决方案

### 方案1：使用 uni-app 原生蓝牙 API（推荐）

我已经为您创建了一个新的页面 `universal-bluetooth-scan.vue`，使用 [uni-app 原生蓝牙 API](https://en.uniapp.dcloud.io/api/system/bluetooth) 来扫描所有蓝牙设备。

#### 功能特点：
- ✅ **扫描所有蓝牙设备**：不受设备名称前缀限制
- ✅ **灵活过滤**：支持按 `PROV_`、`Lumi_` 或全部设备过滤
- ✅ **实时搜索**：支持按设备名称或ID搜索
- ✅ **详细信息**：显示设备名称、ID、信号强度、服务UUID等
- ✅ **调试功能**：完整的调试日志，方便排查问题

#### 使用方法：
1. 从首页点击"蓝牙扫描"卡片
2. 选择过滤条件（全部设备/PROV设备/Lumi设备）
3. 点击扫描按钮开始搜索
4. 在列表中查看和选择设备

### 方案2：修改现有页面（有限制）

虽然您已经尝试修改 `deviceNamePrefix` 为 `'Lumi_'`，但由于插件内部限制，这种方法可能无效。

## 技术对比

| 特性 | ESP-IDF插件 | uni-app原生API |
|------|-------------|----------------|
| 设备类型 | 仅ESP设备 | 所有蓝牙设备 |
| 名称过滤 | 固定PROV_ | 自定义过滤 |
| 扫描范围 | 受限 | 完整 |
| 调试信息 | 有限 | 详细 |
| 兼容性 | ESP专用 | 通用 |

## 代码示例

### 使用 uni-app 原生 API 扫描：

```javascript
// 初始化蓝牙适配器
uni.openBluetoothAdapter({
    success: (res) => {
        console.log('蓝牙适配器初始化成功');
        this.startScan();
    }
});

// 开始扫描
uni.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: false,
    success: (res) => {
        console.log('开始扫描成功');
    }
});

// 监听设备发现
uni.onBluetoothDeviceFound((res) => {
    res.devices.forEach(device => {
        // 按名称前缀过滤
        if (device.name && device.name.startsWith('Lumi_')) {
            this.addDevice(device);
        }
    });
});
```

### 设备过滤逻辑：

```javascript
filterDevices() {
    let devices = [...this.allDevices];
    
    // 按名称前缀过滤
    if (this.currentFilter) {
        devices = devices.filter(device => {
            const name = device.name || device.localName || '';
            return name.startsWith(this.currentFilter);
        });
    }
    
    // 按搜索文本过滤
    if (this.searchText) {
        const search = this.searchText.toLowerCase();
        devices = devices.filter(device => {
            const name = (device.name || device.localName || '').toLowerCase();
            return name.includes(search);
        });
    }
    
    this.filteredDevices = devices;
}
```

## 使用建议

### 1. 权限配置
确保 `manifest.json` 中已配置蓝牙权限：
```json
{
    "modules": {
        "Bluetooth": {}
    },
    "distribute": {
        "android": {
            "permissions": [
                "<uses-permission android:name=\"android.permission.BLUETOOTH\"/>",
                "<uses-permission android:name=\"android.permission.BLUETOOTH_ADMIN\"/>",
                "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>",
                "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>"
            ]
        }
    }
}
```

### 2. 测试步骤
1. 重新编译应用
2. 确保蓝牙已开启
3. 打开"蓝牙设备扫描"页面
4. 选择"Lumi设备"过滤条件
5. 开始扫描

### 3. 调试方法
- 开启调试模式查看详细日志
- 检查设备是否正确广播名称
- 确认设备在扫描范围内

## 常见问题

### Q: 为什么扫描不到 Lumi 设备？
A: 可能的原因：
1. 设备未开启蓝牙广播
2. 设备名称不是 `Lumi_` 开头
3. 设备距离太远或信号太弱
4. 权限未正确配置

### Q: 如何确认设备名称？
A: 
1. 使用手机的蓝牙设置查看附近设备
2. 使用第三方蓝牙扫描应用
3. 查看设备说明书或标签

### Q: 扫描到设备后如何连接？
A: 
- 如果是 PROV 设备：自动跳转到配网页面
- 如果是其他设备：需要根据设备协议实现连接逻辑

## 总结

通过使用 uni-app 原生蓝牙 API，您现在可以：
- ✅ 扫描所有类型的蓝牙设备
- ✅ 灵活过滤 `Lumi_` 开头的设备
- ✅ 获得详细的设备信息和调试日志
- ✅ 不受 ESP-IDF 插件的限制

这个解决方案完全绕过了 ESP-IDF 插件的限制，为您提供了完整的蓝牙设备扫描能力。 