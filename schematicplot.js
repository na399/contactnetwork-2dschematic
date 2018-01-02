function createSchematicPlot(data, container, options) {
  let config = {
    w: 1200, // Width of the circle
    h: 700, // Height of the circle
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  // Put all of the options into a variable called config
  if (typeof options !== 'undefined') {
    Object.keys(options).forEach((i) => {
      if (typeof options[i] !== 'undefined') {
        config[i] = options[i];
      }
    });
  }

  // Process the data
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  const interactions = data.interactions;
  const segment_map_full = data.segment_map_full;
  const sequence_numbers = data.sequence_numbers;
  const aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
  const gen_map = data.generic_map;
  const num_seq_numbers = Object.keys(data.sequence_numbers).length;

  // Compute segment offsets
  let i;

  let segments = [];

  let seg;
  let prevSeg = segment_map_full[sequence_numbers[0]];
  let seqStart = 0;

  for (i = 0; i < num_seq_numbers; i++) {
    seg = segment_map_full[sequence_numbers[i]];

    if (seg === prevSeg) {
      continue;
    }

    segments.push({
      seg: prevSeg,
      start: seqStart,
      end: i - 1,
    });

    seqStart = i;
    prevSeg = seg;
  }

  // Push last segment
  segments.push({
    seg: prevSeg,
    start: seqStart,
    end: i - 1,
  });

  const segmentList = [
    // 'N-term',
    'TM1',
    // 'ICL1',
    'TM2',
    // 'ECL1',
    'TM3',
    // 'ICL2',
    'TM4',
    // 'ECL2',
    'TM5',
    // 'ICL3',
    'TM6',
    // 'ECL3',
    'TM7',
    'H8',
    // 'C-term',
  ];

  const segmentColors = {
    1: '#1500D6',
    2: '#006BDB',
    3: '#00E1D1',
    4: '#00E74F',
    5: '#39ED00',
    6: '#C9F300',
    7: '#F99100',
    8: '#FF0000',
    0: '#FFFFFF',
  };

  // Remove whatever chart with the same id/class was present before
  d3
    .select(container)
    .select('svg')
    .remove();

  // Initiate the SVG
  let svg = d3
    .select(container)
    .append('svg')
    .attr('width', config.w + config.margin.left + config.margin.right)
    .attr('height', config.h + config.margin.top + config.margin.bottom)
    .attr('class', 'schematic2d');


  // Draw Reisues
  let oldCol = 0;
  let oldI = 0;
  let offset = 0;

  let g = svg
    .selectAll('g')
    .data(Object.keys(segment_map_full))
    .enter()
    .append('g')
    .attr('class', (d) => `node aa-${d}`)
    .attr('data-aa', (d) => d)
    .attr('transform', (d, i) => {
      let col = segmentList.indexOf(segment_map_full[d]);

      let height = 15;
      let x = 120 * col;

      if (oldCol !== col) {
        oldI = i - 1;
      }

      let y;
      if (col % 2 === 0) {
        y = (i - oldI) * height;
      } else {
        y = 700 - (i - oldI) * height;
      }

      oldCol = col;

      return `translate(${x},${y})`;
    });

  g
    .append('rect')
    .attr('width', 20)
    .attr('height', 14)
    // .attr('class', (d) => `rect aa-${d}`)
    .style(
      'fill',
      (d, i) => segmentColors[segmentList.indexOf(segment_map_full[d]) + 1],
    );

  g
    .append('text')
    .attr('x', 1)
    .attr('y', 11)
    .attr('font-size', 10)
    // .attr('stroke', 'white')
    .text((d, i) => d);

  // Draw contact lines
  d3
    .select('.schematic2d')
    .append('g')
    .selectAll('path')
    .data(
      Object.keys(interactions).filter((d) => {
        pair = separatePair(d);
        if (pair[0] in segment_map_full && pair[1] in segment_map_full) {
          if (
            isContiguous(segment_map_full[pair[0]], segment_map_full[pair[1]])
          ) {
            return d;
          }
        }
      }),
    )
    .enter()
    .append('path')
    .attr('d', (d) => {
      let coord = getCoordPair(d);

      return `M ${coord.sourceX} ${coord.sourceY} L ${coord.targetX} ${coord.targetY}`;
    })
    .attr('data-gradient', (d) => {
      let coord = getCoordPair(d);

      return -(coord.targetY - coord.sourceY) / (coord.targetX - coord.sourceX);
    })
    .style('stroke', 'steelblue')
    .style('opacity', '0.6')
    .attr('class', (d) => `edge-${d}`);

  function getCoordPair(pair) {
    let AAs = separatePair(pair);
    let coordSourceAA = getCoordAA(AAs[0]);
    let coordTargetAA = getCoordAA(AAs[1]);

    return {
      sourceY: parseInt(coordSourceAA.y) + 7,
      sourceX: parseInt(coordSourceAA.x) + 20,
      targetX: parseInt(coordTargetAA.x),
      targetY: parseInt(coordTargetAA.y) + 7,
    };
  }

  function isContiguous(segment1, segment2) {
    let regex = /[TMH]+([0-9])/;

    if (!regex.exec(segment1) || !regex.exec(segment2)) {
      return false;
    } else {
      let segNo1 = regex.exec(segment1)[1];
      let segNo2 = regex.exec(segment2)[1];

      if (segNo2 - segNo1 === 1) {
        return true;
      } else {
        return false;
      }
    }
  }

  function getCoordAA(aa) {
    translate = d3.select(`.aa-${aa}`).attr('transform');

    let regex = /(-?[0-9]+),(-?[0-9]+)/;

    let matches = regex.exec(translate);

    return { x: matches[1], y: matches[2] };
  }

  function separatePair(stringPair) {
    let regex = /([0-9x]+),([0-9x]+)/;

    matches = regex.exec(stringPair);

    return [matches[1], matches[2]];
  }
}
