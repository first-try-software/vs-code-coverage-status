class Parser {
  constructor(text) {
    this.text = text || '{}';
  }

  parse() {
    return this.files().reduce(this.collectCoverageData.bind(this), {});
  }

  collectCoverageData(coverageData, { filename, lines }) {
    coverageData[filename] = this.coverage(lines);
    return coverageData;
  };

  files() {
    return [];
  }
}

exports.Parser = Parser;
