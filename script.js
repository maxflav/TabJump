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
    // Got the tab now get the windows
    console.log('tab');
    console.log(tab);

    chrome.windows.getAll(function(windows) {
      var nextWindowId = getNextWindowId(windows, tab.windowId);
      console.log(nextWindowId);
      console.log('windows');
      console.log(windows);
    });
  });
}

// Find the next window id in sequence after the current one
function getNextWindowId(windows, currentWindowId) {
  var lowestId = -1;
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
    return lowestId;
  }
  return closestAbove;
}