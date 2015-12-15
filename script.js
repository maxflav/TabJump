chrome.commands.onCommand.addListener(handleCommand);

function handleCommand(command) {
  if (command === "jump-tab-next") {
    doJumpTabNext();
  }

  if (command === "move-tab-right") {
    doMoveTabRight();
  }

  if (command === "move-tab-left") {
    doMoveTabLeft();
  }
}

function doJumpTabNext() {
  getCurrentTab(function(tab) {
    if (!tab) {
      return;
    }

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

function doMoveTabRight() {
  doMoveTab(true);
}

function doMoveTabLeft() {
  doMoveTab(false);
}

function doMoveTab(toTheRight) {
  getCurrentTab(function(tab) {
    if (!tab) {
      return;
    }

    var newIndex = toTheRight ? tab.index + 1 : tab.index - 1;
    chrome.tabs.move(tab.id, { index: newIndex }, function (movedTab) {
      if (movedTab.index === tab.index) {
        newIndex = toTheRight ? 0 : -1;
        // It didn't move, wrap around.
        chrome.tabs.move(tab.id, { index: newIndex });
      }
    });
  });
}

function getCurrentTab(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || !tabs.length) {
      return callback(null);
    }
    return callback(tabs[0]);
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