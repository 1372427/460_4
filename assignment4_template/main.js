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

let parseDate = d3.timeParse("%Y-%m-%d");  

let goodSleep = 7.5;

let key = (d) => d.date;  

function rowConverter(d) {
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
    //create svg element
    svg = d3.select('#chart1').attr('width', w).attr('height',h);

  
    let dateMin = d3.min(dataset, (d) => d.date);
    let dateMax = d3.max(dataset, (d) => d.date);

    //create Scales
    xScale = d3.scaleTime()
      .domain([dateMin, d3.timeDay.offset(dateMax, 1)])  
      .rangeRound([80, w - 80]);

    yScale = d3.scaleLinear()
    .domain([0, 12])  
    .range([ h - 20, 20])

    cScale = d3.scaleLinear()
      .domain([0, 12])
      .range(['red', 'orange']);

    let barWidth = Math.floor((w - 160) / dataset.length) ;

    //background rect
    svg.append('rect')
      .attr('x', 80)
      .attr('y',  yScale(goodSleep))
      .attr('width', w-160)
      .attr('height', (h-20) - yScale(goodSleep))
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('class', 'transp');

      
    //bar elements
    svg.selectAll('.bar')
      .data(dataset, key)
      .enter()
      .append('rect')
      .attr('x', (d, i) =>xScale(d.date))
      .attr('y', (d) => yScale(d.hoursSleep))
      .attr('width', barWidth)
      .attr('height', (d) => (h-20) - yScale(d.hoursSleep))
      .attr('fill', (d) => cScale(d.hoursSleep))
      .attr('class', 'bar');

    // AXES
    xAxis = d3.axisBottom(xScale).ticks(dataset.length).tickFormat(d3.timeFormat("%a"));
    yAxis = d3.axisLeft(yScale);

    xAxisGroup = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${h - 20})`)
      .call(xAxis);

    yAxisGroup = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(80,0 )`)
      .call(yAxis);

  })
}

function updateGraph() {
  let numDays = numDaysSlider.value;
  daysText.innerText = numDays;
  let currDataset = dataset.slice(7-numDays, 7);

  //select bar elements
  let bars = svg.selectAll('.bar').data(currDataset, key);

  // update our scales and axes...
  let dateMin = d3.min(currDataset, (d) => d.date);
  let dateMax = d3.max(currDataset, (d) => d.date);

  xScale.domain([dateMin, d3.timeDay.offset(dateMax, 1)])
  xAxis.scale(xScale).ticks(currDataset.length);
  xAxisGroup.transition('axis')
    .duration(500)
    .call(xAxis);

  let barWidth = Math.floor((w - 160) / currDataset.length) ;
  // now tell what we want to happen for any new bars
  // and what to do with all new and current bars (the code after the merge)
  bars
      .enter()
      .append('rect')
      .classed('bar', true)
      .attr('x', (d) =>-2*barWidth)
      .attr('y', (d) => yScale(d.hoursSleep))
      .attr('width', barWidth)
      .attr('height', (d) => (h-20) - yScale(d.hoursSleep))
      .attr('fill', (d) => cScale(d.hoursSleep))
    .merge(bars)
      .transition()
      .duration(500)
      .attr('x', (d) =>xScale(d.date))
      .attr('width', barWidth);

    // and here we handle those that are exiting
    bars.exit()
      .transition()
      .duration(500)
      .attr('x', (d) =>-2*barWidth)
      .remove();
}

window.onload = function() {
  initGraph(); 
  numDaysSlider.addEventListener('change', updateGraph);
}
