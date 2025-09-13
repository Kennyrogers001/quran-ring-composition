function drawTree(svg, data) {
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select('#tooltip');

    // 1. Transform the flat data into a hierarchical structure
    function buildHierarchy(verses, pairs) {
        if (verses.length === 0) return null;

        const verseMap = verses.map((v, i) => ({ name: v.id, verse: v, children: [], index: i }));

        if (pairs.length === 0) {
            return { name: 'Root', children: verseMap };
        }

        let root = { name: 'Root', children: [] };
        const nodesByLevel = [root];

        // Create a nested structure from pairs
        let currentParent = root;
        for (const pair of pairs) {
            const verseA = verseMap[pair.a];
            const verseB = verseMap[pair.b];
            currentParent.children.push(verseA, verseB);
            currentParent = verseA; // Nest inside the first element of the pair
        }

        // Attach the pivot if it exists
        const pairedIndices = new Set(pairs.flatMap(p => [p.a, p.b]));
        const pivot = verseMap.find(v => !pairedIndices.has(v.index));
        if (pivot) {
            let deepestNode = root;
            while (deepestNode.children && deepestNode.children.length > 0) {
                deepestNode = deepestNode.children[0];
            }
            deepestNode.children.push(pivot);
        }

        return root;
    }

    const hierarchicalData = buildHierarchy(data.verses, data.pairs);
    if (!hierarchicalData) {
        svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('Could not generate tree.');
        return;
    }

    // 2. Create the tree layout
    const rootNode = d3.hierarchy(hierarchicalData);
    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    treeLayout(rootNode);

    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    // 3. Draw the links
    g.selectAll('.link')
        .data(rootNode.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', 2);

    // 4. Draw the nodes
    const nodes = g.selectAll('.node')
        .data(rootNode.descendants())
        .enter()
        .append('g')
        .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .filter(d => d.data.name !== 'Root');

    nodes.append('circle')
        .attr('r', 12)
        .style('fill', '#fff')
        .style('stroke', (d, i) => d.data.verse ? colors(data.pairs.findIndex(p => p.a === d.data.index || p.b === d.data.index)) : '#ccc')
        .style('stroke-width', 3);

    nodes.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.children ? -20 : 20)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name)
        .style('font-size', '14px')
        .style('font-weight', '500');

    // 5. Add hover interactions
    nodes.filter(d => d.data.verse)
        .on('mouseover', function(event, d) {
            d3.select(this).select('circle').transition().duration(200).attr('r', 18);
            tooltip.style('opacity', 1)
                   .html(`<div class="tooltip-arabic">${d.data.verse.text}</div><div>${d.data.verse.translation}</div>`);
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