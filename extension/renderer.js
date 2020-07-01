class Renderer {
  constructor(coverage) {
    this.coverage = coverage;
  }

  text() {
    return `Coverage: ${this.coverage}%${this.coverageLevel().icon}`;
  }

  tooltip() {
    return `Coverage: ${this.coverage}% - ${this.coverageLevel().tooltip}`;
  }

  coverageLevel() {
    if (this.coverage > 99) return { icon: " $(verified)", tooltip: "Way to go!" };
    if (this.coverage > 79) return { icon: "", tooltip: "Almost there!" };
    if (this.coverage > 49) return { icon: "", tooltip: "You can do it!" };
    if (this.coverage > 0) return { icon: "", tooltip: "Off to a good start!" };
    return { icon: " $(warning)", tooltip: "You gotta start somewhere!" };
  }
}

exports.Renderer = Renderer;