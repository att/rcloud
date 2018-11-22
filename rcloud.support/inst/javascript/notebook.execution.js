((function() {
    return {
        init: function (ocaps, k) {
            k();
          },
        
        runCell: function(cell_id, k) {
          try {
            let matching_cells = _.filter(shell.notebook.model.cells, (c) => { 
              return c.id() == cell_id; 
            });
            if (matching_cells.length > 0) {
              shell.run_notebook_cells([cell_id]);
            } else {
              console.error("Cell with id " + cell_id + " not found!");
            }
          } finally {
            k();
          }
        },
        
        runCells: function(cell_ids, k) {
          try {
            let matching_cells = _.filter(shell.notebook.model.cells, (c) => { 
              return cell_ids.indexOf(c.id()) >= 0; 
            });
            if (matching_cells.length > 0) {
              shell.run_notebook_cells(cell_ids);
            } else {
              console.error("Cells with ids " + cell_ids + " not found!");
            }
          } finally {
            k();
          }
        },
        
        runCellsFrom: function(cell_id, k) {
          try {
            let matching_cells = _.filter(shell.notebook.model.cells, (c) => { 
              return c.id() == cell_id; 
            });
            if (matching_cells.length > 0) {
                shell.run_notebook_from(cell_id);
            } else {
              console.error("Cell with id " + cell_id + " not found!");
            }
          } finally {
            k();
          }
        },
        
        stopExecution: function(k) {
          try {
            RCloud.UI.processing_queue.stopGracefully();
          } finally {
            k();
          }
        }
  };
})()) /*jshint -W033 */ // this is an expression not a statement
