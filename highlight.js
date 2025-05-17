(function (document) {
  if (!window.pppaste) {
    window.pppaste = {};
  }

  /**
   * 检查元素是否可输入
   */
  window.pppaste.addToEditableElements(document.activeElement);
})(document);
