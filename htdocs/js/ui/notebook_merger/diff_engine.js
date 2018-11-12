RCloudNotebookMerger.diff_engine = (function() {

  const DiffType = Object.freeze({
    NOCHANGE: 'nochange',
    REMOVED: 'removed',
    ADDED: 'added'
  });

  const ChangeType = Object.freeze({
    NEW: 'new',
    DELETED: 'deleted',
    BINARY: 'binary',
    IDENTICAL: 'nochange',
    MODIFIED: 'changed'
  });

  const MAX_FILE_LENGTH = 250000; // about 0.25 MB file

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
        if([ChangeType.DELETED, ChangeType.NEW].indexOf(file.changeDetails.fileChangeType) != -1) {
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

      const diffLines = (changeType, isTooLarge, owned, other) => {
        // No need to run full diff if any of the files is empty
        switch(changeType) {
          case ChangeType.MODIFIED:
              if(!isTooLarge) {
                return this._engine.diffLines(getContent(owned), getContent(other));
              } else {
                  return [{
                            removed: true,
                            value: getContent(owned),
                            count: getContent(owned).split('\n').length,
                          },
                          {
                            added: true,
                            value: getContent(other),
                            count: getContent(other).split('\n').length,

                          }];
              }
              break;
            case ChangeType.NEW:
              return [{
                        added: true,
                        value: getContent(other),
                        count: getContent(other).split('\n').length,
                      }];
            case ChangeType.DELETED:
              return [{
                        removed: true,
                        value: getContent(owned),
                        count: getContent(owned).split('\n').length,
                      }];
            default:
                return this._engine.diffLines(getContent(owned), getContent(other));

        }
      };

      let fileChangeType;
      let isTooLarge = false;

      if (!owned && other) {
        fileChangeType = ChangeType.NEW;
      } else if (owned && !other) {
        fileChangeType =  ChangeType.DELETED;
      } else if (owned.isBinary) {
        fileChangeType = ChangeType.BINARY;
      } else {
        if (getContent(owned) == getContent(other)) {
          fileChangeType = ChangeType.IDENTICAL;
        } else {
          fileChangeType = ChangeType.MODIFIED;
        }
      }

      if ([ChangeType.NEW, ChangeType.DELETED, ChangeType.MODIFIED].indexOf(fileChangeType) != -1 ) {
        if (getContent(owned).length > MAX_FILE_LENGTH || getContent(other).length > MAX_FILE_LENGTH) {
          console.warn(`File ${owned} or ${other} is too large, skipping diff generation`);
          isTooLarge = true;
        }
      }

      const diffs = diffLines(fileChangeType, isTooLarge, owned, other);

      const getDiffType = obj => {
              if (obj.added) {
                return DiffType.ADDED;
              } else if (obj.removed) {
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
        get isDeleted() { return [ChangeType.DELETED].indexOf(this.fileChangeType) != -1; },
        get isNew() { return [ChangeType.NEW].indexOf(this.fileChangeType) != -1; }
      }
    };
  }

  return diff_engine;

})();
