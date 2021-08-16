// -------- choropleth code --------
// initial setup
const svg = d3.select("#choropleth"),
  width = svg.attr("width"),
  height = svg.attr("height"),
  data = d3.map(),
  worldMapJson =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
  worldpopulation =
    "https://gist.githubusercontent.com/asb56/8f6485ed3c4a072fac5d71ab9c9a6602/raw/f26dcf97ca0cf7872fcab1280491d8c2e9e6c736/incitesLocData.csv";

let centered, world;

// set geographic projection and scaling
const projection = d3
  .geoInterruptedHomolosine()
  .scale((120 * width) / 800)
  .translate([width / 2, height / 2]);
// define path generator
const path = d3.geoPath().projection(projection);

// Define colour scale
const colourScale = d3
  .scalePow()
  .domain([0, 1, 400])
  .range([d3.rgb("#c9d0d7"), d3.rgb("#99a3b4"), d3.rgb("#071D49")])
  .exponent(0.1);

// add tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
const ttheader = tooltip.append("p").attr("class", "ttheader");
const ttl1 = tooltip.append("p");
const ttl2 = tooltip.append("p");

// Load external data and boot
d3.queue()
  .defer(d3.json, worldMapJson)
  .defer(d3.csv, worldpopulation, function (d) {
    data.set(d.id, [d.docs10, d.rank]);
  })
  .await(ready);

// Add clickable background
svg
  .append("rect")
  .attr("id", "background")
  .attr("fill", "#f3f4f6")
  .attr("stroke", "none")
  .attr("width", width)
  .attr("height", height)
  .on("click", reset);

// ----------------------------
//Start of Choropleth drawing
// ----------------------------

function ready(error, topo) {
  // topo is the data received from the d3.queue function
  // the data from  the csv is saved in 'data' variable

  // extract countries from topojson
  const worldMap = topojson.feature(topo, topo.objects.countries).features;

  // define mouseover highlight behaviour
  let mouseOver = function (d) {
    // set all countries to base state (catches transition from country to country)
    d3.selectAll(".Country")
      .attr("stroke-width", "0.5px")
      .attr("stroke", d3.rgb("#ecedef"));

    // set highlight state for country under cursor
    d3.select(this).attr("stroke-width", "4px").style("stroke", "white");

    // set tooltip content and make it appear
    tooltip
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 28 + "px")
      .style("opacity", 1);
    ttheader.text(d.properties.name);
    ttl1.text("Top 10% docs: " + d.docs);
    ttl2.text("Rank: " + d.rank);
  };

  let mouseLeave = function () {
    // revert countries to base state
    d3.selectAll(".Country")
      .attr("stroke-width", "0.5px")
      .attr("stroke", d3.rgb("#ecedef"));

    // disappear tooltip
    tooltip.style("opacity", 0);
  };

  // Draw the map - add a world group for scale/translate of entire map
  world = svg.append("g").attr("id", "world").attr("class", "world");

  // add defs for wold sphere and clip-paths for countries
  const defs = world.append("defs");

  defs
    .append("path")
    .datum({ type: "Sphere" })
    .attr("id", "globe")
    .attr("d", path);

  defs
    .selectAll("clipPath")
    .data(worldMap)
    .enter()
    .append("clipPath")
    .attr("id", function (d) {
      return "clip" + d.id;
    })
    .append("path")
    .attr("d", path);

  defs
    .append("clipPath")
    .attr("id", "worldClip")
    .append("use")
    .attr("xlink:href", "#globe");

  // use globe to draw sea
  world
    .append("use")
    .attr("fill", d3.rgb("#ecedef"))
    .attr("id", "sea")
    .attr("stroke", "none")
    .attr("xlink:href", "#globe")
    .on("click", reset);

  // add a graticule
  const graticule = d3.geoGraticule10();
  world
    .append("path")
    .datum(graticule)
    .attr("id", "grat")
    .attr("fill", "none")
    .attr("stroke", "#c9d0d7")
    .attr("stroke-width", "0.5px")
    .attr("d", path)
    .attr("clip-path", "url(#worldClip)")
    .on("click", reset)
    .style("vector-effect", "non-scaling-stroke");

  // add a countries group to contain the land, clipped to the globe
  countries = world
    .append("g")
    .attr("id", "countries")
    .attr("clip-path", "url(#worldClip)");

  // draw the countries
  countries
    .selectAll("path")
    .data(worldMap)
    .enter()
    .append("path")
    .attr("d", path)
    //retrieve the name of the country from data
    .attr("data-name", function (d) {
      return d.properties.name;
    })
    // set the color of each country
    .attr("fill", function (d) {
      var dataPoint = data.get(d.id) || [0, "NA"];
      d.docs = dataPoint[0];
      d.rank = dataPoint[1];
      return colourScale(d.docs);
    })

    // add a class, styling and mouseover/mouseleave and click functions
    .attr("stroke", d3.rgb("#ecedef"))
    .attr("stroke-width", "0.25px")
    .style("vector-effect", "non-scaling-stroke")
    .attr("class", "Country")
    .attr("id", function (d) {
      return d.id;
    })
    //clip each country to itself so that highlight stroke only shows inside country
    .attr("clip-path", function (d) {
      return "url(#clip" + d.id + ")";
    })
    .style("opacity", 1)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("click", click);

  //add a map outline
  world
    .append("use")
    .attr("fill", "none")
    .attr("id", "outline")
    .attr("stroke", "#c9d0d7")
    .attr("stroke-width", "1.5px")
    .attr("xlink:href", "#globe")
    .on("click", reset)
    .style("vector-effect", "non-scaling-stroke");

  /*// Legend
	const x = d3.scaleLinear()
		.domain([2.6, 75.1])
		.rangeRound([600, 860]);

	const legend = svg.append("g")
		.attr("id", "legend");

	const legend_entry = legend.selectAll("g.legend")
		.data(colourScale.range().map(function(d) {
			d = colourScale.invertExtent(d);
			if (d[0] == null) d[0] = x.domain()[0];
			if (d[1] == null) d[1] = x.domain()[1];
			return d;
		}))
		.enter().append("g")
		.attr("class", "legend_entry");

	const ls_w = 20,
		ls_h = 20;

	legend_entry.append("rect")
		.attr("x", 20)
		.attr("y", function(d, i) {
			return height - (i * ls_h) - 2 * ls_h;
		})
		.attr("width", ls_w)
		.attr("height", ls_h)
		.style("fill", function(d) {
			return colourScale(d[0]);
		})
		.style("opacity", 0.8);

	legend_entry.append("text")
		.attr("x", 50)
		.attr("y", function(d, i) {
			return height - (i * ls_h) - ls_h - 6;
		})
		.text(function(d, i) {
			if (i === 0) return "< " + d[1] / 1000000 + " m";
			if (d[1] < d[0]) return d[0] / 1000000 + " m +";
			return d[0] / 1000000 + " m - " + d[1] / 1000000 + " m";
		});

	legend.append("text").attr("x", 15).attr("y", 280).text("Population (Million)");*/
}

// Zoom functionality
var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

var active = d3.select(null);

// country click function to get bounding box and zoom, subject to min/max zoom levels
function click(d) {
  // if already zoomed to country, zoom out again
  if (active.node() === this) return reset();

  // otherwise get bounding box and calculate scale/translate parameters
  active.classed("active", false);
  active = d3.select(this).classed("active", true);
  let bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale1 = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
    translate = [scale1 * (width / 2 - x), scale1 * (height / 2 - y)];

  // make scale/translate transition
  world
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale1)
    );
}

// un-zoom function
function reset() {
  active.classed("active", false);
  active = d3.select(null);

  world.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

function zoomed() {
  world.attr("transform", d3.event.transform);
}

