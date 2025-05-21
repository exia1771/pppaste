let editableElements = [];
let lastEditableElements = null;

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "select":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "select" });
      });
      break;

    case "paste":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "paste",
          editableElements,
        });
      });
      break;

    case "clear":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "clear" });
      });
      break;

    case "undo":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
      });
      break;

    default:
      console.warn("PPPaste: Unknown command.");
      break;
  }
});

// 处理来自content_script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getEditableElements":
      sendResponse({ editableElements });
      break;

    case "setEditableElements":
      editableElements = request.editableElements;
      break;

    case "clearEditableElements":
      lastEditableElements = JSON.parse(JSON.stringify(editableElements));
      editableElements = [];
      break;
  }
});

const delimeters = [
  { title: "按空格分隔 ( )", regex: /\s+/, id: "pppaste-space" },
  { title: "按逗号分隔 (,)", regex: /,\s*/, id: "pppaste-comma" },
  {
    title: "按分号分隔 (;)",
    regex: /;\s*/,
    id: "pppaste-semicolon",
  },
  { title: "按换行分隔 (\\n)", regex: /\n/, id: "pppaste-linebreak" },
];
// 初始化上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  // 创建父级菜单
  chrome.contextMenus.create({
    id: "pppaste-menu",
    title: "PPPaste",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "pppaste-select",
    parentId: "pppaste-menu",
    title: "选中并高亮输入框 (Select)",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "pppaste-undo",
    parentId: "pppaste-menu",
    title: "撤销上一次操作 (Undo)",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "pppaste-reselect",
    parentId: "pppaste-menu",
    title: "重新选中 (Reselect)",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "pppaste-clear",
    parentId: "pppaste-menu",
    title: "清除高亮选中 (Clear)",
    contexts: ["editable"],
  });

  // 添加分隔符选项

  delimeters.forEach(({ title, id }) => {
    chrome.contextMenus.create({
      id,
      parentId: "pppaste-menu",
      title,
      contexts: ["editable"],
    });
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const delimiter = delimeters.find((d) => d.id === info.menuItemId);
  if (delimiter) {
    chrome.tabs.sendMessage(tab.id, {
      action: "paste",
      splitRegexSource: delimiter.regex.source,
      splitRegexFlags: delimiter.regex.flags,
      editableElements,
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "pppaste-select":
      chrome.tabs.sendMessage(tab.id, { action: "select" });
      break;

    case "pppaste-reselect":
      if (editableElements.length !== 0) return;
      chrome.tabs.sendMessage(tab.id, {
        action: "reselect",
        lastEditableElements,
      });
      break;

    case "pppaste-clear":
      chrome.tabs.sendMessage(tab.id, { action: "clear" });
      break;

    case "pppaste-undo":
      chrome.tabs.sendMessage(tab.id, { action: "undo" });
      break;
  }
});
