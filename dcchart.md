# how to use dcchart

dcchart is an embedded domain specific language for creating interactive [crossfilter][http://square.github.io/crossfilter/] / 
[dc.js](http://nickqizhu.github.com/dc.js/) charts from R.

Currently it is mostly a transliteration of the javascript into R; a visitor simply traverses the tree of R expressions and produces javascript code to set up dc.js.

Consult the crossfilter and dc.js documentation to see how dimensions, groups, and the specific property methods work.

Here's a scatterchart and a couple of histograms on the iris data:

    wdcchart(iris,charts(
    dimension(measures,func(d)(d)),
    dimension(petalWidths,func(d)(field("Petal.Width",d))),
    dimension(petalLengths,func(d)(field("Petal.Length",d))),
    bubble("sepal width vs length",
       width(300)$height(300)
       $margins(list(top = 10, right = 50, bottom = 30, left = 40))
       $dimension(measures)
       $group(measures$group())
       $colors(c("red","blue","green"))
       $colorAccessor(func(d)(gfield("Species",d)-1))
       $keyAccessor(func(d)(gfield("Sepal.Length",d)))
       $valueAccessor(func(d)(gfield("Sepal.Width",d)))
       $radiusValueAccessor(func(d)(d.value*3))
       $x(d3$scale$linear()$domain(c(0,10)))
       $y(d3$scale$linear()$domain(c(0,10)))
       $elasticX(true)
       $elasticY(true)
       $transitionDuration(300)
       $renderLabel(false)),
    bar("petal widths",
       width(300)$height(300)
       $margins(list(top=10,right=50,bottom=30,left=40))
       $dimension(petalWidths)
       $group(petalWidths$group(func(x)(Math$floor(x*5)/5.0))$reduceCount())
       $x(d3$scale$linear()$domain(c(0,3)))
       $xUnits(dc$units$float$precision(0.2))
       $elasticX(true)
       $transitionDuration(300)
       $gap(2)),
    bar("petal lengths",
       width(300)$height(300)
       $margins(list(top=10,right=50,bottom=30,left=40))
       $dimension(petalLengths)
       $group(petalLengths$group(func(x)(Math$floor(x*2)/2.0))$reduceCount())
       $x(d3$scale$linear()$domain(c(1,7)))
       $xUnits(dc$units$float$precision(0.5))
       $elasticX(true)
       $transitionDuration(300)
       $gap(2))))
