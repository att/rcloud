# RCloud Jupyter Package

`rcloud.jupyter` package introduces support for Jupyter kernels via Jupyter nbconvert API

> rcloud.jupyter and rcloud.python packages are incompatible and should not be loaded into RCloud at the same time.

# Configuration

## Jupyter Installation

RCloud integrates with a single Jupyter backend, depending on which Python version RCloud integrates with, run one of the following commands:

### Python 2

```{bash}
sudo python -m pip install jupyter
```

### Python 3

```{bash}
sudo python3 -m pip3 install jupyter
```

### R Dependencies

rcloud.jupyter package uses reticulate and jsonlite packages to invoke Python code, these needs to be installed into R:

```
install.packages("jsonlite")
install.packages("reticulate")
```

### RCloud Configuration

RCloud Jupyter package uses these settings from `rcloud.conf`:

 * rcloud.jupyter.python.path - path to Python installation that should be used (e.g. `/usr/bin/python3`)
 * rcloud.jupyter.python.extra.libs - additional Python lib directories (e.g. where Jupyter Python modules got installed) (optional)
 * rcloud.jupyter.cell.startup.timeout - timeout (in seconds) for Jupyter kernels to start up, default 600 seconds (optional)
 * rcloud.jupyter.cell.exec.timeout - timeout (in seconds) for Jupyter cells executions, default 1200 seconds (optional)
 * rcloud.jupyter.language.mapping.config - specifies custom location of mapping.json file (optional)

To enable `rcloud.jupyter` add it to `rcloud.languages` setting in `rcloud.conf` AND remove `rcloud.python` if it is listed there.

After (re-)starting RCloud, Python integration via Jupyter should work, if it isn't, please read on.


## Python Kernels

If no kernels are configured, Jupyter will create a runtime Python kernel using the same version of Python that Jupyter uses. However if location of Python modules is not standard and/or some of the dependencies have been installed under user-specific location (e.g. `/home/[USER_NAME]/.local/lib/python3.5/site-packages`), then Jupyther will fail to start up such kernel and kernel will need to be explicitly configured (see sections below).



### Python 2 kernel

To register Python 2 kernel run the following command:

```{bash}
python -m ipykernel install --user
```

### Python 3 kernel

To register Python 3 kernel run the following command:

```{bash}
python3 -m ipykernel install --user
```

### Configure PYTHONPATH

In rare occasions when Python modules are installed in non-standard locations, kernel configuration generated in previous steps will need to be updated so `PYTHONPATH` is correct. The following example shows python3 kernel specification with extra PYTHONPATH locations which hold ipython dependencies:

```{json}

{
 "argv": ["/usr/bin/python3", "-m", "ipykernel_launcher",
          "-f", "{connection_file}"],
 "display_name": "Python 3",
 "language": "python",
 "env": {
    "PYTHONPATH" : "${PYTHONPATH}:/home/vagrant/.local/lib/python3.5/site-packages:/usr/local/lib/python3.5/dist-packages"
  }
}

```

## Runtime Settings

### Listing Kernels

To get a list of registered kernels run this R command in RCloud notebook:
```{R}
rcloud.jupyter:::rcloud.jupyter.list.kernel.specs(rcloud.support:::.session) 
```
Example output:
```{R}
$python2
$python2$resource_dir
[1] "/home/vagrant/.local/share/jupyter/kernels/python2"

$python2$spec
$python2$spec$env
named list()

$python2$spec$display_name
[1] "Python 2"

$python2$spec$metadata
named list()

$python2$spec$language
[1] "python"

$python2$spec$interrupt_mode
[1] "signal"

$python2$spec$argv
[1] "/usr/bin/python"    "-m"                 "ipykernel_launcher"
[4] "-f"                 "{connection_file}"



$python3
$python3$resource_dir
[1] "/usr/share/jupyter/kernels/python3"

$python3$spec
$python3$spec$env
$python3$spec$env$PYTHONPATH
[1] "${PYTHONPATH}:/home/vagrant/.local/lib/python3.5/site-packages:/usr/local/lib/python3.5/dist-packages"


$python3$spec$display_name
[1] "Python 3"

$python3$spec$metadata
named list()

$python3$spec$language
[1] "python"

$python3$spec$interrupt_mode
[1] "signal"

$python3$spec$argv
[1] "/usr/bin/python3"   "-m"                 "ipykernel_launcher"
[4] "-f"                 "{connection_file}"


```


### Language Support

RCloud is capable of invoking Jupyter kernels available in the system. General rule is that if a kernel is correctly configured so it can be executed from Jupyter notebook, RCloud will also be able to invoke such kernel.

#### Syntax highlighting

RCloud ships ACE modes for the following languages:

 * R
 * Python
 * Julia
 * Perl
 * Scala
 * Java
 * JavaScript
 * go

#### Language Mapping

Default language mapping is located in `inst/jupyter/mapping.json`, it contains mapping information and configuration necessary to RCloud to support a given language. For example Python 2 support is defined as follows:

```
{
  "python2" : {
    "hljs.class" : "py",
    "extension" : "py",
    "ace.mode" : "ace/mode/python",
    "display.name" : "Python 2",
    "init.script" : "function(rcloud.session) { retina <- ''; if (rcloud.session$device.pixel.ratio > 1) { retina <- \"config InlineBackend.figure_format = 'retina'\" }; inline_plots <- '%matplotlib inline';  paste0(retina, '\n', inline_plots) }"
  }
}
```

The key in the above map is a Jupyter kernel name, the value is a map with the following RCloud language options:

 * `kljs.class` defines highlighting CSS class
 * `extension` extension that should be used for files storing cell code
 * `ace.mode` the ACE mode that defines for example the highlighting rules
 * `display.name` the language name that is displayed in RCloud cell language selection drop-down
 * `init.script` (optional) R code snippet holding an R function code that is invoked when kernel starts up. That function should produce valid target language code.
 

RCloud defines language mapping for the following kernel names:

 * python2
 * python3
 * javascript
 * iperl
 * ijulia-0.6
 * lgo
 * java
 * spylon-kernel (scala)
 * apache_toree_scala
 * apache_toree_pyspark
 * apache_toree_sparkr
 
#### Custom mapping

In case if default mapping needs to be overriden and/or additional mappings need to be added, the `rcloud.jupyter.language.mapping.config` can be used to provide a custom mapping.json file path. The mapping configuration from this file will override/extend the default mapping rules.

#### Defining Mapping in kernel.json

It is also possible to define mapping configuration in Jupyter kernel configuration file. RCloud will pick up language options (prefixed with 'rcloud.') from kernel.json 'metadata' map, e.g.:

```
{
  "display_name": "Julia 0.6.2",
  "argv": [
    "/usr/share/julia-d386e40c17/bin/julia",
    "-i",
    "--startup-file=yes",
    "--color=yes",
    "/home/vagrant/.julia/v0.6/IJulia/src/kernel.jl",
    "{connection_file}"
  ],
  "language": "julia",
  "env" : {
    "JULIA_LOAD_PATH": "/home/vagrant/.julia/v0.6/"
  },
  "metadata": {
    "rcloud.init.script" : "function(session) { 'ioff()' }"
  }
}
```


> *Note* language options defined in kernel.json have the highest priority 


# Additional Information

Please refer to [Jupyter](https://jupyter.readthedocs.io/en/latest/content-quickstart.html) for more information about configuration of Jupyter and kernels.


