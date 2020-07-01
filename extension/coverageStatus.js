const vscode = require("vscode");
const { Extension } = require("./extension");

function activate({ subscriptions }) {
  console.log("First Try! Software presents Coverage Status!");

  const { window, workspace } = vscode;
  const statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Right, 900);
  const extension = new Extension({ window, workspace, subscriptions, statusBarItem });

  extension.activate();
}

exports.activate = activate;
