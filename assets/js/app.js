function makeResponsive() {

    var svgArea = d3.select("#scatter").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set up the svg params
    var svgWidth = 800;
    var svgHeight = 600;

    var margin = {
    top: 50,
    right: 50,
    bottom: 120,
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

    // Import data from the data.csv file
    d3.csv("assets/data/data.csv").then(censusData => {
        
        // Preview the data
        console.log(censusData);

        // Format the data
        censusData.forEach(data => {
            data.healthcare = +data.healthcare;
            data.poverty = +data.poverty;
        });

        // Create Scales
        var xStart = d3.min(censusData, d => d.poverty)-1;
        var xEnd = d3.max(censusData, d => d.poverty)+2;
        var xScale = d3.scaleLinear()
            .domain([xStart, xEnd])
            .range([0, width]);
        
        var yStart = d3.min(censusData, d => d.healthcare)-0.5;
        var yEnd = d3.max(censusData, d => d.healthcare)+3;
        var yScale = d3.scaleLinear()
            .domain([yStart, yEnd])
            .range([height, 0]);
        
        // Create Axes
        var bottomAxis = d3.axisBottom(xScale);
        var leftAxis = d3.axisLeft(yScale);

        // Append x & y axis
        var xAix = chartGroup.append("g")
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
            .attr("cx", d => xScale(d.poverty))
            .attr("cy", d => yScale(d.healthcare));
    
        circlesGroup.append("text")
            .classed("stateText", true)
            .attr("x", d => xScale(d.poverty))
            .attr("y", d => yScale(d.healthcare - 0.2))
            .style("font-size", "10px")
            .text(d => d.abbr);

        // Create group for the x-axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            // .attr("value", "poverty") // value to grab for event listener
            // .classed("active", true)
            .classed("aText", true)
            .text("In Poverty (%)");
        
        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("aText", true)
            .text("Lacks Healthcare (%)");
        
        // Append text to circles


        var toolTip = d3.select("body")
            .append("div")
            .classed("tooltip", true);


    })

}

makeResponsive();

// d3.select(window).on("resize", makeResponsive);
