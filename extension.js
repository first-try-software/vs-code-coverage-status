const vscode = require("vscode");

let statusBarItem;
let coverageData = {};

function activate({ subscriptions }) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 900);
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(show));

  initialize();
}
exports.activate = activate;

// Private functions

function initialize() {
  vscode.workspace.onDidChangeTextDocument(handleChangeTextDocument);

  let found = false;

  vscode.workspace.findFiles("**/coverage/.resultset.json").then((uris) => {
    parseJson(uris[0]);
    found = true;
  });

  if (!found) {
    vscode.workspace.findFiles("**/coverage/lcov.info").then((uris) => {
      parseLcov(uris[0]);
      found = true;
    });
  }
}

function handleChangeTextDocument(event) {
  if (event.document.uri.fsPath.match("lcov.info")) {
    parseLcov(event.document.uri);
  }
}

function show() {
  const fileName = getActiveDocument().uri.fsPath;
  const coverage = coverageData[fileName]
  if (coverage === undefined) { return hide(); }

  const icon = coverage > 99 ? "$(verified)" : "$(warning)";
  statusBarItem.text = `${icon} ${coverage}%`;
  statusBarItem.show();
}

function hide() {
  statusBarItem.hide();
}

function parseJson(uri) {
  return vscode.workspace.openTextDocument(uri).then((document) => {
    const json = JSON.parse(document.getText());

    for (const [key, value] of Object.entries(json.RSpec.coverage)) {
      const meaningfulLines = value.lines.filter(line => line !== null).length;
      const coveredLines = value.lines.filter(line => line > 0).length;
      coverageData[key] = (coveredLines / meaningfulLines * 100).toFixed(0);
    }

    show();
  });
}

function parseLcov(uri) {
  return vscode.workspace.openTextDocument(uri).then((document) => {
    let lineNumber = 0
    let totalLines;
    let coveredLines;
    let currentFile;
    let currentFileFullPath;

    while (lineNumber < document.lineCount - 1) {
      const line = document.lineAt(lineNumber++);

      if (!!line.text.match(/^SF:/)) {
        totalLines = 0;
        coveredLines = 0;
        currentFile = line.text.match(/^SF:(.*)/)[1];
        currentFileFullPath = vscode.Uri.joinPath(rootUri(), currentFile).fsPath;
      } else if (!!line.text.match(/^DA:/)) {
        totalLines++;
        if (!line.text.match(/,0$/)) { coveredLines++; }
      } else if (!!line.text.match("end_of_record")) {
        coverageData[currentFileFullPath] = (coveredLines / totalLines * 100).toFixed(0);
      }
    }
    show();
  });
}

function rootUri() {
  const folders = vscode.workspace.workspaceFolders;
  if (folders === undefined) { return; }

  return folders[0].uri;
}

function getActiveDocument() {
  const activeTextEditor = getActiveTextEditor();
  if (activeTextEditor === undefined) { return; }

  return activeTextEditor.document;
}

function getActiveTextEditor() {
  return vscode.window.activeTextEditor;
}
