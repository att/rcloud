rcloud.start.python <- function()
{
  require(rpython2, quietly=TRUE)
  py.init()
  sys <- py.import("sys")
  path <- system.file("python", package="rcloud.support")
  py.attr(sys, "path", .ref=TRUE)$append(path)
  sys$argv <- c("rcloud")
  py.eval("import notebook_runner")
  py.eval(paste("runner = notebook_runner.NotebookRunner(rcloud_support_path='", path, "', extra_arguments=['--matplotlib=inline'], executable='python')", sep=''))
  py.eval("def run(cmd): return runner.run_cmd(cmd)")
  py.eval("def magic(cmd): return runner.run_magic(cmd)")
  .session$python.run <- py.get("run", .ref=TRUE)
  .session$python.magic <- py.get("magic", .ref=TRUE)
}

rcloud.exec.python <- function(cmd)
{
  if (.session$device.pixel.ratio > 1) {
    py.call(.session$python.magic, "config InlineBackend.figure_format = 'retina'")
  }
  py.call(.session$python.run, cmd)
}
