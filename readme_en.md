# PPPaste

PPPaste is a Chrome extension that lets you quickly paste clipboard content into a selected input field by pressing a shortcut key. It's designed for efficient text pasting, formatting, and automation.

## 🧩 Features

- ⌨️ Paste via keyboard shortcut
- 🖱 Detect currently hovered/selected input element
- 📋 Paste clipboard content into that field
- 📎 Context menu with custom delimiters (e.g., comma, space, newline)
- 🌈 Highlight the current target element
- 🗑 Clear saved input reference
- ↩️ Undo last operation

## 🛠 Keyboard Shortcuts

| Action    | Shortcut        |
| --------- | --------------- |
| Paste     | Alt + Shift + V |
| Highlight | Alt + Shift + S |
| Clear     | Alt + Shift + C |
| Undo      | Alt + Shift + Z |

> You can customize these shortcuts at `chrome://extensions/shortcuts`.

## 📦 Permissions

- `clipboardRead`: Read content from clipboard
- `scripting`: Inject and execute scripts
- `commands`: Listen to keyboard shortcuts
- `contextMenus`: Add right-click menu
- `storage`: Save user data and preferences
- `host_permissions: <all_urls>`: Work on all websites for input detection

## 📁 File Structure

- `background.js`: Service worker that handles keyboard commands and context menu
- `content_script.js`: Handles DOM manipulation on web pages
- `manifest.json`: Extension manifest
- `assets/icon32.png`: Extension icon
- `highlight.js`: Injects highlight script
- `paste.js`: Injects paste script

## 📋 How to Use

1. Install the extension (developer mode)
2. Open any webpage with input fields
3. Hover or select the target input box
4. Press the shortcut key to paste clipboard content

## ⚠️ Notes

- The plugin remembers the last selected input field
- Make sure clipboard content is properly formatted before pasting
- You can choose a delimiter from the right-click menu (space, comma, newline, etc.)

## 📥 Installation (Developer Mode)

1. Go to Chrome extensions: `chrome://extensions`
2. Enable "Developer mode" at the top right
3. Click "Load unpacked"
4. Select this project folder
