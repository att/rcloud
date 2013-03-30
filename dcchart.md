# how to use dcchart

dcchart is an embedded domain specific language for creating interactive
[dc.js](http://nickqizhu.github.com/dc.js/) charts from R.

Currently it is mostly a transcription of the javascript into R.

Here's an example of a (meaningless) set of three charts:


    data <- list(list(2008, "a", 8), list(2008, "c", 5), list(2009, "b", 12), list(2009, 
        "a", 1), list(2010, "c", 17));
    wdcchart(data,
    charts(
    dimension(one,func(d)(d[0])),
    dimension(two,func(d)(d[1])),
    dimension(three,func(d)(d[2])),
    domain(twoD,uniques(two)),
    domain(threeD,uniques(three)),
    pie(width(180)
          $height(180)
          $radius(80)
          $dimension(one)
          $group(one$group()$reduceCount())),
    bar(width(500)
          $height(100)
          $margins(hash(top:20,right:50,bottom:20,left:40))
          $dimension(two)
          $group(two$group()$reduceCount())
          $centerBar(false)
          $gap(0)
          $x(d3$scale$ordinal()$domain(twoD))
          $xUnits(dc$units$ordinal)),
    bar(width(500)
          $height(100)
          $margins(hash(top:20,right:50,bottom:20,left:40))
          $dimension(two)
          $group(two$group()$reduceSum(func(d)(d[2])))
          $centerBar(false)
          $gap(0)
          $x(d3$scale$ordinal()$domain(twoD))
          $xUnits(dc$units$ordinal))
    ))
