rcloud.start.python <- function()
{
  require(rPython)
  python.exec.string("import sys")
  python.exec(sys$path$append(.r(dirname(system.file("python", "notebook_runner.py", package="rcloud.support")))))
  python.exec.string("import notebook_runner")
  python.exec.string("runner = notebook_runner.NotebookRunner(extra_arguments=['--matplotlib=inline'], executable='python')")
  python.exec.string("def run(cmd): return runner.run_cmd(cmd)")
}

rcloud.exec.python <- function(cmd)
{
  python.eval(run(.r(cmd)))
}
