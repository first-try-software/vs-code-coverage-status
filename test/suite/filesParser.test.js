const expect = require('expect.js');
const sinon = require('sinon');

const { FilesParser } = require('../../extension/filesParser');

describe('FilesParser', () => {
  let parser = params => new FilesParser(params);
  let files;
  let rootPath;
  let callback = sinon.spy();
  let params = { files, rootPath, callback };

  afterEach(() => callback.resetHistory());

  describe('#parse()', () => {
    describe('when files is undefined', () => {
      beforeEach(() => {
        files = undefined;
      });

      it('does NOT call the callback', () => {
        parser(params).parse();
        expect(callback.called).to.be(false);
      });
    });

    describe('when files is empty', () => {
      beforeEach(() => {
        files = [];
      });

      it('does NOT call the callback', () => {
        parser(params).parse();
        expect(callback.called).to.be(false);
      });
    });

    describe('when files is NOT empty', () => {
      describe('and the file matches the simplecov json format', () => {
        beforeEach(() => {
          const file = {
            fileName: './coverage/.resultset.json',
            text: JSON.stringify({ "RSpec": { "coverage": { "file": { "lines": [1, 0] } } } }),
          };

          params = { ...params, files: [file] };
        });

        it('calls the callback with coverage data', () => {
          parser(params).parse();
          expect(callback.getCall(0).args[0]).to.eql({ "file": "50" });
        });
      });

      describe('and the files match the lcov format', () => {
        beforeEach(() => {
          const file1 = {
            fileName: './coverage/lcov1.info',
            text: "SF:./file1\nDA:1,1\nDA:2,0\nend_of_record\nSF:./file2\nDA:1,1\nDA:2,0\nend_of_record",
          };
          const file2 = {
            fileName: './coverage/lcov2.info',
            text: "SF:./file3\nDA:1,1\nDA:2,1\nend_of_record\nSF:./file4\nDA:1,1\nDA:2,1\nend_of_record",
          };
          files = [file1, file2];
          rootPath = 'root_path';

          params = { ...params, files, rootPath };
        });

        it('calls the callback with coverage data', () => {
          parser(params).parse();
          expect(callback.getCall(0).args[0]).to.eql({ "root_path/file1": "50", "root_path/file2": "50" });
          expect(callback.getCall(1).args[0]).to.eql({ "root_path/file3": "100", "root_path/file4": "100" });
        });
      });
    });
  });
});
