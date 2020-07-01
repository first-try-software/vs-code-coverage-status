const expect = require('expect.js')
const sinon = require('sinon');
const vscode = require('vscode');
const extension = require('../../extension');

describe('Coverage Status', () => {
  vscode.window.showInformationMessage('Start all tests.');

  describe('#activate()', () => {
    const subject = () => { extension.activate({ subscriptions }) };

    let sandbox;
    let subscriptions;

    beforeEach(() => {
      subscriptions = [];
      sandbox = sinon.createSandbox();
      sandbox.spy(vscode.window, "onDidChangeActiveTextEditor");
      sandbox.spy(vscode.workspace, "onDidChangeConfiguration");

      subject();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('subscribes to onDidChangeActiveTextEditor', () => {
      expect(vscode.window.onDidChangeActiveTextEditor.calledWith(extension.show)).to.be(true);
    });

    it('subscribes to onDidChangeConfiguration', () => {
      expect(vscode.workspace.onDidChangeConfiguration.calledWith(extension.initialize)).to.be(true);
    });
  });
});
