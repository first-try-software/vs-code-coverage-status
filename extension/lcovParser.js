const { Parser } = require("./parser");

class LcovParser extends Parser {
  files() {
    return this.records().map(this.extractFiles).filter(file => !!file);
  }

  coverage(lines) {
    const coveredLineMatches = lines.match(/^DA:\s?\d+,\s?[1-9]\d*/gm)
    const coveredLines = coveredLineMatches ? coveredLineMatches.length : 0;
    const totalLines = lines.match(/^DA:/gm).length;
    return (coveredLines / totalLines * 100).toFixed(0);
  }

  records() {
    return this.text.match(/SF:.*?end_of_record/gs) || [];
  }

  extractFiles(record) {
    const match = record.match(/SF:(?<filename>.+?)\n(?<lines>.*?)end_of_record/s);
    return !!match ? match.groups : null;
  }
}

exports.LcovParser = LcovParser;
