window.pppaste = {};

function isEditableElement(element) {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  const type = element.type?.toLowerCase();

  if (tagName === "input") {
    const editableInputTypes = [
      "text",
      "email",
      "password",
      "number",
      "search",
      "tel",
      "url",
      "date",
      "datetime-local",
      "month",
      "week",
      "time",
      "range",
      "color",
    ];
    return editableInputTypes.includes(type);
  }
  return (
    tagName === "textarea" || tagName === "select" || element.isContentEditable
  );
}

if (!window.pppaste.isEditableElement)
  window.pppaste.isEditableElement = isEditableElement;

/**
 * 获取元素的唯一标识符：优先使用ID，否则生成XPath
 */
function getElementIdentifier(element) {
  if (element.id) return `id:${element.id}`;

  const getXPath = (el) => {
    if (!el || el.nodeType !== 1) return "";

    if (el.id) return `//*[@id="${el.id}"]`;

    const tag = el.tagName.toLowerCase();
    let index = 1;
    let sibling = el;

    while ((sibling = sibling.previousElementSibling)) {
      if (sibling.tagName.toLowerCase() === tag) index++;
    }

    const parentPath = getXPath(el.parentNode);
    return `${parentPath}/${tag}[${index}]`;
  };

  return `xpath:${getXPath(element)}`;
}

if (!window.pppaste.getElementIdentifier)
  window.pppaste.getElementIdentifier = getElementIdentifier;

/**
 * 高亮元素并添加序号脚注
 */
function highlightElement(element, index) {
  if (!element) return;

  // 高亮元素
  element.style.outline = "2px solid red";
  element.style.outlineOffset = "2px";

  // 获取元素的位置信息
  const rect = element.getBoundingClientRect();

  const footnote = document.createElement("div");
  footnote.className = "editable-element-footnote";
  footnote.textContent = `#${index + 1}`;

  footnote.style.position = "fixed";
  footnote.style.top = `${rect.top - 10}px`;
  footnote.style.left = `${rect.left - 10}px`;
  footnote.style.color = "white";
  footnote.style.backgroundColor = "red";
  footnote.style.fontSize = "10px";
  footnote.style.padding = "2px 4px";
  footnote.style.borderRadius = "8px";
  footnote.style.border = "1px solid white";
  footnote.style.zIndex = "9999";
  footnote.style.pointerEvents = "none";

  document.body.appendChild(footnote);

  // 保存引用用于清除
  element._footnoteElement = footnote;
}
if (!window.pppaste.highlightElement)
  window.pppaste.highlightElement = highlightElement;

/**
 * 与background.js通信获取存储数据
 */
function getEditableElements() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getEditableElements" }, (response) =>
      resolve(response?.editableElements || [])
    );
  });
}

/**
 * 与background.js通信设置存储数据
 */
function setEditableElements(editableElements) {
  return chrome.runtime.sendMessage({
    action: "setEditableElements",
    editableElements,
  });
}

/**
 * 添加元素到存储（去重）
 */
async function addToEditableElements(element) {
  if (!element || !isEditableElement(element)) return;

  const editableElements = await getEditableElements();
  const elementId = getElementIdentifier(element);

  // 检查是否已存在
  const exists = editableElements.some((el) => {
    if (el.id) return el.id === elementId.substring(3);
    if (el.xpath) return el.xpath === elementId.substring(6);
    return false;
  });
  if (exists) return;

  // 添加新元素
  const newElement = {
    id: elementId.startsWith("id:") ? elementId.substring(3) : null,
    timestamp: Date.now(),
    xpath: elementId.startsWith("xpath:") ? elementId.substring(6) : null,
    elementId: element.id || null,
  };

  const updatedElements = [...editableElements, newElement];
  await setEditableElements(updatedElements);

  // 高亮显示
  highlightElement(element, updatedElements.length - 1);
  console.log("✅ 已存储并高亮元素:", element);
}

if (!window.pppaste.addToEditableElements)
  window.pppaste.addToEditableElements = addToEditableElements;

function unhighlightElement(element) {
  if (!element) return;

  element.style.outline = "";
  element.style.outlineOffset = "";

  if (element._footnoteElement) {
    element._footnoteElement.remove();
    delete element._footnoteElement;
  }
}

if (!window.pppaste.unhighlightElement) {
  window.pppaste.unhighlightElement = unhighlightElement;
}

function findElementByIdentifier(identifier) {
  if (identifier.id) {
    return document.getElementById(identifier.id);
  }

  // 其余情况当作 XPath 处理
  try {
    return document.evaluate(
      identifier.xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } catch (e) {
    console.warn("Invalid XPath:", identifier.xpath, e);
    return null;
  }
}

if (!window.pppaste.findElementByIdentifier) {
  window.pppaste.findElementByIdentifier = findElementByIdentifier;
}

function clearElements(elements) {
  for (const el of elements) {
    const element = findElementByIdentifier(el);
    unhighlightElement(element);
  }
  chrome.runtime.sendMessage({ action: "clearEditableElements" });
}
if (!window.pppaste.resetElements) window.pppaste.resetElements = clearElements;

function removeLastElement(elements) {
  const lastElement = elements.pop();
  const element = findElementByIdentifier(lastElement);
  unhighlightElement(element);
  return elements;
}
if (!window.pppaste.removeLastElement)
  window.pppaste.removeLastElement = removeLastElement;

async function pasteContentToEditableElements(elements, splitRegex = /\s+/) {
  // 从background获取可编辑元素
  if (!elements || elements.length === 0) {
    console.warn("没有可编辑元素需要填充");
    return;
  }

  try {
    // 读取剪贴板内容
    const clipboardItems = await navigator.clipboard.read();
    let clipboardText = "";

    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type === "text/plain") {
          const blob = await clipboardItem.getType(type);
          clipboardText = await blob.text();
          break;
        }
      }
      if (clipboardText) break;
    }

    if (!clipboardText) {
      console.warn("剪贴板中没有文本内容");
      return;
    }

    // 按空格分割内容
    const segments = clipboardText.split(splitRegex).filter(Boolean);
    if (segments.length === 0) {
      console.warn("剪贴板内容分割后为空");
      return;
    }

    // 逐个填充内容
    for (let i = 0; i < elements.length; i++) {
      const element = findElementByIdentifier(elements[i]);
      if (!element || !document.contains(element)) {
        console.warn("元素已不在DOM中:", elements[i]);
        continue;
      }

      const value =
        i < segments.length ? segments[i] : segments[segments.length - 1];

      // 高亮当前元素
      element.style.outline = "2px solid red";
      element.style.outlineOffset = "2px";

      // 根据元素类型设置值
      if (
        element.tagName.toLowerCase() === "input" ||
        element.tagName.toLowerCase() === "textarea"
      ) {
        element.value = value;
        const event = new Event("input", { bubbles: true });
        element.dispatchEvent(event);
      } else if (element.isContentEditable) {
        element.textContent = value;
        const event = new Event("input", { bubbles: true });
        element.dispatchEvent(event);
      }

      element.focus();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("粘贴内容时出错:", error);
  } finally {
    // 取消所有高亮（需要先获取元素）
    clearElements(elements);
  }
}

if (!window.pppaste.pasteContentToEditableElements) {
  window.pppaste.pasteContentToEditableElements =
    pasteContentToEditableElements;
}

// 处理来自content_script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "paste":
      pasteContentToEditableElements(
        request.editableElements,
        new RegExp(request.splitRegexSource, request.splitRegexFlags)
      );
      break;

    case "clear":
      getEditableElements().then(clearElements);
      break;

    case "undo":
      getEditableElements().then(removeLastElement).then(setEditableElements);
      break;

    case "select":
      addToEditableElements(document.activeElement);
      break;

    case "reselect":
      if (request.lastEditableElements) {
        const selectedElements = [];
        for (let i = 0; i < request.lastEditableElements.length; i++) {
          const el = request.lastEditableElements[i];
          const element = findElementByIdentifier(el);
          if (element) {
            highlightElement(element, i);
            selectedElements.push(el);
          }
        }
        setEditableElements(selectedElements);
      }
      break;
  }
});
