rcloud.start.python <- function()
{
  require(rpython2)
  py.init()
  sys <- py.import("sys")
  py.attr(sys, "path", .ref=TRUE)$append(dirname(system.file("python", "notebook_runner.py", package="rcloud.support")))
  sys$argv <- c("rcloud")
  py.eval("import notebook_runner")
  py.eval("runner = notebook_runner.NotebookRunner(extra_arguments=['--matplotlib=inline'], executable='python')")
  py.eval("def run(cmd): return runner.run_cmd(cmd)")
  .session$python.run <- py.get("run", .ref=TRUE)
}

rcloud.exec.python <- function(cmd)
{
  py.call(.session$python.run, cmd)
}
