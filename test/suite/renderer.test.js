const expect = require('expect.js');
const { Renderer } = require('../../extension/renderer');

describe('Renderer', () => {
  let renderer = coverage => new Renderer(coverage);

  describe('#text()', () => {
    describe('when coverage level is perfect', () => {
      it('returns the appropriate text', () => {
        const coverage = 100;
        expect(renderer(coverage).text()).to.eql('Coverage: 100% $(verified)');
      });
    });

    describe('when coverage level is high', () => {
      it('returns the appropriate text', () => {
        const coverage = 80;
        expect(renderer(coverage).text()).to.eql('Coverage: 80%');
      });
    });

    describe('when coverage level is medium', () => {
      it('returns the appropriate text', () => {
        const coverage = 50;
        expect(renderer(coverage).text()).to.eql('Coverage: 50%');
      });
    });

    describe('when coverage level is low', () => {
      it('returns the appropriate text', () => {
        const coverage = 1;
        expect(renderer(coverage).text()).to.eql('Coverage: 1%');
      });
    });

    describe('when coverage level is none', () => {
      it('returns the appropriate text', () => {
        const coverage = 0;
        expect(renderer(coverage).text()).to.eql('Coverage: 0% $(warning)');
      });
    });
  });

  describe('#tooltip()', () => {
    describe('when coverage level is perfect', () => {
      it('returns the appropriate tooltip', () => {
        const coverage = 100;
        expect(renderer(coverage).tooltip()).to.eql('Coverage: 100% - Way to go!');
      });
    });

    describe('when coverage level is high', () => {
      it('returns the appropriate tooltip', () => {
        const coverage = 80;
        expect(renderer(coverage).tooltip()).to.eql('Coverage: 80% - Almost there!');
      });
    });

    describe('when coverage level is medium', () => {
      it('returns the appropriate tooltip', () => {
        const coverage = 50;
        expect(renderer(coverage).tooltip()).to.eql('Coverage: 50% - You can do it!');
      });
    });

    describe('when coverage level is low', () => {
      it('returns the appropriate tooltip', () => {
        const coverage = 1;
        expect(renderer(coverage).tooltip()).to.eql('Coverage: 1% - Off to a good start!');
      });
    });

    describe('when coverage level is none', () => {
      it('returns the appropriate tooltip', () => {
        const coverage = 0;
        expect(renderer(coverage).tooltip()).to.eql('Coverage: 0% - You gotta start somewhere!');
      });
    });
  });
});
