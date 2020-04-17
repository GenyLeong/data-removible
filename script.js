/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
var svg = d3.select("svg"),
  margin = { top: 80, right: 20, bottom: 30, left: 50 },
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
  })
  .y0(y(0))
  .y1(function(d) {
    return y(d.kW);
  });

d3.csv("data.csv", type, function(error, data) {
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
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(5)));

  /*var source = g
    .selectAll(".area")
    .data(sources)
    .enter()
    .append("g")
    .attr("class", function(d) {
      return `area ${d.id}`;
    });

  source
    .append("path")
    .attr("d", function(d) {
     console.log(area(d.values));
      return area(d.values);
    })
    .style("fill", function(d) {
      return z(d.id);
    });
   */
  var item = 0;

  var locations = data.forEach(function(d, i) {
    d.date = item;
    item = item + 1;

    //console.log(data)
  });

  var min_year = d3.min(data, function(d) {
      return d["date"];
    }),
    max_year = d3.max(data, function(d) {
      return d["date"];
    });

  console.log(min_year, "---", max_year);

  d3.select("body")
    .append("input")
    .attr("type", "range")
    .attr("min", min_year)
    .attr("max", max_year)
    .attr("step", "1")
    .attr("id", "year")
    .on("input", function input() {
      update();
    });

  function update() {
    var slider_year = document.getElementById("year").value;

    var new_loc = data.filter(function filter_by_year(d) {
      if (d["date"] <= slider_year) {
        return true;
      }
    });

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

    //new_loc.concat(columns)

    //new_loc['columns'].push(columns);
    /*new_loc = new_loc.map(function(elem){    
      return {"columns":elem};
    })
    
    var rowLen = new_loc.length
    
    new_loc = new_loc.map(function(elem, i){
      if (rowLen === i + 1) {
        return {"columns":elem};
      } else {
      }
    })
    
    /*const rowLen = new_loc.length;
    
    new_loc.map((elem, i) => {
      console.log(elem, i)
      if (rowLen === i + 1) {
        return {"columns":elem};
      } else {
        // not last one
      }
    })*/
    var duration = 1000;
    var transition = d3
            .transition() 
            .duration(duration)
            .ease(d3.easeLinear);
    tick();
    function tick() {
    
    transition = transition
      .each(function() {
      //	if (pause) return
        // update the domains
        /*now = new Date();
        xScale.domain([now - (n - 2) * duration, now - duration]);
        // push the accumulated count onto the back, and reset the count
        data.push(random());*/

      
      	// Redraw the area.
        /*d3.selectAll('.area')
          .attr("d", area)
          
          
     		d3.selectAll('.area')
          .transition(transition)
          .attr("transform", `translate(100)`);*/

        // pop the old data point off the front
        sources_update.shift();
      })
      .transition()
      .on("start", tick);
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
      .append("g")
      .attr("class", function(d) {
        console.log(d);
        return `area ${d.id}`;
      });

    var exit = source.exit();
    sources_update.shift();

    source
      .append("path")
      .attr("d", function(d) {
        //console.log(area(d.values));
        return area(d.values);
      })
    .attr("transform", null)
    .style("fill", function(d) {
        return z(d.id);
      })
    
    source
          .transition(transition)
          .attr("transform", `translate(100)`);
          
    /*source
          .transition(1000)
          .attr("transform",function(d) { return `translate(${d.values.length})`})*/
    
    //sources_update.shift()
    console.log();
    exit.remove();
  }

  update();
});

function type(d, _, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i)
    d[(c = columns[i])] = +d[c];
  return d;
}
