(function () {
  // 执行主函数
  chrome.runtime.sendMessage({ action: "getEditableElements" }, (response) => {
    pasteContentToEditableElements(response?.editableElements || []);
  });
})();
