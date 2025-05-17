chrome.commands.onCommand.addListener((command) => {
  if (command === "highlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          files: ["highlight.js"],
        })
        .then(() => {
          console.log("PPPaste: Highlight Script injected.");
        })
        .catch((error) => {
          console.error("PPPaste: Error injecting highlight script:", error);
          console.error(error);
        });
    });
  } else if (command === "paste") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          files: ["paste.js"],
        })
        .then(() => {
          console.log("PPPaste: Paste Script injected.");
        })
        .catch((error) => {
          console.error("PPPaste: Error injecting paste script:", error);
          console.error(error);
        });
    });
  } else if (command === "clear") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "clear" });
    });
  } else if (command === "undo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
    });
  }
});

let editableElements = [];

// 处理来自content_script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getEditableElements":
      sendResponse({ editableElements });
      break;

    case "setEditableElements":
      editableElements = request.editableElements;
      // 可选：这里可以添加chrome.storage.local.set()进行持久化存储
      break;

    case "clearEditableElements":
      editableElements = [];
      // 可选：这里可以添加chrome.storage.local.set()进行持久化存储
      break;

    default:
      sendResponse({ error: "Unknown action" });
      break;
  }
});

// 初始化上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  // 创建父级菜单
  chrome.contextMenus.create({
    id: "pppaste-menu",
    title: "PPPaste 分隔方式",
    contexts: ["editable"],
  });

  // 添加分隔符选项
  ["空格", "逗号", "分号", "换行"].forEach((type) => {
    chrome.contextMenus.create({
      id: `pppaste-${type}`,
      parentId: "pppaste-menu",
      title: `按${type}分隔`,
      contexts: ["editable"],
    });
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const mapping = {
    "pppaste-空格": /\s+/,
    "pppaste-逗号": /,\s*/,
    "pppaste-分号": /;\s*/,
    "pppaste-换行": /\n/,
  };

  const delimiter = mapping[info.menuItemId];
  chrome.tabs.sendMessage(tab.id, {
    action: "paste",
    splitRegexSource: delimiter.source,
    splitRegexFlags: delimiter.flags,
    editableElements,
  });
});
