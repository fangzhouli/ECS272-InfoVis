import React, { Component } from 'react';
import * as d3 from "d3";
import _ from 'lodash'
import { axisBottom, format, geoCircle, line, scaleBand, scaleLinear, sort, zoom } from 'd3';
import csv from '../../data/processed.csv';
import './ScatterPlot.css'
import { color, colorByGenre } from '../../utils/color';

export default class ScatterPlot extends Component {

    componentDidMount() {
        this.drawChart();
    }

    drawChart() {
        d3.csv(csv)
            .then(csv => {

                var data = csv.map(row => {
                    return {
                        source: row['source'],
                        score: Number(row['score']),
                        name: row['name'],
                        year: Number(row['year_from']),
                        pop: row['popularity'],
                        genre: row['genre_list']

                    }
                });
                /********************************* 
               * Visualization codes start here
               * ********************************/

                //constants for visualizations
                const width = 1000,
                    height = 500,
                    margin = { top: 100, right: 100, bottom: 100, left: 100 };

                const FILTER_YEAR_MIN = 1990,
                    FILTER_YEAR_MAX = 2018;

                const popularityDomain = d3.extent(data.map(d => parseFloat(d.pop)))



                const dataFiltered = [];
                data.forEach(d => {
                    if (Number(d.year) >= FILTER_YEAR_MIN & Number(d.year) <= FILTER_YEAR_MAX) {
                        dataFiltered.push(d);
                    }
                })
                const genreList = ['Other', 'Supernatural', 'Slice of Life', 'Shounen',
                    'Seinen', 'Sci-Fi', 'School', 'Romance', 'Adult',
                    'Fantasy', 'Drama', 'Comedy', 'Adventure', 'Action', 'Kids'];


                //replaces genre with single genre for rendering in scatter plot
                dataFiltered.forEach(d => {
                    for (let i = 0; i < genreList.length; i++) {
                        if (d.genre.includes(genreList[i])) {
                            d.genre = genreList[i];
                            break;
                        }
                    }
                })

                var svg = d3.select('#container')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)


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

                //Code for ScatterPlot/*
                /*-------------------------------------------------------------------------------------*/
                var brush = svg.select('#brush')

                console.log('testBrush', brush)
                var sourceByScore = zoom_child.append('g')
                    .attr('class', 'sourceByScore');

                //get axes for sourceByScore
                var x_sbs = scaleBand()
                    .domain(['4-koma manga', 'Book', 'Card game', 'Digital manga', 'Game', 'Light novel', 'Manga', 'Music', 'Novel', 'Original', 'Other', 'Picture book', 'Radio', 'Unknown', 'Visual novel', 'Web manga'])
                    .range([margin.left, width - margin.right])

                //axis for popularity
                var x_pop = scaleLinear()
                    .domain(popularityDomain)
                    .range([margin.left, width - margin.right])


                //change this line to render a different x axis
                var inScatter = x_pop;

                //this stays constant-------------
                var y = scaleLinear()
                    .domain([0, 10])
                    .range([height - margin.bottom, margin.top])

                //------------------------------------------------
                var scatterPoints = sourceByScore.selectAll('circle')
                    .data(dataFiltered)
                    .join('circle')
                    .attr('r', 1)
                    .attr('fill', d => colorByGenre(d.genre))
                    .attr('cx', d => inScatter(d.pop))
                    .attr('cy', d => y(d.score))
                    .attr('class', 'scatterPoints')

                var animeName = scatterPoints.append('title')
                    .text(d => d.name)

                sourceByScore.append("g")
                    .call(d3.axisBottom(inScatter))
                    .attr('transform', `translate(0,${height - margin.bottom})`)
                    .append('text')
                    .text('Popularity Of Anime Amongst General Public');

                sourceByScore.append("g")
                    .call(d3.axisLeft(y).ticks(10))
                    .attr('transform', `translate(${margin.left},0)`)
                    .append('text')
                    .text('Score of Anime');
            });

    }

    render() {
        return <div id={"#" + this.props.id
        } ></div >
    }

}
