// Set up the svg params
var svgWidth = window.innerWidth - 100;
var svgHeight = window.innerHeight - 500;

var margin = {
top: 50,
right: 50,
bottom: 100,
left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
var svg = d3.select("#scatter").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}
  
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}
  
// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty: ";
    }
    else {
      label = "Age Median: ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label}: ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// Import data from the data.csv file
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    
    if (err) throw err;
    
    // Preview the data
    console.log(censusData);

    // Format the data
    censusData.forEach(data => {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
    });

    // Create Scales

    // xScale = poverty
    var xScale = xScale(censusData, chosenXAxis);
    
    // yScale = healthcare
    var yScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d.healthcare)-0.5, d3.max(censusData, d => d.healthcare)+3])
        .range([height, 0]);

    // Create Axes
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // Append x & y axis
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.attr("class", "nodes")
        .selectAll("circle")
        .data(censusData)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .classed("stateCircle", true)
        .attr("cx", d => xScale(d[chosenXAxis]))
        .attr("cy", d => yScale(d.healthcare));

    circlesGroup.append("text")
        .classed("stateText", true)
        .attr("x", d => xScale(d[chosenXAxis]))
        .attr("y", d => yScale(d.healthcare))
        .attr("alignment-baseline", "central")
        .style("font-size", "10px")
        .text(d => d.abbr);

    // Create group for the x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("In Poverty (%)");
    
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("Age Median");
    
    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Lacks Healthcare (%)");
    

})

function makeResponsive() {

    var svgArea = d3.select("#scatter").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
    }

    
    

}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
