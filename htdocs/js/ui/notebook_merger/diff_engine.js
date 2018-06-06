RCloud.UI.merging = (function() {

  const DiffType = Object.freeze({
    NOCHANGE: 'nochange',
    REMOVED: 'removed',
    ADDED: 'added'
  }); 

  const ChangeType = Object.freeze({
    NEWFILE: 'newfile', 
    DELETEDFILE: 'deletedfile',
    BINARY: 'binary',
    IDENTICAL: 'nochange',
    MODIFIED: 'changed'
  });

  const ChangedTypeDescription = Object.freeze({
    [ChangeType.NEWFILE]: 'Only in yours', 
    [ChangeType.DELETEDFILE]: 'Not found in other',
    [ChangeType.BINARY]: 'Binary',
    [ChangeType.IDENTICAL]: 'Identical',
    [ChangeType.MODIFIED]: 'Different'
  });

  const diff_engine = class {
    constructor() {
      require(["diff.min"], diff => {
        this.engine_ = diff;
      });
    }
    get_diff_info(owned, other) {

      let fileChangeType;

      if(!owned && other) {
        fileChangeType = ChangeType.NEWFILE;
      } else if(owned && !other) {
        fileChangeType =  ChangeType.DELETEDFILE;
      } else if(owned.isBinary) {
        fileChangeType = ChangeType.BINARY;
      } else {
        fileChangeType = owned.content == other.content ? ChangeType.IDENTICAL : ChangeType.MODIFIED;
      }

      const getContent = (file) => {
        if(!file || file.isBinary) {
          return '';
        } else {
          if(file.content.length) {
            return file.content.endsWith('\n') ? file.content : file.content + '\n';
          } 
          return file.content;
        }
      }

      const diffs = this.engine_.diffLines(getContent(owned), getContent(other)),
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
          startLineNumber: currentLineNumber,
          endLineNumber: currentLineNumber + (diff.count - 1),
          diffType: getDiffType(diff)
        });

        currentLineNumber += diff.count;
      });

      return {
        fileChangeType,
        get fileChangeTypeDescription() { return ChangedTypeDescription[this.fileChangeType] },
        content: _.pluck(diffs, 'value').join(''),
        lineInfo,
        modifiedLineInfo: _.filter(lineInfo, li => li.diffType !== DiffType.NOCHANGE),
        get changeCount() { return this.modifiedLineInfo.length; },
        get isChanged() { return this.fileChangeType == ChangeType.MODIFIED; } ,
        owned,
        other,
        get isNewOrDeleted() { return [ChangeType.NEWFILE, ChangeType.DELETEDFILE].indexOf(this.fileChangeType) != -1; }
      }
    }
  }

  return {
    diff_engine
  };

})();
