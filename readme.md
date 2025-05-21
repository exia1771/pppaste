# PPPaste

A Chrome Extension for power users to quickly paste clipboard content into a selected input element by pressing a shortcut key.

一个用于快速粘贴剪贴板内容到选中输入框的 Chrome 插件，支持快捷键操作与右键菜单分隔符选项。

---

## ⌨️ Keyboard Shortcuts / 快捷键

| Action / 操作                      | Default Shortcut / 默认快捷键 |
| ---------------------------------- | ----------------------------- |
| Paste / 粘贴(默认使用空格分割行为) | Alt + Shift + V               |
| Select / 选中并高亮输入框          | Alt + Shift + S               |
| Clear / 清除所有高亮选中           | Alt + Shift + C               |
| Undo / 撤销上一个高亮选中          | Alt + Shift + Z               |

> You can customize shortcuts at `chrome://extensions/shortcuts`  
> 快捷键可在 `chrome://extensions/shortcuts` 页面自定义

---

## 🛠 Installation / 安装方式

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this project folder
4. 插件会自动注入脚本至所有网页页面

---

## 📋 How to Use / 使用方法

1. 将鼠标移动到任意网页上的输入框（input 或 textarea）
2. 按下快捷键 `Alt + Shift + S` 选中输入框
3. 按下快捷键 `Alt + Shift + V` 粘贴
4. 剪贴板内容将自动填入上一步选中的输入框
5. 可使用右键菜单选择分隔符进行多段粘贴处理

---

## 🔐 Permissions / 权限说明

- `clipboardRead`：读取剪贴板内容
- `scripting`：注入脚本操作页面
- `commands`：监听快捷键
- `contextMenus`：注册右键菜单
- `host_permissions: <all_urls>`：允许访问所有页面进行注入

---

## 📄 License / 开源协议

This project is licensed under the **MIT License**.  
本项目采用 **MIT 开源协议**，可自由使用、修改和分发。

请见 [LICENSE](./LICENSE) 文件。
