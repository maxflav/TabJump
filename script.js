chrome.commands.onCommand.addListener(handleCommand);

function handleCommand(command) {
  if (command === "jump-tab-next") {
    doJumpTabNext();
  }
}

function doJumpTabNext() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || !tabs.length) {
      return;
    }
    var tab = tabs[0];

    chrome.windows.getAll(function(windows) {
      var nextWindowId = getNextWindowId(windows, tab.windowId);

      if (nextWindowId === -1) {
        chrome.windows.create({ tabId: tab.id, focused: true });
      } else {
        chrome.tabs.move(tab.id, { windowId: nextWindowId, index: -1 });
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(nextWindowId, { focused: true });
      }
    });
  });
}

// Find the next window id in sequence after the current one
// If there is only one window, returns -1
function getNextWindowId(windows, currentWindowId) {
  var lowestId = Infinity;
  var closestAbove = Infinity;
  windows.forEach(function(w) {
    var id = w.id;
    if (id === currentWindowId) {
      return;
    }

    if (id < lowestId) {
      lowestId = id;
    }

    if (id > currentWindowId && id < closestAbove) {
      closestAbove = id;
    }
  });

  if (closestAbove === Infinity) {
    if (lowestId === Infinity) {
      return -1;
    }
    return lowestId;
  }
  return closestAbove;
}