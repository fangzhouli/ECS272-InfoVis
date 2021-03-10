import React, { Component } from 'react';
import * as d3 from "d3";
import { axisBottom, format, line, scaleBand, scaleLinear, sort, zoom } from 'd3';

class BarChart extends Component {

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    d3.csv(this.props.data)
      .then(csv => {

        var data = csv.map(row => {
          return {
            source: row[' source'],
            score: Number(row[' score']),
            name: row[' name']
          }
        })


        console.log(data)
        /********************************* 
       * Visualization codes start here
       * ********************************/
        var width = 1800;
        var height = 400;
        var s_width = width / 3;

        var margin = { left: 60, right: 20, top: 40, bottom: 60 }

        //groupby function made by Keshav Dasu (you mentioned we could use this in lecture)
        function groupBy(objectArray, property) {
          return objectArray.reduce(function (acc, obj) {
            let key = obj[property]
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(obj)
            return acc
          }, {})
        }

        var groupBySource = groupBy(csv, " source");


        var svg = d3.select('#container')
          .append('svg')
          .attr('width', width + 7 * margin.left + 7 * margin.right)
          .attr('height', 2 * height + 3 * margin.top + 3 * margin.bottom)


        var zoom_child = svg.append('g');

        let transform;

        svg.call(d3.zoom().scaleExtent([1, 8])
          .on("zoom", t => {
            zoom_child.attr("transform", (transform = t.transform));
          }));

        function compare(a, b) {
          if (a.score > b.score) {
            return -1;
          }
          if (a.score < b.score) {
            return 1;
          }
          return 0;
        }

        //helper funtions
        /*-------------------------------------------------------------------------------------*/
        //function to return top 5 animes by and with score (list of of pairs)
        //input: brush (selection of points) 
        //for practice brush will be equivalent to csv
        function findTopN(brush, n) {
          return brush.sort(compare).slice(0, n);
        }

        /*-------------------------------------------------------------------------------------*/

        //Code for Scatterplot
        /*-------------------------------------------------------------------------------------*/
        var sourceByScore = zoom_child.append('g');

        //get axes for sourceByScore
        var x_sbs = scaleBand()
          .domain(['4-koma manga', 'Book', 'Card game', 'Digital manga', 'Game', 'Light novel', 'Manga', 'Music', 'Novel', 'Original', 'Other', 'Picture book', 'Radio', 'Unknown', 'Visual novel', 'Web manga'])
          .range([0, width / 2])

        var y_sbs = scaleLinear()
          .domain([0, 10])
          .range([height, 0])

        var scatterPlot = sourceByScore.selectAll('circles')
          .data(data)
          .join('circle')
          .attr('r', 3)
          .attr('fill', 'steelblue')
          .attr('cx', d => x_sbs(d.source) + margin.left / 2)
          .attr('cy', d => y_sbs(d.score))
          .attr('class', 'circ')
          .append('title')
          //fordebugging
          .text(d => {
            let to_ret = "";
            to_ret += d.source + ", " + d.score;
            return to_ret
          });

        sourceByScore.append("g")
          .attr("transform", (d, i) => `translate(${0}, ${height})`)
          .call(d3.axisBottom(x_sbs));

        sourceByScore.append("g")
          .call(d3.axisLeft(y_sbs).ticks(10));
        /*-------------------------------------------------------------------------------------*/

        //code for barchart
        /*-------------------------------------------------------------------------------------*/
        var top5 = findTopN(data, 5);
        console.log(top5)
        var barChart = zoom_child.append('g')
          .attr("transform", `translate(${width / 2 + 3*margin.left},${0})`)

        var x_bar = scaleLinear()
          .domain([0, 10])
          .range([0,width/2])

        var y_bar = scaleBand()
          .domain(top5.map(d => d.name))
          .range([height, 0])
          .padding(0.1)

        var bars = barChart.selectAll('rect')
          .data(top5)
          .join('rect')
          .attr('width', d => x_bar(d.score))
          //the height needs to be a function of the number of rects displayed in the brushing
          //with a max value of 5. 
          .attr('height', y_bar.bandwidth())
          .attr('x', 0)
          .attr('y', d => y_bar(d.name))
          .attr('fill', 'steelblue')

        barChart.append("g")
          .attr("transform", (d, i) => `translate(${0}, ${height})`)
          .call(d3.axisBottom(x_bar));

        barChart.append("g")
          .call(d3.axisLeft(y_bar));
        /*-------------------------------------------------------------------------------------*/

      });

  }

  render() {
    return <div id={"#" + this.props.id
    } ></div >
  }
}

export default BarChart;