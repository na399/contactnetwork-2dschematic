function createSchematicPlot(data, containerSelector, options) {
  let config = {
    w: 1200, // Width of the circle
    h: 900, // Height of the circle
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
    .select(containerSelector)
    .select('svg')
    .remove();

  // Initiate the SVG
  let svg = d3
    .select(containerSelector)
    .append('svg')
    .attr('width', config.w + config.margin.left + config.margin.right)
    .attr('height', config.h + config.margin.top + config.margin.bottom)
    .attr('class', 'schematic2d');

  // Draw Reisues
  let oldCol = 0;
  let oldI = 0;
  let offset = 0;
  let colSpace = 120;

  let g = svg
    .selectAll('g')
    .data(Object.keys(segment_map_full))
    .enter()
    .append('g')
    .attr('class', (d) => `node aa-${d}`)
    .attr('data-aa', (d) => d)
    .attr('data-segment', (d) => segment_map_full[d])
    .attr('transform', (d, i) => {
      let col = segmentList.indexOf(segment_map_full[d]);

      let height = 15;
      let x = colSpace * col;

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
      'white',
      //(d, i) => segmentColors[segmentList.indexOf(segment_map_full[d]) + 1],
    )
    .style('stroke', 'black');

  g
    .append('text')
    .attr('x', 10)
    .attr('y', 11)
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .text((d, i) => d);

  // Draw contact lines
  let interactionsList = [];

  Object.keys(interactions).forEach((interaction) => {
    pair = separatePair(interaction);
    if (pair[0] in segment_map_full && pair[1] in segment_map_full) {
      if (isContiguous(segment_map_full[pair[0]], segment_map_full[pair[1]])) {
        getInteractionTypesFromPdbObject(Object.values(interactions[interaction])).forEach(
          // only works with a single PDB
          (interactionType) => {
            let d = {
              pair: interaction,
              interactionType: interactionType,
            };
            interactionsList.push(d);
          },
        );
      }
    }
  });

  d3
    .select('.schematic2d')
    .append('g')
    .selectAll('path')
    .data(interactionsList)
    .enter()
    .append('path')
    .attr('d', (d) => {
      let coord = getCoordPair(d.pair);

      return `M ${coord.sourceX} ${coord.sourceY} L ${coord.targetX} ${coord.targetY}`;
    })
    .attr(
      'data-source-segment',
      (d) => segment_map_full[separatePair(d.pair)[0]],
    )
    .attr(
      'data-target-segment',
      (d) => segment_map_full[separatePair(d.pair)[1]],
    )
    .attr('data-interaction-type', (d) => d.interactionType)
    .style('stroke', (d) => {
      let rgb = getInteractionColor(d.interactionType);
      let hex = rgb2hex(rgb.r, rgb.g, rgb.b);
      return hex;
    })
    .style('stroke-width', '3')
    .style('opacity', '0.6')
    .attr(
      'class',
      (d) =>
        `${getFriendlyInteractionName(d.interactionType).replace(
          / /g,
          '-',
        )} edge edge-${d.pair}`,
    );

  // Reposition the helices by minimizing the sum of gradients of contacts
  segmentList.forEach((segment) => {
    if (segment != 'TM1') {
      let gradientSum = 0;
      let contactCount = 0;

      $(`path[data-target-segment='${segment}']`).each((i, path) => {
        let d = path.getAttribute('d');

        let regex = /M (.+) (.+) L (.+) (.+)/;
        let matches = regex.exec(d);

        let gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

        gradientSum += gradient;
        contactCount += 1;
      });

      let gradientMean = gradientSum / contactCount;
      let shiftY = gradientMean * colSpace;

      console.log(-gradientMean);

      // Reposition each node
      $(`g.node[data-segment='${segment}'`).each((i, g) => {
        let transformValue = g.getAttribute('transform');

        let regex = /\((.+),(.+)\)/;
        let matches = regex.exec(transformValue);

        let x = matches[1];
        let y = matches[2] - shiftY;

        g.setAttribute('transform', `translate(${x},${y})`);
      });

      // Reposition the edges TERMINATING at the repositioned nodes
      $(`path[data-target-segment='${segment}']`).each((i, path) => {
        let d = path.getAttribute('d');

        let regex = /M (.+) (.+) L (.+) (.+)/;
        let matches = regex.exec(d);

        let newTargetY = matches[4] - shiftY;

        path.setAttribute(
          'd',
          `M ${matches[1]} ${matches[2]} L ${matches[3]} ${newTargetY}`,
        );
      });

      // Reposition the edges ORIGINATING at the repositioned nodes
      $(`path[data-source-segment='${segment}']`).each((i, path) => {
        let d = path.getAttribute('d');

        let regex = /M (.+) (.+) L (.+) (.+)/;
        let matches = regex.exec(d);

        let newSourceY = matches[2] - shiftY;

        path.setAttribute(
          'd',
          `M ${matches[1]} ${newSourceY} L ${matches[3]} ${matches[4]}`,
        );
      });
    }
  });

  console.log('^^^^^^^^^^^^^^^^^');
  console.log('Gradient Before');
  console.log('=================');
  console.log('Gradient After');
  console.log('vvvvvvvvvvvvvvvvv');

  segmentList.forEach((segment) => {
    if (segment != 'TM1') {
      let gradientSum = 0;
      let contactCount = 0;

      $(`path[data-target-segment='${segment}']`).each((i, path) => {
        let d = path.getAttribute('d');

        let regex = /M (.+) (.+) L (.+) (.+)/;
        let matches = regex.exec(d);

        let gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

        gradientSum += gradient;
        contactCount += 1;
      });

      let gradientMean = gradientSum / contactCount;
      console.log(-gradientMean);
    }
  });

  function getCoordPair(pair) {
    let AAs = separatePair(pair);
    let coordSourceAA = getCoordAA(AAs[0]);
    let coordTargetAA = getCoordAA(AAs[1]);

    return {
      sourceY: parseFloat(coordSourceAA.y) + 7,
      sourceX: parseFloat(coordSourceAA.x) + 20,
      targetX: parseFloat(coordTargetAA.x),
      targetY: parseFloat(coordTargetAA.y) + 7,
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

  // Create Legend
  // Populatschematic legend
  let interactionTypes = new Set();

  $(containerSelector + ' .edge').each(function() {
    let friendlyName = getFriendlyInteractionName(
      $(this).data('interaction-type'),
    );
    interactionTypes.add(friendlyName);
  });

  // Add interactions color legend
  let legendHtml = '<ul>';

  interactionTypes = Array.from(interactionTypes).sort(function(i1, i2) {
    return getInteractionStrength(i2) - getInteractionStrength(i1);
  });

  interactionTypes.forEach(function(i) {
    let rgb = getInteractionColor(i);
    legendHtml =
      legendHtml +
      '<li>' +
      '<div class="color-box" style="background-color: ' +
      rgb2hex(rgb.r, rgb.g, rgb.b) +
      '">' +
      '<input type="checkbox" data-interaction-type="' +
      i.replace(/ /g, '-') +
      '"></input>' +
      '</div><p>' +
      i +
      '</p>' +
      '</li>';
  });
  legendHtml += '</ul>';

  // Add SVG download button
  legendHtml +=
    '<button onclick="downloadSVG(\'' +
    containerSelector +
    'schematic\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' +
    '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
    '</button>';

  // Add CSV download button
  legendHtml +=
    '<br /><button onclick="downloadSingleCrystalCSV(\'' +
    containerSelector +
    'schematic\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' +
    '</button>';

  $(containerSelector + ' .schematic-legend').append(legendHtml);

  $(containerSelector + ' .schematic-legend input[type=checkbox]').each(
    function() {
      $(this).prop('checked', true);
      $(this).change(function() {
        let interactionType = $(this).data('interaction-type');
        let paths = $(containerSelector + ' path.' + interactionType);

        if ($(this).is(':checked')) {
          paths.show();
        } else {
          paths.hide();
        }
      });
    },
  );
}
