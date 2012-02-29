There are multiple ways to work on/with Ace. One may use [git submodules] or [teleport]. This document describes just the latter.

## Prerequisites ##

You will need the following installed on your system to get up and running:

- [Git]
- [node]
- [npm]

## Installation ##

First, you need to get the latest published version of Ace and its dependencies. To do so,
run following command in the terminal:

    npm install ace

Once you have ace installed you can start using it with teleport (which was
installed along with other dependencies of ace). This simply means that you
have to run following commands in terminal _(on Windows and Linux skip second
line and open [http://localhost:4747/ace/editor.html] in browser instead)_:
 
    teleport activate
    open http://localhost:4747/ace/editor.html

## Editing Ace ##

If you are planning to just use ace in your own project, probably you can skip
to the next section. If you do plan to edit ace you will have to get the
source from it's repository and link that to the npm, this can be done with a
following commands:

    git clone git://github.com/ajaxorg/ace.git
    npm link ace

From this moment on all the changes in the checked out source will be
automatically be available on the [http://localhost:4747/ace/editor.html].
(Keep in mind that linking and package.json updates will require
restarting a teleport).

In some cases you might need to make changes not only to the ace but also to
its dependencies ([pilot], [cockpit]), in such case you will have to link
those dependencies in exactly same manner.

## Using Ace in project ##

If you decide to start a project that will use Ace, all you need to do is create a
[CommonJS package] with Ace as a dependency and link that package to npm. All of Ace's
contents will be available to your package under _./support/ace_.
_More detailed instructions on creating packages can be found in the [teleport
guide](teleport)._
_If you want to see an example, check out [ace-teleported]._



[teleport]:http://jeditoolkit.com/teleport/#guide
[git submodules]:http://book.git-scm.com/5_submodules.html
[git]:http://git-scm.com/
[node]:http://nodejs.org/
[npm]:http://npmjs.org/
[http://localhost:4747/ace/editor.html]:http://localhost:4747/ace/editor.html
[pilot]:https://github.com/ajaxorg/pilot/
[cockpit]:https://github.com/ajaxorg/cockpit
[CommonJS Package]:http://wiki.commonjs.org/wiki/Packages/1.1
[ace-teleported]:https://github.com/gozala/ace-teleported
