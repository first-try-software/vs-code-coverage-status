const vscode = require("vscode");

let statusBarItem;
let coverageData = {};

const coverageLevels = {
  perfect: { icon: "$(verified)", tooltip: "First Try!" },
  high: { icon: "", tooltip: "Almost there!" },
  medium: { icon: "", tooltip: "You can do it!" },
  low: { icon: "", tooltip: "Step it up!" },
  none: { icon: "$(warning)", tooltip: "Really?!" }
}

function activate({ subscriptions }) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 900);
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(show));
  subscriptions.push(vscode.workspace.onDidChangeConfiguration(initialize));

  initialize();
}
exports.activate = activate;

// Private functions

function initialize() {
  coverageData = {};

  const globs = vscode.workspace.getConfiguration("coverage-status").get("searchPatterns");

  initializePlugin(globs);
  initializeWatchers(globs);
}

function initializePlugin(globs) {
  const promises = globs.map(glob => vscode.workspace.findFiles(glob));
  Promise.all(promises).then(parseResults);
}

function initializeWatchers(globs) {
  const watchers = globs.map(glob => vscode.workspace.createFileSystemWatcher(glob, false, false, true));

  watchers.forEach((watcher) => {
    watcher.onDidCreate(delay(initialize));
    watcher.onDidChange(delay(initialize));
  });
}

function delay(handler) {
  return (uri) => setTimeout(() => handler(uri), 500);
}

function parseResults(results) {
  const firstResult = results.find(result => !!result);
  if (firstResult === undefined) { return; }

  parseResult(firstResult);
}

function parseResult(result) {
  const firstUri = result[0];
  if (firstUri === undefined) { return; }

  if (!!firstUri.fsPath.match(".resultset.json")) {
    result.forEach(parseJson);
  } else if (!!firstUri.fsPath.match(/lcov.*\.info/)) {
    result.forEach(parseLcov);
  }
}

function show() {
  const activeDocument = getActiveDocument();
  if (activeDocument === undefined) { return hide(); }

  const fileName = getActiveDocument().uri.fsPath;
  const coverage = coverageData[fileName];
  if (coverage === undefined) { return hide(); }

  const coverageLevel = getCoverageLevel(coverage);
  statusBarItem.text = `Coverage: ${coverage}% ${coverageLevels[coverageLevel].icon}`;
  statusBarItem.tooltip = `Coverage: ${coverage}% - ${coverageLevels[coverageLevel].tooltip}`;
  statusBarItem.show();
}

function hide() {
  statusBarItem.hide();
}

function getCoverageLevel(coverage) {
  if (coverage > 99) return "perfect";
  if (coverage > 79) return "high";
  if (coverage > 49) return "medium";
  if (coverage >  0) return "low";
  return "none";
}

function parseJson(uri) {
  return vscode.workspace.openTextDocument(uri).then((document) => {
    const json = JSON.parse(document.getText());

    for (const [key, value] of Object.entries(json.RSpec.coverage)) {
      const lines = value.lines === undefined ? value : value.lines;
      const meaningfulLines = lines.filter(line => line !== null).length;
      const coveredLines = lines.filter(line => line > 0).length;
      coverageData[key] = (coveredLines / meaningfulLines * 100).toFixed(0);
    }
    console.log(coverageData);
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
