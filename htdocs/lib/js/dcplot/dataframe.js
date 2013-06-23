/* an attempt to wrap dataframe access in an abstract
 interface that should work for other data too (?) 
 note: test on array-of-records data!
 */

function dataframe(frame) {
    var result = {
        accessor: function(column) { 
            var columnv = frame[column];
            return function(i) { 
                return columnv[i];
            };
        },
        // in particular this one may not work for array-of-records?
        index_accessor: function() {
            return function(i) {
                return i; 
            };
        },
        num_rows: function() {
            for(var col in frame) 
                return frame[col].length;
        },
        records: function() {
            return _.range(0, this.num_rows());
        }
    };
    return result;
}

