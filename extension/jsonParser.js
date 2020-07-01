const { Parser } = require("./parser");

class JsonParser extends Parser {
  files() {
    const json = this.parsedJson();
    const rspec = json.RSpec || {};
    const files = Object.entries(rspec.coverage || {});
    return files.map(([filename, lines]) => ({ filename, lines }));
  }

  coverage(lines) {
    const lineCoverage = !lines.lines ? lines : lines.lines;
    const coveredLines = lineCoverage.filter(line => line > 0).length;
    const totalLines = lineCoverage.filter(line => line !== null).length;
    return (coveredLines / totalLines * 100).toFixed(0);
  }

  parsedJson() {
    try {
      return JSON.parse(this.text);
    } catch (error) {
      return {};
    }
  }
}

exports.JsonParser = JsonParser;
