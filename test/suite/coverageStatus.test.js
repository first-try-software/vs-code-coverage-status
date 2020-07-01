const expect = require('expect.js')
const vscode = require('vscode');
const { join } = require('path');
const { Extension } = require('../../extension/extension');

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}

describe('Coverage Status', () => {
  vscode.window.showInformationMessage('Start all tests.');
  const { window, workspace } = vscode;
  const subscriptions = [];
  const statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Right);

  describe('when there is NO open file', () => {
    it('hides the status bar item', () => {
      const extension = new Extension({ window, workspace, subscriptions, statusBarItem });

      extension.activate();

      expect(extension.isStatusBarItemVisible).to.be(false);
    });
  });

  describe('when there is an open file', () => {
    describe('and there is NO coverage data for the active document', async () => {
      it('hides the status bar item', async () => {
        const codeFileUri = vscode.Uri.file(join(__dirname, '../fixtures/file1.rb'));

        const document = await workspace.openTextDocument(codeFileUri)
        vscode.window.showTextDocument(document);

        const extension = new Extension({ window, workspace, subscriptions, statusBarItem });

        extension.activate();

        expect(extension.isStatusBarItemVisible).to.be(false);
      });
    });

    describe('and there is coverage data for the active document', () => {
      it('shows coverage data in the status bar', async () => {
        const codeFileUri = vscode.Uri.file(join(__dirname, '../fixtures/file2.rb'));

        const document = await workspace.openTextDocument(codeFileUri)
        vscode.window.showTextDocument(document);

        const extension = new Extension({ window, workspace, subscriptions, statusBarItem });

        extension.activate();
        await sleep(500);

        expect(extension.isStatusBarItemVisible).to.be(true);
      });
    });

    describe('when a coverage file is created', () => {
      const coverageData = `
SF:./file3.rb
DA:1,1
DA:3,1
DA:4,1
DA:5,1
end_of_record
`.trim();

      describe('and there is coverage data for the active document', () => {
        const coverageFileName = join(__dirname, '../fixtures/coverage/lcov3.info');

        beforeEach(async () => {
          const coverageUri = vscode.Uri.parse('untitled:' + coverageFileName);
          const coverageDocument = await vscode.workspace.openTextDocument(coverageUri);
          const editor = await vscode.window.showTextDocument(coverageDocument, 1, false);
          editor.edit(edit => {
            edit.insert(new vscode.Position(0, 0), coverageData);
          });
          await coverageDocument.save();
        });

        afterEach(async () => {
          await workspace.fs.delete(vscode.Uri.parse(coverageFileName));
        });

        it('shows coverage data in the status bar', async () => {
          const codeFileName = join(__dirname, '../fixtures/file3.rb');
          const codeFileUri = vscode.Uri.file(codeFileName);
          const document = await workspace.openTextDocument(codeFileUri)
          vscode.window.showTextDocument(document);

          const extension = new Extension({ window, workspace, subscriptions, statusBarItem });
          extension.activate();
          await sleep(500);

          expect(extension.coverageData[codeFileName]).to.equal('100');
          expect(extension.isStatusBarItemVisible).to.be(true);
        });
      });
    });

    describe('when a coverage file is updated', () => {
      const originalCoverageData = `
SF:./file4.rb
DA:1,1
DA:2,1
DA:3,0
DA:5,0
end_of_record
`.trim();
      const updatedCoverageData = `
SF:./file4.rb
DA:1,1
DA:2,1
DA:3,1
DA:5,0
end_of_record
`.trim();

      describe('and there is coverage data for the active document', () => {
        const coverageFileName = join(__dirname, '../fixtures/coverage/lcov4.info');

        beforeEach(async () => {
          const coverageUri = vscode.Uri.parse(coverageFileName);
          const coverageDocument = await vscode.workspace.openTextDocument(coverageUri);
          const editor = await vscode.window.showTextDocument(coverageDocument, 1, false);
          const startPosition = new vscode.Position(0, 0);
          const endPosition = new vscode.Position(6, 0);
          editor.edit(edit => edit.replace(new vscode.Range(startPosition, endPosition), updatedCoverageData));
          await coverageDocument.save();
        });

        afterEach(async () => {
          const coverageUri = vscode.Uri.parse(coverageFileName);
          const coverageDocument = await vscode.workspace.openTextDocument(coverageUri);
          const editor = await vscode.window.showTextDocument(coverageDocument, 1, false);
          const startPosition = new vscode.Position(0, 0);
          const endPosition = new vscode.Position(6, 0);
          editor.edit(edit => edit.replace(new vscode.Range(startPosition, endPosition), originalCoverageData));
          await coverageDocument.save();
        });

        it('shows coverage data in the status bar', async () => {
          const codeFileName = join(__dirname, '../fixtures/file4.rb');
          const codeFileUri = vscode.Uri.file(codeFileName);
          const document = await workspace.openTextDocument(codeFileUri)
          vscode.window.showTextDocument(document);

          const extension = new Extension({ window, workspace, subscriptions, statusBarItem });
          extension.activate();
          await sleep(500);

          expect(extension.coverageData[codeFileName]).to.equal('75');
          expect(extension.isStatusBarItemVisible).to.be(true);
        });
      });
    });
  });
});
