const debounce = require("lodash.debounce");
const autobind = require("class-autobind");
const { join } = require("path");
const { FilesParser } = require("./filesParser");
const { Renderer } = require("./renderer");

class Extension {
  constructor({ window, workspace, subscriptions, statusBarItem }) {
    this.window = window;
    this.workspace = workspace;
    this.subscriptions = subscriptions;
    this.statusBarItem = statusBarItem;
    this.watchers = [];
    this.isStatusBarItemVisible = false;
    autobind.default(this);
  }

  activate() {
    this.subscriptions.push(this.window.onDidChangeActiveTextEditor(this.show));
    this.subscriptions.push(this.workspace.onDidChangeConfiguration(this.initialize));

    this.initialize();
  }

  initialize() {
    this.initializePlugin();
    this.initializeWatchers();
  }

  initializePlugin() {
    this.coverageData = {};
    const searchPatterns = this.workspace.getConfiguration("coverage-status").get("searchPatterns");
    const promises = searchPatterns.map(searchPattern => this.workspace.findFiles(searchPattern));
    Promise.all(promises).then(this.parseCoverageFileCollections).then(this.show);
  }

  initializeWatchers() {
    this.watchers.forEach(watcher => watcher.dispose());

    const folders = this.workspace.workspaceFolders;
    if (folders === undefined) { return; }

    const searchPatterns = this.workspace.getConfiguration("coverage-status").get("searchPatterns");
    this.watchers = searchPatterns.map((searchPattern) => {
      const relativePattern = join(folders[0].uri.fsPath, searchPattern)
      return this.workspace.createFileSystemWatcher(relativePattern);
    });

    this.watchers.forEach((watcher) => {
      watcher.onDidCreate(debounce(this.initializePlugin));
      watcher.onDidChange(debounce(this.initializePlugin, 500));
      watcher.onDidDelete(debounce(this.initializePlugin));
    });
  }

  async parseCoverageFileCollections(coverageFileCollections) {
    const fileCollection = coverageFileCollections.find(result => result && result.length > 0);
    if (fileCollection === undefined) { return; }

    const files = await Promise.all(this.getDocumentData(fileCollection));
    return this.parseFiles(files);
  }

  getDocumentData(fileCollection) {
    return fileCollection.map(async (uri) => {
      const document = await this.workspace.openTextDocument(uri);
      const fileName = document.fileName;
      const text = document.getText();

      return { fileName, text };
    });
  }

  parseFiles(files) {
    const rootPath = this.rootUri().fsPath;
    const callback = this.updateCoverageData;
    const parser = new FilesParser({ files, rootPath, callback });

    return parser.parse();
  }

  show() {
    const activeDocument = this.getActiveDocument();
    if (activeDocument === undefined) { return this.hide(); }

    const fileName = this.getActiveDocument().uri.fsPath;
    const coverage = this.coverageData[fileName];
    if (coverage === undefined) { return this.hide(); }

    const renderer = new Renderer(coverage);
    this.statusBarItem.text = renderer.text();
    this.statusBarItem.tooltip = renderer.tooltip();

    this.isStatusBarItemVisible = true;
    this.statusBarItem.show();
  }

  hide() {
    this.isStatusBarItemVisible = false;
    this.statusBarItem.hide();
  }

  updateCoverageData(data) {
    this.coverageData = { ...this.coverageData, ...data };
  }

  rootUri() {
    const folders = this.workspace.workspaceFolders;
    if (folders === undefined) { return; }

    return folders[0].uri;
  }

  getActiveDocument() {
    const activeTextEditor = this.getActiveTextEditor();
    if (activeTextEditor === undefined) { return; }

    return activeTextEditor.document;
  }

  getActiveTextEditor() {
    return this.window.activeTextEditor;
  }
}

exports.Extension = Extension;