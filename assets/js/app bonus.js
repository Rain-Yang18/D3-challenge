// Set up the svg params
var svgWidth = window.innerWidth - 100;
var svgHeight = window.innerHeight - 400;

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
        .domain([d3.min(censusData, d => d[chosenXAxis]) -1,
            d3.max(censusData, d => d[chosenXAxis]) +2
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

function renderTexts(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        label = "Poverty: ";
    }
    else {
        label = "Age: ";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([100, -10])
        .html(function(d) {
            return (`${d.state}<br>Healthcare: ${d.healthcare}%<br>${label} ${d[chosenXAxis]}`);
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
d3.csv("assets/data/data.csv").then(censusData => {
   
    // Preview the data
    console.log(censusData);

    // Format the data
    censusData.forEach(data => {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
    });

    // Create Scales

    // xScale = chosenXAxis
    var xLinearScale = xScale(censusData, chosenXAxis);
    
    // yScale = healthcare
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d.healthcare)-0.5, d3.max(censusData, d => d.healthcare)+3])
        .range([height, 0]);

    // Append the circles
    var circlesGroup = chartGroup.selectAll("g")
        .data(censusData)
        .enter()
        .append("g")
    
    var circle = circlesGroup.append("circle")
        .attr("r", 10)
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare));

    var circlesText = circlesGroup.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d.healthcare))
        .text(d => d.abbr)
        .classed("stateText", true)
        .attr("alignment-baseline", "central")
        .style("font-size", "10px");

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
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age Median");
    
    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("active", true)
        .classed("aText", true)
        .text("Lacks Healthcare (%)");
    
    // Create Axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x & y axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // Event listener
    labelsGroup.selectAll("text")
        .on("click", function() {

        // Get value of selection (this)
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // Replaces chosenXAxis with value
            chosenXAxis = value;
            
            // console.log(chosenXAxis)

            // Updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // Updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // Updates circles & text with new x values
            circle = renderCircles(circle, xLinearScale, chosenXAxis);
            circlesText = renderTexts(circlesText, xLinearScale, chosenXAxis);

            // Updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // Changes classes to change bold text
            if (chosenXAxis === "poverty") {
            povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
            povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
});