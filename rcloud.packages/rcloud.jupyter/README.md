# RCloud Jupyter Package

`rcloud.jupyter` package introduces support for Python (so far) via Jupyter Notebooks API

> rcloud.jupyter and rcloud.python packages are incompatible and should not be loaded into RCloud at the same time.

# Configuration

## Jupyter Installation

RCloud integrates with a single Jupyter backend, depending on which Python version it integrates with, run one of the following commands:

### Python 2

```{bash}
sudo python -m pip install jupyter
```

### Python 3

```{bash}
sudo python3 -m pip3 install jupyter
```

### RCloud Configuration

RCloud Jupyter package uses these settings from `rcloud.conf`:

 * rcloud.jupyter.python.path - path to Python installation that should be used (e.g. `/usr/bin/python3`)
 * rcloud.jupyter.python.extra.libs - additional Python lib directories (e.g. where Jupyter Python modules got installed)

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


### Specifying Python Kernel for Notebook

RCloud by default uses `python` kernel to invoke Python cells. In setups where there are multiple python kernels available (e.g. Python 2 and Python 3) Jupyter will use a kernel with the same version of Python as Jupyter uses.

To specify the kernel version that should be used to invoke Python cells in a notebook, add an R cell to RCloud notebook before all Python cells that sets specific kernel name that should be used:
```{R}
rcloud.jupyter:::.set_python_kernel('python2')
```
> Note.
> 'kernel name' is the key of the kernel in the list of kernels returned by the 'rcloud.jupyter.list.kernel.specs' function.


> Note. 
> If you want to change python kernel after running some Python cells, you will need to refresh RCloud Session, for the above command to take an effect.


# Additional Information

Please refer to [Jupyter](https://jupyter.readthedocs.io/en/latest/content-quickstart.html) for more information about configuration of Jupyter and kernels.


