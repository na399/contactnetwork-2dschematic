function createSchematicPlot(data, id, options) {
  let config = {
    w: 1200, // Width of the circle
    h: 600, // Height of the circle
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  // Put all of the options into a variable called config
  if (typeof options !== 'undefined') {
    Object.keys(options).forEach(i => {
      if (typeof options[i] !== 'undefined') {
        config[i] = options[i];
      }
    });
  }

  // Process the data
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  let interactions = data.interactions;
  let segment_map = data.segment_map;
  let sequence_numbers = data.sequence_numbers;
  let aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
  let gen_map = data.generic_map;
  let num_seq_numbers = Object.keys(data.sequence_numbers).length;

  // Compute segment offsets
  let i;

  let segments = [];

  let seg;
  let prevSeg = segment_map[sequence_numbers[0]];
  let seqStart = 0;

  for (i = 0; i < num_seq_numbers; i++) {
    seg = segment_map[sequence_numbers[i]];

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
    .select(id)
    .select('svg')
    .remove();

  // Initiate the radar chart SVG
  let svg = d3
    .select(id)
    .append('svg')
    .attr('width', config.w + config.margin.left + config.margin.right)
    .attr('height', config.h + config.margin.top + config.margin.bottom)
    .attr('class', 'schematic2d');

  var oldCol = 0;
  var oldI = 0;
  var offset = 0;

  let g = svg
    .selectAll('g')
    .data(Object.keys(segment_map))
    .enter()
    .append('g')
    .attr('class', d => `node aa-${d}`)
    .attr('data-aa', d => d)
    .attr('transform', (d, i) => {
      let col = segmentList.indexOf(segment_map[d]);

      let height = 15;
      let x = 120 * col;

      if (oldCol !== col) {
        oldI = i - 1;
      }

      let y;
      if (col % 2 === 0) {
        y = (i - oldI) * height;
      } else {
        y = 500 - (i - oldI) * height;
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
      (d, i) => segmentColors[segmentList.indexOf(segment_map[d]) + 1],
    );

  g
    .append('text')
    .attr('x', 1)
    .attr('y', 11)
    .attr('font-size', 10)
    // .attr('stroke', 'white')
    .text((d, i) => d);

  d3
    .select('.schematic2d')
    .append('g')
    .selectAll('line')
    .data(
      Object.keys(interactions).filter((d) => {
        pair = separatePair(d);
        if (isContiguous(segment_map[pair[0]], segment_map[pair[1]])) {
          return d;
        }
      })
    )
    .enter()
    .insert('line', 'g')
    .attrs({
      x1: d => parseInt(getCoordAA(separatePair(d)[0])[0]) + 10,
      y1: d => parseInt(getCoordAA(separatePair(d)[0])[1]) + 7,
      x2: d => parseInt(getCoordAA(separatePair(d)[1])[0]) + 10,
      y2: d => parseInt(getCoordAA(separatePair(d)[1])[1]) + 7,
    })
    .style('stroke', 'steelblue')
    .style('opacity', '0.6')
    .attr('class', d => `edge-${d}`);

  function isContiguous(segment1, segment2) {
    var regex = /[TMH]+([0-9])/;

    if (!regex.exec(segment1) || !regex.exec(segment2)) {
        return false;
    } else {
        var segNo1 = regex.exec(segment1)[1];
        var segNo2 = regex.exec(segment2)[1];

        if (segNo2 - segNo1 === 1) {
            return true;
        } else {
            return false;
        }
    }


  }

  function getCoordAA(aa) {
    translate = d3.select(`.aa-${aa}`).attr('transform');

    var regex = /([0-9x]+),([0-9x]+)/g;

    var matches = regex.exec(translate);

    return [matches[1], matches[2]];
  }

  function separatePair(stringPair) {
    var regex = /([0-9x]+),([0-9x]+)/g;

    matches = regex.exec(stringPair);

    return [matches[1], matches[2]];
  }

  //   setTimeout(() => {
  //     console.log(getCoordAA(131));
  //   }, 2000);
}
