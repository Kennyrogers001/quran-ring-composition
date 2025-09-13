function drawTimeline(svg, data) {
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const margin = { top: 60, right: 40, bottom: 60, left: 40 };

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Tooltip
    const tooltip = d3.select('#tooltip');

    // 1. Create a scale for the x-axis
    const xScale = d3.scalePoint()
        .domain(data.verses.map(d => d.id))
        .range([0, innerWidth])
        .padding(0.8);

    // 2. Draw the main timeline axis
    g.append('line')
        .attr('x1', 0)
        .attr('y1', innerHeight / 2)
        .attr('x2', innerWidth)
        .attr('y2', innerHeight / 2)
        .style('stroke', '#ccc')
        .style('stroke-width', 3);

    // 3. Draw arcs for the pairs
    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    g.selectAll('path.pair-arc')
        .data(data.pairs)
        .enter()
        .append('path')
        .attr('class', 'pair-arc')
        .attr('d', d => {
            const startVerse = data.verses[d.a];
            const endVerse = data.verses[d.b];
            const x1 = xScale(startVerse.id);
            const x2 = xScale(endVerse.id);
            const y = innerHeight / 2;
            const arcRadius = Math.abs(x2 - x1) / 2;
            // Use 0 for sweep-flag to draw the arc above the line
            return `M ${x1} ${y} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y}`;
        })
        .style('fill', 'none')
        .style('stroke', (d, i) => colors(i))
        .style('stroke-width', 2.5);

    // 4. Draw the nodes
    const nodes = g.selectAll('g.verse-node')
        .data(data.verses)
        .enter()
        .append('g')
        .attr('class', 'verse-node')
        .attr('transform', d => `translate(${xScale(d.id)}, ${innerHeight / 2})`);

    nodes.append('circle')
        .attr('r', 12)
        .style('fill', '#fff')
        .style('stroke', (d, i) => colors(data.pairs.findIndex(p => p.a === i || p.b === i)))
        .style('stroke-width', 3);

    nodes.append('text')
        .attr('dy', '30px') // Position text below the node
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .style('font-size', '12px')
        .style('font-weight', '500');

    // 5. Add hover interactions
    nodes.on('mouseover', function(event, d) {
        d3.select(this).select('circle').transition().duration(200).attr('r', 18);
        tooltip.style('opacity', 1)
               .html(`<div class="tooltip-arabic">${d.text}</div><div>${d.translation}</div>`);
    })
    .on('mousemove', function(event, d) {
        tooltip.style('left', (event.pageX + 15) + 'px')
               .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(event, d) {
        d3.select(this).select('circle').transition().duration(200).attr('r', 12);
        tooltip.style('opacity', 0);
    });
}