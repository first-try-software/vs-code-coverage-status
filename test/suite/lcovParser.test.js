const expect = require('expect.js');
const { LcovParser } = require('../../extension/lcovParser');

describe('LcovParser', () => {
  let parser = text => new LcovParser(text);

  describe('when coverage text is undefined', () => {
    it('returns an empty object', () => {
      expect(parser().parse()).to.eql({});
    });
  });

  describe('when coverage text is an empty string', () => {
    it('returns an empty object', () => {
      expect(parser("").parse()).to.eql({});
    });
  });

  describe('when coverage text is NOT valid Lcov', () => {
    it('returns an empty object', () => {
      expect(parser("Invalid Lcov").parse()).to.eql({});
    });
  });

  describe('and there is partially valid Lcov', () => {
    const text = `
SF:
end_of_record
    `.trim();

    it('returns an empty object', () => {
      expect(parser(text).parse()).to.eql({});
    });
  });

  describe('when coverage text is valid Lcov', () => {
    describe('and the line coverage information does NOT have spaces', () => {
      const text = `
SF:file1
DA:1,1
DA:2,0
end_of_record
SF:file2
DA:1,0
DA:2,0
end_of_record
SF:file3
DA:1,1
DA:2,1
end_of_record
      `.trim();

      it('returns an object with coverage summary data', () => {
        expect(parser(text).parse()).to.eql({
          "file1": "50",
          "file2": "0",
          "file3": "100"
        });
      });
    });

    describe('and the line coverage information has spaces', () => {
      const text = `
SF:file1
DA: 1, 1
DA: 2, 0
end_of_record
SF:file2
DA: 1, 0
DA: 2, 0
end_of_record
SF:file3
DA: 1, 1
DA: 2, 1
end_of_record
      `.trim();

      it('returns an object with coverage summary data', () => {
        expect(parser(text).parse()).to.eql({
          "file1": "50",
          "file2": "0",
          "file3": "100"
        });
      });
    });

    describe('and the file includes branch coverage information', () => {
      const text = `
TN:
SF:file1
FN:16,(anonymous_1)
FN:26,(anonymous_2)
FNF:2
FNH:1
FNDA:1,(anonymous_1)
FNDA:0,(anonymous_2)
DA:2,1
DA:20,1
DA:29,0
DA:34,0
LF:4
LH:2
BRF:0
BRH:0
end_of_record
      `.trim();

      it('returns an object with coverage summary data', () => {
        expect(parser(text).parse()).to.eql({
          "file1": "50"
        });
      });
    });
  });
});
