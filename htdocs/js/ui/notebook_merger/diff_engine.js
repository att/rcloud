RCloudNotebookMerger.diff_engine = (function() {

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

  const diff_engine = class {
    constructor() {
      require(["diff.min"], diff => {
        this._engine = diff;
      });
    }
    getResolvedContent(file) {

      if(file.isBinary) {
        return file.content;
      } else {
        // deleted means that this file only exists in your notebook:
        if([ChangeType.DELETEDFILE, ChangeType.NEWFILE].indexOf(file.changeDetails.fileChangeType) != -1) {
          return file.content;
        } else {
          // diffs:
          let { diffs, lineInfo } = file.changeDetails,
              acceptedChanges = _.filter(lineInfo, li => li.diffType != ChangeType.IDENTICAL && !li.isRejected),
              resolved = [];

          if(!acceptedChanges) {
            return file.content;
          } else {
            _.each(lineInfo, (li, index) => {
              if(li.diffType == 'removed' && li.isRejected || 
                 li.diffType == 'added' && !li.isRejected ||
                 li.diffType == 'nochange') {
                resolved.push(diffs[index].value);
              }
            });
      
            return resolved.join('');
          }
        }
      }
    }
    get_diff_info(owned, other) {

      const getContent = (file) => {
        if(!file || file.isBinary) {
          return '';
        } else {
          if(file.content.length) {
            return file.content.endsWith('\n') ? file.content : file.content + '\n';
          } 
          return file.content;
        }
      };
      
      let fileChangeType;

      if(!owned && other) {
        fileChangeType = ChangeType.NEWFILE;
      } else if(owned && !other) {
        fileChangeType =  ChangeType.DELETEDFILE;
      } else if(owned.isBinary) {
        fileChangeType = ChangeType.BINARY;
      } else {
        fileChangeType = getContent(owned) == getContent(other) ? ChangeType.IDENTICAL : ChangeType.MODIFIED;
      }

      const diffs = this._engine.diffLines(getContent(owned), getContent(other)),
            getDiffType = obj => {
              if(obj.added) {
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
        diffs,
        content: _.pluck(diffs, 'value').join(''),
        lineInfo,
        modifiedLineInfo: _.filter(lineInfo, li => li.diffType !== DiffType.NOCHANGE),
        get changeCount() { return this.modifiedLineInfo.length; },
        get isChanged() { return [ChangeType.MODIFIED, ChangeType.BINARY].indexOf(this.fileChangeType) != -1; },
        owned,
        other,
        get isNewOrDeleted() { return this.isDeleted || this.isNew;  },
        get isDeleted() { return [ChangeType.DELETEDFILE].indexOf(this.fileChangeType) != -1; },
        get isNew() { return [ChangeType.NEWFILE].indexOf(this.fileChangeType) != -1; }
      }
    };
  }

  return diff_engine;

})();
