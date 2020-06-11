# RCloud Jupyter Package

`rcloud.jupyter` package introduces support for Jupyter kernels via Jupyter nbconvert API

> rcloud.jupyter and rcloud.python packages are incompatible and should not be loaded into RCloud at the same time.

# Configuration

## Jupyter Installation

RCloud integrates with a single Jupyter backend, depending on which Python version RCloud integrates with.

Usually you should install Jupyter using your operating system's package manager; see [RCloud's INSTALL.md](../../doc/INSTALL.md) for typical commands for Ubuntu and RedHat.

For a quick-and-dirty test installation you can do

#### Python 2

```{bash}
sudo python -m pip install jupyter
```

#### Python 3

```{bash}
sudo python3 -m pip3 install jupyter
```

However, `sudo pip` is generally a bad idea.


### R Dependencies

rcloud.jupyter package uses reticulate and jsonlite packages to invoke Python code, these needs to be installed into R:

```
install.packages("jsonlite")
install.packages("reticulate")
```

### RCloud Configuration

RCloud Jupyter package uses these settings from `rcloud.conf`:

 * `rcloud.jupyter.python.path` - path to Python installation that should be used (e.g. `/usr/bin/python3`)
 * `rcloud.jupyter.python.extra.libs` - additional Python lib directories (e.g. where Jupyter Python modules got installed) (optional)
 * `rcloud.jupyter.connection_dir.path` - path to directory where kernel connection files should be created, default `/tmp` (optional)
 * `rcloud.jupyter.kernel.startup.timeout` - timeout (in seconds) for Jupyter kernels to start up, default 600 seconds (optional)
 * `rcloud.jupyter.cell.exec.timeout` - timeout (in seconds) for Jupyter cells executions, default 1200 seconds (optional)
 * `rcloud.jupyter.language.mapping.config` - specifies custom location of mapping.json file (optional)
 * `rcloud.jupyter.delayed.init` - if set to `disable` then Jupyter will be always initialized immediately on load. If not set, the default is to only initialize Jupyter if there is no cached list of kernels and/or when a language is actually used. Note that the cache (`.rcloud.jupyter.kernelspec.cache.rds` in user's RCloud home) is valid for 24h.

To enable `rcloud.jupyter` add it to `rcloud.languages` setting in `rcloud.conf` AND remove `rcloud.python` if it is listed there.

After (re-)starting RCloud, Python integration via Jupyter should work, if it isn't, please read on.


## Python Kernels

If no kernels are configured, Jupyter will create a runtime Python kernel using the same version of Python that Jupyter uses. However if location of Python modules is not standard and/or some of the dependencies have been installed under user-specific location (e.g. `/home/[USER_NAME]/.local/lib/python3.5/site-packages`), then Jupyther will fail to start up such kernel and kernel will need to be explicitly configured (see sections below).



### Python 2 kernel

To register Python 2 kernel run the following command:

```{bash}
sudo python -m ipykernel install
```

### Python 3 kernel

To register Python 3 kernel run the following command:

```{bash}
sudo python3 -m ipykernel install
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

### Language Support

RCloud is capable of invoking Jupyter kernels available in the system. General rule is that if a kernel is correctly configured so it can be executed from Jupyter notebook, RCloud will also be able to invoke such kernel.

### Jupyter Kernel Installation

For kernel-specific instructions please refer to kernel installation guide that you wish to install.

To avoid issues with discovering kernels (this may happen if Jupyter and RCloud run as different users) install Jupyter kernels globally, i.e. NOT as local kernel to a user, which is stored under `~/.local/share/jupyter/kernels`.

Depending on your environment settings, kernels dependencies may be installed in user's local libs directories. In such case Jupyter kernel installed globally may fail to start up, as its dependencies will not be visible to user that actually starts the kernel. You may wish to install such dependencies globally in the system.


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
 
 If the language mapping does not specify any ACE mode for a kernel, then the 'Text' mode will be used.
 
 
#### Configuration

rcloud.jupyter is configured using a JSON-formatted configuration file. Default configuration file is located under `inst/jupyter/mapping.json`. Administrators are able to customize the default config by specifying custom mapping file and/or by using `metadata` key-value map of Jupyter kernel.json (see below).

##### Language Definition

Languages configuration is located in `inst/jupyter/mapping.json` under `languages` key, it contains a list of languages, and rcloud language properties (like ACE editor syntax highlighting class, file extension etc.). For example Python language support is defined as follows:

```
{
  "languages" : {
  [...]
  "python" : {
      "extension" : "py",
      "hljs.class" : "py",
      "ace.mode" : "ace/mode/python"
    }
  [...]
  }
  [...]
}
```

The key in the above map is a Jupyter language name, the value is a map with the following RCloud language options:

 * `hljs.class` - defines highlighting CSS class
 * `extension` - extension that should be used for files storing cell code
 * `ace.mode` - the ACE mode that defines for example the highlighting rules
 

RCloud ships with the following language definitions:

| *Language* | *Cell File Extension* |
| ---------- | --------------------- |
| python     | (*.py) |
| javascript | (*.jsjup) |
| perl | (*.pl) |
| julia | (*.jl) |
| go | (*.go) |
| java | (*.java) |
| scala | (*.sc) |
| R | (*.rjup) |


#### Kernel Mapping

Kernel-specific mapping configuration is specfied in `kernelMapping` element in the `mapping.json` configuration file. This section can be used to override any settings specified in `languages` section. For example, by default rcloud.jupyter associates different file extensions with python2 and python3 kernels to support execution of both, the configuration looks like this:

```
{
 [...]
  "kernelMapping": {
    "python2" : {
      "extension" : "py",
      "init.script" : "function(rcloud.session) { retina <- ''; if (rcloud.session$device.pixel.ratio > 1) { retina <- \"config InlineBackend.figure_format = 'retina'\" }; inline_plots <- '%matplotlib inline';  paste0(retina, '\n', inline_plots) }"
    },
    "python3" : {
      "extension" : "py3",
      "init.script" : "function(rcloud.session) { retina <- ''; if (rcloud.session$device.pixel.ratio > 1) { retina <- \"config InlineBackend.figure_format = 'retina'\" }; inline_plots <- '%matplotlib inline';  paste0(retina, '\n', inline_plots) }"
    }
  }
}
```

The key in the above map is a Jupyter kernel name, the value is a map with the following RCloud language options:

 * `extension` - same as in language definition
 * `init.script` - (optional) R code snippet holding an R function code that is invoked when kernel starts up. That function should produce valid target language code.

> N.B. Any option valid for language can also be used in kernel mapping.

 
#### Custom mapping

In case if default mapping needs to be overriden and/or additional mappings need to be added, the `rcloud.jupyter.language.mapping.config` can be used to provide a custom mapping.json file path. The mapping configuration from this file will override/extend the default mapping rules.

#### Defining Mapping in kernel.json

It is also possible to define mapping configuration in Jupyter kernel configuration file. RCloud will pick up language options (prefixed with 'rcloud.') from kernel.json 'metadata' map, 

Example 1

Julia kernel with custom initialization script:

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

Example 2

Apache Torre Python, Scala and R kernels which cells will be stored in files with `<language>spark` extension: 

RSpark:
```
{
  "metadata": {
   "rcloud.extension" : "rspark"
  },
  "argv": [
    "/usr/local/share/jupyter/kernels/apache_toree_sparkr/bin/run.sh",
    "--profile",
    "{connection_file}"
  ],
  "language": "r",
  "display_name": "Apache Toree - SparkR",
  "env": {
    "PYTHONPATH": "/opt/spark/python:/opt/spark/python/lib/py4j-0.10.4-src.zip",
    "SPARK_HOME": "/opt/spark",
    "PYTHON_EXEC": "python3.5",
    "DEFAULT_INTERPRETER": "SparkR",
    "__TOREE_OPTS__": "",
    "__TOREE_SPARK_OPTS__": "--master spark://vagrant:7077"
  },
  "interrupt_mode": "signal"
}
```

PySpark:
```
{
  "metadata": {
    "rcloud.extension" : "pyspark"
  },
  "argv": [
    "/usr/local/share/jupyter/kernels/apache_toree_pyspark/bin/run.sh",
    "--profile",
    "{connection_file}"
  ],
  "language": "python",
  "display_name": "Apache Toree - PySpark",
  "env": {
    "JAVA_HOME" : "/usr/lib/jvm/java-8-openjdk-amd64",
    "PYTHONPATH": "/opt/spark/python:/opt/spark/python/lib/py4j-0.10.4-src.zip",
    "SPARK_HOME": "/opt/spark",
    "PYTHON_EXEC": "python3.5",
    "DEFAULT_INTERPRETER": "PySpark",
    "__TOREE_OPTS__": "",
    "__TOREE_SPARK_OPTS__": "--master spark://vagrant:7077"
  },
  "interrupt_mode": "signal"
}
```

ScSpark:

```
{
  "metadata": {
  "rcloud.extension" : "scspark"
  },
  "argv": [
    "/usr/local/share/jupyter/kernels/apache_toree_scala/bin/run.sh",
    "--profile",
    "{connection_file}"
  ],
  "language": "scala",
  "display_name": "Apache Toree - Scala",
  "env": {
    "JAVA_HOME" : "/usr/lib/jvm/java-8-openjdk-amd64",
    "PYTHONPATH": "/opt/spark/python:/opt/spark/python/lib/py4j-0.10.4-src.zip",
    "SPARK_HOME": "/opt/spark",
    "PYTHON_EXEC": "python3.5",
    "DEFAULT_INTERPRETER": "Scala",
    "__TOREE_OPTS__": "",
    "__TOREE_SPARK_OPTS__": "--master spark://vagrant:7077"
  },
  "interrupt_mode": "signal"
}
```

As a result of the above, RCloud will use kernels' languages to select ACE editor mode but use extensions defined in kernel.json to store files and execute them with appropriate Jupyter kernel.

> *Note* language options defined in kernel.json have the highest priority 

### Conflicts Resolution

In cases when there are multiple kernels mapped to the same file extension, RCloud will select the first language found for a given extension. Other kernels will be silently ignored. During discovery the kernels are sorted by their display name to enforce consitent kernel discovery results.

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


# Kernel Installation

> Instructions in this section are just for reference, they are valid only at the time of this writing and use specific versions of kernel binaries. Refer to each kernel project page for detailed installation and configuration instructions.

## Scala (Jupyter Scala 2.11)

[Jpyter Scala project home page](https://github.com/jupyter-scala/jupyter-scala)

Run the following commands:

```
cd /opt/src
wget https://raw.githubusercontent.com/alexarchambault/jupyter-scala/master/jupyter-scala
chmod +x jupyter-scala
./jupyter-scala
```

Move installed user kernel to system kernels directory:
```
sudo mv [USER_HOME]/.local/share/jupyter/kernels/scala /usr/local/share/jupyter/kernels/
```

Update path to kernel JAR in kernel.json:

> if Java 8 is not the default Java version in your system, you will need to update 'java' command path in kernel.json as well

```
sudo vi /usr/local/share/jupyter/kernels/scala/kernel.json
```
so it looks like this:

```
{
  "language" : "scala",
  "display_name" : "Scala",
  "argv" : [
    "/usr/lib/jvm/java-8-openjdk-amd64/bin/java",
    "-noverify",
    "-jar",
    "/usr/local/share/jupyter/kernels/scala/launcher.jar",
    "launch",
    "-r",
    "sonatype:releases",
    "-r",
    "sonatype:snapshots",
    "-i",
    "ammonite",
    "-I",
    "ammonite:org.jupyter-scala:ammonite-runtime_2.11.11:0.8.3-1",
    "-I",
    "ammonite:org.jupyter-scala:scala-api_2.11.11:0.4.2",
    "org.jupyter-scala:scala-cli_2.11.11:0.4.2",
    "--",
    "--id",
    "scala",
    "--name",
    "Scala",
    "--quiet",
    "--connection-file",
    "{connection_file}"
  ]
}
```



Fix permissions on default log file used by Jupyter Scala kernel
```
touch /tmp/jupyter-scala.log
sudo chmod go+rw /tmp/jupyter-scala.log
```


## Julia (IJulia-0.6.2)

[IJulia Project home](https://github.com/JuliaLang/IJulia.jl)

Run the following commands:

```
cd /opt/src
wget https://julialang-s3.julialang.org/bin/linux/x64/0.6/julia-0.6.2-linux-x86_64.tar.gz
mkdir /opt/julia-0.6.2
tar -xvzf julia-0.6.2-linux-x86_64.tar.gz -C /opt/julia-0.6.2/
ln -s /opt/julia-0.6.2/julia-d386e40c17 /opt/julia

yum install python-matplotlib
```

```
/opt/julia/bin/julia
Pkg.add("IJulia")
using PyPlot
exit()
```


## Perl (Devel::IPerl) Kernel

[Devel::IPerl project home page](https://github.com/EntropyOrg/p5-Devel-IPerl)

Run the following commands:

```
yum install perl-CPAN
yum install perl-YAML
yum install perl-IO-AIO
yum install perl-IO-Socket-IP
yum install perl-App-cpanminus

yum install zeromq-devel
export ARCHFLAGS='-arch x86_64';
cpanm --build-args 'OTHERLDFLAGS=' ZMQ::LibZMQ3;

cpanm --notest --verbose Net::Async::ZMQ
cpanm Markdent@0.26 Markdown::Pod@0.006
cpanm Devel::IPerl

```

Create a Perl kernel.json file:

```
mkdir /usr/share/jupyter/kernels/iperl
vi /usr/share/jupyter/kernels/iperl/kernel.json
```
With the following contents:

```
{"display_name":"IPerl 0.009","argv":["/usr/bin/perl","-MDevel::IPerl","-e Devel::IPerl::main","kernel","{connection_file}"],"language":"perl","iperl_version":"0.009"}
```


## Toree Apache Spark

[Toree Apache Spark project home page](https://toree.incubator.apache.org/)

Note, the commands below will result in Scala, Python and R Spark kernels that spawn Spark instances on demand. In production such setup is discouraged. Instead Spark kernels should be configured to interact with Spark cluster. Refer to Apache Spark and Apache Toree documentation for instructions on how to run Spark in a cluster mode and configuring the kernels to interact with Spark cluster.

* Install Apache Spark 2.1.1 with Hadoop 2.7 
* Install Kernels:
```
pip3 install https://dist.apache.org/repos/dist/dev/incubator/toree/0.2.0-incubating-rc5/toree-pip/toree-0.2.0.tar.gz
jupyter toree install --spark_opts='--master=local[2]' --interpreters=Scala,PySpark,SparkR --spark_home=/opt/mango/spark/
```

Optional:

> If this step is not performed, Spark kernels will be associated with \*.py (Python), \*.sc (Scala) and \*.rjup (R) cells, what may not be desired setup.

* Associate custom extension with ScSpark kernel
```
{ 
[...]
  "metadata": {
  "rcloud.extension" : "scspark"
  }
[...]
}
```

* Associate custom extension with RSpark kernel
```
{ 
[...]
  "metadata": {
  "rcloud.extension" : "rspark"
  }
[...]
}
```

* Associate custom extension with PySpark kernel
```
{ 
[...]
  "metadata": {
  "rcloud.extension" : "pyspark"
  }
[...]
}
```


## NodeJS (IJavascript) Kernel

[IJavaScript project home page](https://github.com/n-riesco/ijavascript)

Run the following commands:

```
yum install npm
npm install -g ijavascript
ijsinstall --install=global
```

# Additional Information

Please refer to [Jupyter](https://jupyter.readthedocs.io/en/latest/content-quickstart.html) for more information about configuration of Jupyter and kernels.


