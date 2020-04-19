/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
var svg = d3.select("svg"),
  margin = { top: 80, right: 20, bottom: 30, left: 40 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
var parseDate = d3.timeParse("%Y/%m/%d");
console.log(parseDate);

var color = d3
  .scaleOrdinal()
  .domain(["PVkW", "TBLkW"])
  .range(["rgba(249, 208, 87, 0.7)", "rgba(54, 174, 175, 0.65)"]);

var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  z = color;

var area = d3
  .area()
  .curve(d3.curveMonotoneX)
  .x(function(d) {
    return x(d.date);
    //console.log(d.date)
  })
  .y0(y(0))
  .y1(function(d) {
    return y(d.kW);
  });

var now = new Date(2016, 6, 30 - 22);
console.log(now)

var xScale = d3.scaleTime()
  	.domain([now - (100 - 2) * 22, now - 22])
    .range([0, width]);

svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height); 

var bisectDate = d3.bisector(function(d) {
            return d.date;
        }).left;

d3.csv("data-backup.csv", type, function(error, data) {
  if (error) throw error;

  var sources = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return { date: d.date, kW: d[id] };
      })
    };
  });

  console.log(data, sources);

  x.domain(
    d3.extent(data, function(d) {
      return d.date;
    })
  )
  y.domain([
    0,
    d3.max(sources, function(c) {
      return d3.max(c.values, function(d) {
        return d.kW;
      });
    })
  ]);
  z.domain(
    sources.map(function(c) {
      return c.id;
    })
  );

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(6)));


  var item = 0;

  var locations = data.forEach(function(d, i) {
    d.day = item;
    item = item + 1;
  });

  var min_year = d3.min(data, function(d) {
      return d["day"];
    }),
    max_year = d3.max(data, function(d) {
      return d["day"];
    });

  console.log(min_year, "---", max_year);

  d3.select(".slider")
    .append("input")
    .attr("type", "range")
    .attr("min", min_year)
    .attr("max", max_year)
    .attr("step", "1")
    .attr("id", "year")
    .on("input", function input() {
      update();
      tick()
    });

  var focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 5);

            focus.append("text")
                .attr("x", 9)
                .attr("dy", ".35em")
                .style("font-size",15);
                
            var focus2 = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus2.append("circle")
                .attr("r",5);

            focus2.append("text")
                .attr("x", 149)
                .attr("dy", ".35em")
                .style("font-size",15);
  
  
            
  
  function update() {
       
    var slider_year = document.getElementById("year").value;

    var new_loc = data.filter(function filter_by_year(d) {
      if (d["day"] <= slider_year) {
        return true;        
      }

    });
    
    /*svg.append("rect")    
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")*/
                
    
    d3.selectAll(".text-day").remove();
     d3.select('.slider')
         .append('div')    
    .attr("class", "text-day")
          .html('<br/>' + slider_year + " día(s) de cuarentena");
    
    new_loc["columns"] = ["date", "PVkW", "TBLkW"];

    console.log(new_loc);

    var sources_update = new_loc.columns.slice(1).map(function(id) {
      return {
        id: id,
        values: new_loc.map(function(d) {
          return { date: d.date, kW: d[id] };
        })
      };
    });

    console.log(sources_update);
    
    
    function mousemove(d) {
      
      //var data= sources_update[0].values
      console.log(d)
       /*var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d= x0 - d0.date > d1.date - x0 ? d1 : d0;
        console.log(d0, d1)
          var depl=parseFloat(d['PVkW']);
          var depl2=parseFloat(d['TBLkW']);
          focus.attr("transform", "translate(" + x(d0.date) + "," + (height-depl2)+ ")"); 
          //focus2.attr("transform", "translate(" + x(d1.date-d0.date) + "," + (height-depl2 + depl)+ ")");   

          focus.select("text").text(depl);
          focus2.select("text").text(depl2);*/

    }
    
    d3.select("svg g")
      .selectAll(".area")
      .remove();
    
    d3.select("svg g")
      .selectAll(".axis.axis--y")
      .remove();

    x.domain(
      d3.extent(data, function(d) {
        return d.date;
      })
    );
    y.domain([
      0,
      d3.max(sources_update, function(c) {
        return d3.max(c.values, function(d) {
          return d.kW;
        });
      })
    ]);
    z.domain(
      sources.map(function(c) {
        return c.id;
      })
    );
    
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Power, kW");
    
   var source = g
      .selectAll(".area")
      .data(sources_update)
      .enter()
      .append("g").each(function(d,i){
        d3.select(this).on("mouseover", function() {
                    focus.style("display", null);
                    focus2.style("display", null);
                })
                .on("mouseout", function() {
                    focus.style("display", "none");
                    focus2.style("display", "none");

                })
                .on("mousemove", function(d) {
        console.log(d)
      })
    })
      
   var exit = source.exit();
    
    source
      .append("path")
      .attr("d", function(d) {
        return area(d.values);
      }).attr("clip-path", "url(#clip)")
      
    //.attr("transform", `translate(${xScale(now - (100 - 1) * 1000)})`)
    .attr("class", function(d) {
        console.log(d);
        return `area ${d.id}`;
      })
    .style("fill", function(d) {
        return z(d.id);
      })
   
    var bisectDate = d3.bisector(function(a, b) {
      return a.date - b.date

    }).left;
  console.log(bisectDate)

   
    console.log();
    exit.remove();
    sources_update.shift();

  }
  
  var duration = 72;
  var transition = d3
            .transition() 
            .duration(duration)
            .ease(d3.easeLinear);
  //tick();
  
  function tick() {

      transition = transition
        .each(function() {
          now = new Date(2016, 6, 30);
        xScale.domain([now - (100 - 2) * 50, now - 50]);
        
        console.log(now)
         d3.select(".axis--x")
          .transition(1000)
          .call(d3.axisBottom(x))
        
             d3.selectAll(".area")
              .attr("transform", null)

               d3.selectAll(".area")
                .transition(1000)
                .attr("transform", `translate(${xScale(now - (100 - 1) * 50)})`)
        })
        /*.transition(1000)
        .duration(5000)*/
  }
  
    
  
  update();
});

function type(d, _, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i)
    d[(c = columns[i])] = +d[c];
  return d;
}

