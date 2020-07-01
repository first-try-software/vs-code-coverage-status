const mapKeys = require('lodash.mapkeys');
const { join } = require("path");
const { JsonParser } = require('./jsonParser');
const { LcovParser } = require('./lcovParser');

class FilesParser {
  constructor({ files, rootPath, callback }) {
    this.files = files || [];
    this.rootPath = rootPath;
    this.callback = callback;
  }

  parse() {
    return this.files.map(({ fileName, text }) => {
      if (!!fileName.match(".resultset.json")) {
        this.parseJson(text);
      } else if (!!fileName.match(/lcov.*\.info/)) {
        this.parseLcov(text);
      }
    });
  }

  parseJson(text) {
    const parser = new JsonParser(text);
    this.callback(parser.parse());
  }

  parseLcov(text) {
    const parser = new LcovParser(text);
    const parsedData = mapKeys(parser.parse(), this.absolutePath.bind(this));
    this.callback(parsedData);
  }

  absolutePath(_, relativePath) {
    return join(this.rootPath, relativePath);
  }
}

exports.FilesParser = FilesParser;
