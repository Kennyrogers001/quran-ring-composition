function drawRing(svg, data) {
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const radius = Math.min(width, height) / 2 - 80; // Increased margin for labels
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // Tooltip
    const tooltip = d3.select('#tooltip');

    // 1. Calculate positions for each verse on the circle
    const angleScale = d3.scaleBand()
        .domain(data.verses.map(d => d.id))
        .range([0, 2 * Math.PI])
        .align(0);

    const points = data.verses.map((verse, i) => ({
        x: radius * Math.sin(angleScale(verse.id)),
        y: -radius * Math.cos(angleScale(verse.id)),
        angle: angleScale(verse.id),
        index: i,
        ...verse
    }));

    // 2. Draw arcs for the pairs
    const arcGenerator = d3.line().curve(d3.curveBasis);
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const pairPaths = g.selectAll('path.pair-arc')
        .data(data.pairs)
        .enter()
        .append('path')
        .attr('class', 'pair-arc')
        .attr('d', d => {
            const startPoint = points[d.a];
            const endPoint = points[d.b];
            // Control point for a smoother curve towards the center
            const midX = (startPoint.x + endPoint.x) * 0.3;
            const midY = (startPoint.y + endPoint.y) * 0.3;
            return arcGenerator([[startPoint.x, startPoint.y], [midX, midY], [endPoint.x, endPoint.y]]);
        })
        .style('fill', 'none')
        .style('stroke', (d, i) => colors(i))
        .style('stroke-width', 2.5)
        .style('opacity', 0.6);

    // 3. Draw nodes for each verse
    const nodes = g.selectAll('g.verse-node')
        .data(points)
        .enter()
        .append('g')
        .attr('class', 'verse-node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    const circles = nodes.append('circle')
        .attr('r', 14)
        .style('fill', '#ffffff')
        .style('stroke', (d, i) => colors(data.pairs.findIndex(p => p.a === i || p.b === i)))
        .style('stroke-width', 3);

    // Add verse number labels outside the main circle
    const labels = g.selectAll('text.label')
        .data(points)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => (radius + 25) * Math.sin(d.angle))
        .attr('y', d => -(radius + 25) * Math.cos(d.angle))
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .style('font-size', '12px')
        .style('fill', '#444');

    // 4. Add hover interactions
    nodes.on('mouseover', function(event, d) {
        const pair = data.pairs.find(p => p.a === d.index || p.b === d.index);

        // Enlarge this circle
        d3.select(this).select('circle').transition().duration(200).attr('r', 20);

        // Highlight corresponding pair arc and node
        if (pair) {
            const otherIndex = pair.a === d.index ? pair.b : pair.a;
            nodes.filter(nodeData => nodeData.index === otherIndex)
                 .select('circle').transition().duration(200).attr('r', 20).style('fill', '#f0f0f0');
            
            pairPaths.filter(p => p === pair)
                     .transition().duration(200)
                     .style('stroke-width', 5)
                     .style('opacity', 1);
        }

        // Show tooltip
        tooltip.style('opacity', 1)
               .html(`<div class="tooltip-arabic">${d.text}</div><div>${d.translation}</div>`);

    }).on('mousemove', function(event, d) {
        tooltip.style('left', (event.pageX + 15) + 'px')
               .style('top', (event.pageY - 28) + 'px');

    }).on('mouseout', function(event, d) {
        // Reset all highlights
        circles.transition().duration(200).attr('r', 14).style('fill', '#fff');
        pairPaths.transition().duration(200).style('stroke-width', 2.5).style('opacity', 0.6);

        // Hide tooltip
        tooltip.style('opacity', 0);
    });
}