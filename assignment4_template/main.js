let dataset;
let w = 600;
let h = 500;
let svg;
let xScale, yScale, cScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;

let numDaysSlider = document.querySelector("#numDaysSlider");
let daysText = document.querySelector("#daysText");

let dataURL = "data.csv";

let parseDate = d3.timeParse("%Y-%m-%d"); // put code here for d3 date parsing  

let goodSleep = 7.5;

let key = (d) => d.date;  // put code here for key function to join data to visual elements 

function rowConverter(d) {
  // put code here for row conversion
  return {
    date: parseDate(d.date),
    hoursSleep: parseFloat(d.hours_of_sleep)
  }
}

function initGraph() {
  d3.csv(dataURL, rowConverter).then((data) => {
    // sort by date ascending
    data.sort((a,b) => a.date - b.date);

    dataset = data;
    svg = d3.select('#chart1').attr('width', w).attr('height',h);

  
    let dateMin = d3.min(dataset, (d) => d.date);
    let dateMax = d3.max(dataset, (d) => d.date);

  xScale = d3.scaleTime()
    .domain([dateMin, d3.timeDay.offset(dateMax, 1)])  
    .rangeRound([80, w - 80]);

  yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset, (d) => d.hoursSleep)])  
  .range([ h - 20, 20])

  cScale = d3.scaleLinear()
    .domain([goodSleep, d3.max(dataset, (d) => d.hoursSleep)])
    .range(['red', 'orange']);

    let barWidth = Math.floor((w - 80) / dataset.length) - 15;
/*
    svg.append('rect')
      .attr('x', 80)
      .attr('y',  yScale(goodSleep))
      .attr('width', w)
      .attr('height', (h-20) - yScale(goodSleep))
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('class', 'transp');
*/
      

  svg.selectAll('rect')
    .data(dataset, key)
    .enter()
    .append('rect')
    .attr('x', (d, i) =>xScale(d.date))
    .attr('y', (d) => yScale(d.hoursSleep))
    .attr('width', barWidth)
    .attr('height', (d) => (h-20) - yScale(d.hoursSleep))
    .attr('fill', (d) => cScale(d.hoursSleep));

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);
  // AXES
  xAxisGroup = svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0, ${h - 20})`)
    .call(xAxis);

  yAxisGroup = svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(80,0 )`)
    .call(yAxis);

    console.log(dataset);

  })
}

function updateGraph() {
  let numDays = numDaysSlider.value;
  daysText.innerText = numDays;

    let bars = svg.selectAll('rect').data(dataset, key);

    let dateMax = d3.max(dataset, (d) => d.date);
    // update our scales and axes...
    //xScale.domain([d3.timeDay.offset(dateMax, -(numDays)), d3.timeDay.offset(dateMax, 1)])
    yScale.domain([0, d3.max(dataset, (d) => d.hoursSleep)])
    yAxis.scale(yScale);
    xAxis.scale(xScale);
    yAxisGroup.transition('axis')
      .duration(1000)
      .call(yAxis);
    xAxisGroup.transition('axis')
      .duration(1000)
      .call(xAxis);

    // now tell what we want to happen for any new bars
    // and what to do with all new and current bars (the code after the merge)
    /*bars
      .enter()
        .append('rect')
        .classed('bar', true)
        .attr('x', w)
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => (h - 20) - yScale(d.value))
      .merge(bars)
        .transition()
        .duration(500)
        .attr('x', (d,i) => xScale(i))      
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => (h - 20) - yScale(d.value))
        .attr('width', xScale.bandwidth())  
    ;*/

    // and here we handle those that are exiting
    bars.exit()
      .transition()
      .duration(250)
      .style('opacity', 0)
      .remove();
}



window.onload = function() {
  initGraph(); 
  numDaysSlider.addEventListener('change', updateGraph);
}
