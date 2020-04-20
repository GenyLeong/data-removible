/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

var x = window.matchMedia("(max-width: 600px)")
if (x.matches) { // If media query matches
  document.body.style.backgroundColor = "white";
  var svg = d3.select("svg"),
  margin = { top: 80, right: 10, bottom: 30, left: 35 };
  
  var mySVG = document.getElementById("chart");
    mySVG.setAttribute("width",  360);
    mySVG.setAttribute("height", 360);
  
 var width = +320 - margin.right,
  height = +320 - margin.top - margin.bottom,
  g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
} else {
 document.body.style.backgroundColor = "pink";
 var svg = d3.select("svg"),
  margin = { top: 80, right: 20, bottom: 30, left: 40 };
  
  var mySVG = document.getElementById("chart");
    mySVG.setAttribute("width",  500);
    mySVG.setAttribute("height", 500);
  
  var width = +500 - margin.left - margin.right,
      height = +500 - margin.top - margin.bottom,
      g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

  
var parseDate = d3.timeParse("%Y/%m/%d");
console.log(parseDate);

var es_ES = {
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%d/%m/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
  "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

var ES = d3.timeFormatDefaultLocale(es_ES);

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

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(5)));

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
      //tick()
    });
 
  function update() {
    var slider_year = document.getElementById("year").value; 

    var now = new Date(data[slider_year].date);
    console.log(data, now)

    var new_loc = data.filter(function filter_by_year(d) {
      if (d["day"] <= slider_year) {
        return true;        
      }
    });
     
    d3.selectAll(".text-day").remove();
     d3.select('.slider')
         .append('div')    
    .attr("class", "text-day")
          .html('<br/>' + slider_year + " día(s) de cuarentena");
    
    new_loc["columns"] = ["day","date", "PVkW", "TBLkW"];

    var sources_update = new_loc.columns.slice(2).map(function(id) {
      return {
        id: id,
        values: new_loc.map(function(d) {
          return { date: d.date, kW: d[id] };
        })
      };
    });
    
    d3.select("svg g")
      .selectAll(".area")
      .remove();
    
    d3.select("svg g")
      .selectAll(".axis.axis--y")
      .remove();

    x.domain(
      d3.extent(new_loc, function(d) {
        var seconds = d.date
        now = new Date(seconds)
        return now;
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
      
   var exit = source.exit();
    
    source
      .append("path")
      .attr("d", function(d) {
        return area(d.values);
      })
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) {
        console.log(d);
        return `area ${d.id}`;
      })
      .style("fill", function(d) {
          return z(d.id);
      }).on("mousemove", function(d) {
        return handleMouseMove(d);
    })
      .on('mouseout', handleMouseOut);

  var transition = d3
            .transition() 
            .duration(100)
            .ease(d3.easeLinear);
 
  function tick() {
          
      transition = transition
        .each(function() {

        d3.select(".axis--x")
        .attr("transform", "translate(0," + height + ")")
        .transition(1000)
        .call(d3.axisBottom(x).ticks(d3.timeDay.every(5)))
        })
  }
    tick()
    exit.remove();
    new_loc.shift();

    const focus = d3.select("svg g").append('g')
                    .attr('class', 'focus')
                    .style('display', 'none');

  focus.append('circle')
  .style("fill", "#FFF")
    .attr('r', 4);

  focus.append('line')
    .classed('y', true);

   // This allows to find the closest X index of the mouse:
  var bisectDate = d3.bisector(function(d) {
      return d.date;
  }).left;

  function handleMouseMove(data) {
    
    //console.log(data)
    data = data.values

    const currentXPosition = d3.event.pageX;
    //const currentYPosition = d3.event.pageY;
    // Get the x value of the current X position
    const xValue = x.invert(currentXPosition-60);
    
    // Get the index of the xValue relative to the dataSet
    const dataIndex = bisectDate(data, xValue, 0);
    console.log(new_loc)
    const leftData = data[dataIndex - 2];
    const rightData = data[dataIndex-1];

    var left_time = new Date(leftData.date)
    var right_time = new Date(rightData.date)

    console.log(leftData, rightData, left_time, right_time)
    var tipo = ""
    for (let i = 0; i < new_loc.length; i++) {
      const element = new_loc[i];
      if(element.PVkW==rightData.kW){
          tipo = "infectados"
      }
      else if (element.TBLkW==rightData.kW){
        tipo = "fallecidos"
      }
    }

    d3.select('.year1').text(`${right_time} : ${rightData.kW} ${tipo}`)

    focus.style('display', null)
    focus.attr('transform', `translate(${currentXPosition- 60}, ${y(rightData.kW)})`);
    focus.select('line.y')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', height -`${y(rightData.kW)}`);
  }

  function handleMouseOut() {
    focus.style('display', 'none')
    d3.select('.year1').text('');
    d3.select('.year2').text('')
  }
  
  }
  
  update();  
});

function type(d, _, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i)
    d[(c = columns[i])] = +d[c];
  return d;
}
