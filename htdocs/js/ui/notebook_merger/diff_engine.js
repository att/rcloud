RCloud.UI.merging = (function() {

  const DiffType = Object.freeze({
    NOCHANGE: 'nochange',
    REMOVED: 'removed',
    ADDED: 'added'
  }); 

  const diff_engine = class {
    constructor() {
      require(["diff.min"], diff => {
        this.engine_ = diff;
      });
    }
    get_diff_info(from, to) {
      const getContent = (file) => {
        //(file.content.r_type && file.content.r_type === 'raw')
        if(file && (file.content && !file.content.r_type)) {
          return file.content;
        } else {
          return '';
        }
      }

      const diffs = this.engine_.diffLines(getContent(from), getContent(to)),
            getDiffType = obj => {
              if(obj.added) { // optimisation here?
                return DiffType.ADDED;
              } else if(obj.removed) {
                return DiffType.REMOVED;
              } else {
                return DiffType.NOCHANGE;
              }
            };
      let currentLineNumber = 1, lineInfo = [];

      diffs.forEach(diff => {
        lineInfo.push({
          startLine: currentLineNumber,
          endLine: currentLineNumber + (diff.count - 1),
          diffType: getDiffType(diff)
        });

        currentLineNumber += diff.count;
      });

      return {
        content: _.pluck(diffs, 'value').join(''),
        lineInfo,
        modifiedLineInfo: _.filter(lineInfo, li => li.diffType !== DiffType.NOCHANGE)
      }
    }
  }

  return {
    diff_engine
  };

})();
