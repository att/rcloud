/* an attempt to wrap dataframe access in an abstract
 interface that should work for other data too (?)
 note: test on array-of-records data!
 */
var dataframe = {
    cols: function(data) {
        var result = {
            access: function(column) {
                if(!(column in data))
                    throw "dataframe doesn't have column " + column.toString();
                var columnv = data[column];
                return function(i) {
                    return columnv[i];
                };
            },
            index: function(i) {
                return i;
            },
            num_rows: function() {
                for(var col in data)
                    return data[col].length;
            },
            has: function(k) {
                return k in data;
            },
            records: function() {
                return _.range(0, this.num_rows());
            }
        };
        return result;
    },
    rows: function(data) {
        var result = {
            access: function(column) {
                return function(i) {
                    return data[i][column];
                };
            },
            // we could get rid of row indices and just use rows
            // except here (?)
            index: function(i) {
                return i;
            },
            num_rows: function() {
                return data.length;
            },
            has: function(k) {
                return k in data[0];
            },
            records: function() {
                return _.range(0, this.num_rows());
            }
        };
        return result;
    }
};
