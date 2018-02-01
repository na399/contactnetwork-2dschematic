function createSchematicPlot(data, containerSelector, options, data1, data2) {
  const config = {
    w: 1000, // Width of the circle
    h: 900, // Height of the circle
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    type: 'singleCrystal', // ['singleCrystal', 'singleCrystalGroup', 'twoCrystalGroups']
    isContiguousPlot: true,
  };

  // Put all of the options into a variable called config
  if (typeof options !== 'undefined') {
    Object.keys(options).forEach((i) => {
      if (typeof options[i] !== 'undefined') {
        config[i] = options[i];
      }
    });
  }

  let isGeneric = false;

  if (config.type !== 'singleCrystal') {
    isGeneric = true;
  }

  // Process the data
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  const interactions = data.interactions;
  const segment_map_full = data.segment_map_full;
  const segment_map_full_gn = data.segment_map_full_gn;
  const sequence_numbers = data.sequence_numbers;
  const aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
  const gen_map = data.generic_map;
  const gen_map_full = data.generic_map_full;
  const num_seq_numbers = Object.keys(data.sequence_numbers).length;

  // Compute segment offsets
  let i;

  const segments = [];

  let seg;
  let prevSeg = isGeneric
    ? segment_map_full_gn[sequence_numbers[0]]
    : segment_map_full[sequence_numbers[0]];
  let seqStart = 0;

  for (i = 0; i < num_seq_numbers; i++) {
    seg = isGeneric
      ? segment_map_full_gn[sequence_numbers[i]]
      : segment_map_full[sequence_numbers[i]];

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

  // Remove whatever chart with the same id/class was present before
  d3
    .select(containerSelector)
    .select('svg')
    .remove();

  // Initiate the SVG
  const svg = d3
    .select(containerSelector)
    .append('svg')
    .attr('width', config.w + config.margin.left + config.margin.right)
    .attr('height', config.h + config.margin.top + config.margin.bottom)
    .attr('class', 'schematic2d');

  // Draw Reisues
  let oldCol = 0;
  let oldI = 0;

  const colSpace = 120;

  const rectWidth = 30;
  const rectHeight = 14;

  const g = svg
    .selectAll('g')
    .data(isGeneric ? Object.keys(segment_map_full_gn) : Object.keys(segment_map_full))
    .enter()
    .append('g')
    .attr('class', d => `node aa-${d}`)
    .attr('data-aa', d => d)
    .attr('data-segment', d => (isGeneric ? segment_map_full_gn[d] : segment_map_full[d]))
    .attr('transform', (d, i) => {
      const col = segmentList.indexOf(isGeneric ? segment_map_full_gn[d] : segment_map_full[d]);

      const height = rectHeight + 1;

      if (oldCol !== col) {
        oldI = i - 1;
      }

      let x;
      let y;

      if (config.isContiguousPlot) {
        x = colSpace * col;

        if (col % 2 === 0) {
          y = (i - oldI) * height;
        } else {
          y = 700 - (i - oldI) * height;
        }
      } else {
        // non-contiguous plot
        switch (col) {
          case 0:
            x = 740;
            y = config.margin.top + 250 + (i - oldI) * height;
            break;
          case 1:
            x = 620;
            y = config.h - config.margin.bottom - 400 - (i - oldI) * height;
            break;
          case 2:
            x = 380;
            y = config.margin.top + (i - oldI) * height;
            break;
          case 3:
            x = 140;
            y = config.h - config.margin.bottom - 400 - (i - oldI) * height;
            break;
          case 4:
            x = 20;
            y = config.margin.top + 250 + (i - oldI) * height;
            break;
          case 5:
            x = 260;
            y = config.h - config.margin.bottom - (i - oldI) * height;
            break;
          case 6:
            x = 500;
            y = config.margin.top + 350 + (i - oldI) * height;
            break;
          case 7:
            x = 530 + (i - oldI) * (rectWidth + 1);
            y = config.h - config.margin.bottom;
            break;
          default:
            x = -100;
            y = config.h - config.margin.bottom - (i - oldI) * height;
            break;
        }
      }

      oldCol = col;

      return `translate(${x},${y})`;
    });

  g
    .append('rect')
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .style('fill', 'white')
    .style('stroke', 'black');

  g
    .append('text')
    .attr('x', rectWidth / 2)
    .attr('y', rectHeight - 3)
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .text(d => (isGeneric ? d : gen_map_full[d]));
  // .text(d => d);

  switch (config.type) {
    case 'singleCrystal':
      renderSchematicSingleCrystal(getInteractionsSingleCrystal());
      createLegendSingleCrystal();
      break;
    case 'singleCrystalGroup':
      // getInteractionsCrystalGroup();
      renderSchematicSingleCrystalGroup();
      createLegendSingleCrystalGroup();
      break;
    case 'twoCrystalGroups':
      // getInteractionsCrystalGroup();
      svg.style('background-color', '#f0f0f0');
      renderSchematicTwoCrystalGroups();
      createLegendTwoCrystalGroups();
      break;
    default:
      break;
  }

  function getInteractionsSingleCrystal() {
    const interactionsList = [];
    Object.keys(interactions).forEach((interaction) => {
      const pair = separatePair(interaction);
      if (pair[0] in segment_map_full && pair[1] in segment_map_full) {
        if (
          config.isContiguousPlot
            ? isContiguous(segment_map_full[pair[0]], segment_map_full[pair[1]])
            : isNonContiguous(segment_map_full[pair[0]], segment_map_full[pair[1]])
        ) {
          getInteractionTypesFromPdbObject(Object.values(interactions[interaction])).forEach((interactionType) => {
            const d = {
              pair: interaction,
              interactionType,
            };
            interactionsList.push(d);
          });
        }
      }
    });
    return interactionsList;
  }

  function getInteractionsCrystalGroup() {
    const interactionsList = [];
    Object.keys(interactions).forEach((interaction) => {
      const pair = separatePair(interaction);
      if (pair[0] in segment_map_full_gn && pair[1] in segment_map_full_gn) {
        if (isContiguous(segment_map_full_gn[pair[0]], segment_map_full_gn[pair[1]])) {
          getInteractionTypesFromPdbObject(Object.values(interactions[interaction])).forEach((interactionType) => {
            const d = {
              pair: interaction,
              interactionType,
            };
            interactionsList.push(d);
          });
        }
      }
    });
    return interactionsList;
  }

  function renderSchematicSingleCrystal(interactionsList) {
    svg
      .append('g')
      .selectAll('path')
      .data(interactionsList)
      .enter()
      .append('path')
      .attr('d', (d) => {
        const coord = getCoordPair(d.pair);
        return `M ${coord.sourceX} ${coord.sourceY} L ${coord.targetX} ${coord.targetY}`;
      })
      .attr('data-source-segment', d => segment_map_full[separatePair(d.pair)[0]])
      .attr('data-target-segment', d => segment_map_full[separatePair(d.pair)[1]])
      .attr('data-interaction-type', d => d.interactionType)
      .style('stroke', (d) => {
        const rgb = getInteractionColor(d.interactionType);
        const hex = rgb2hex(rgb.r, rgb.g, rgb.b);
        return hex;
      })
      .style('stroke-width', '3')
      .style('opacity', '0.6')
      .attr(
        'class',
        d =>
          `${getFriendlyInteractionName(d.interactionType).replace(/ /g, '-')} edge edge-${d.pair}`,
      );
  }

  function renderSchematicSingleCrystalGroup() {
    svg
      .append('g')
      .selectAll('path')
      .data(Object.keys(interactions))
      .enter()
      .append('path')
      .filter((d) => {
        const pair = separatePair(d);
        if (pair[0] in segment_map_full_gn && pair[1] in segment_map_full_gn) {
          if (isContiguous(segment_map_full_gn[pair[0]], segment_map_full_gn[pair[1]])) {
            return d;
          }
        }
      })
      .attr('d', (d) => {
        const coord = getCoordPair(d);
        return `M ${coord.sourceX} ${coord.sourceY} L ${coord.targetX} ${coord.targetY}`;
      })
      .attr('data-source-segment', d => segment_map_full_gn[separatePair(d)[0]])
      .attr('data-target-segment', d => segment_map_full_gn[separatePair(d)[1]])
      .attr('data-pdbs', d => Object.keys(interactions[d]))
      .attr('data-num-interactions', (d) => {
        const nInteractions = Object.keys(interactions[d]).length;
        return nInteractions;
      })
      .style('stroke', (d) => {
        const nInteractions = Object.keys(interactions[d]).length;
        const frequency = nInteractions / data.pdbs.length;
        return d3.interpolateReds(frequency / 1.5);
      })
      .style('stroke-width', '2')
      .style('opacity', '0.6')
      .attr('class', d => `edge edge-${d}`)
      .on('mouseover', function (d) {
        d3.select(this).classed('highlighted', true);

        const coord = getCoordPair(d);

        const xPosition = (coord.sourceX + coord.targetX) / 2;
        const yPosition = (coord.sourceY + coord.targetY) / 2 + 20;

        // Update the tooltip position and value
        svg
          .append('text')
          .attr('id', 'tooltip')
          .attr('x', xPosition)
          .attr('y', yPosition)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('fill', 'blue')
          .text($(this).data('pdbs'));

        // TODO use jQuery UI
        // $(this).tooltip({
        //   container: containerSelector,
        //   placement: 'top',
        //   delay: 0,
        //   html: true,
        //   title: 'demo',
        // });
      })
      .on('mouseout', function (d) {
        d3.select(this).classed('highlighted', false);
        d3.select('#tooltip').remove();
      });
  }

  function renderSchematicTwoCrystalGroups() {
    svg
      .append('g')
      .selectAll('path')
      .data(Object.keys(interactions))
      .enter()
      .append('path')
      .filter((d) => {
        const pair = separatePair(d);
        if (pair[0] in segment_map_full_gn && pair[1] in segment_map_full_gn) {
          if (isContiguous(segment_map_full_gn[pair[0]], segment_map_full_gn[pair[1]])) {
            return d;
          }
        }
      })
      .attr('class', d => `edge edge-${d}`)
      .attr('d', (d) => {
        const coord = getCoordPair(d);
        return `M ${coord.sourceX} ${coord.sourceY} L ${coord.targetX} ${coord.targetY}`;
      })
      .attr('data-source-segment', d => segment_map_full_gn[separatePair(d)[0]])
      .attr('data-target-segment', d => segment_map_full_gn[separatePair(d)[1]])
      .attr('data-pdbs', d => Object.keys(interactions[d]))
      .attrs((d) => {
        let n1 = 0;
        let n2 = 0;

        if (d in data1.interactions) {
          n1 = Object.keys(data1.interactions[d]).length;
        }

        if (d in data2.interactions) {
          n2 = Object.keys(data2.interactions[d]).length;
        }

        if (d in data1.interactions || d in data2.interactions) {
          const f1 = n1 / data1.pdbs.length;
          const f2 = n2 / data2.pdbs.length;
          const fDiff = n1 / data1.pdbs.length - n2 / data2.pdbs.length;

          return {
            'data-frequency-diff': fDiff,
            'data-group-1-num-ints': n1,
            'data-group-2-num-ints': n2,
            'data-group-1-num-pdbs': data1.pdbs.length,
            'data-group-2-num-pdbs': data2.pdbs.length,
            'data-group-1-freq': f1.toFixed(2),
            'data-group-2-freq': f2.toFixed(2),
          };
        }
      })
      .style('stroke', (d) => {
        let n1 = 0;
        let n2 = 0;

        if (d in data1.interactions) {
          n1 = Object.keys(data1.interactions[d]).length;
        }

        if (d in data2.interactions) {
          n2 = Object.keys(data2.interactions[d]).length;
        }

        if (d in data1.interactions || d in data2.interactions) {
          const f1 = n1 / data1.pdbs.length;
          const f2 = n2 / data2.pdbs.length;
          const fDiff = n1 / data1.pdbs.length - n2 / data2.pdbs.length;
          let rgb;

          if (fDiff <= 0) {
            // If fDiff is close to -1, we want a red color
            rgb = { r: 255, g: 255 - 255 * -fDiff, b: 255 - 255 * -fDiff };
          } else {
            // If fDiff is close to 1 we want a blue color
            rgb = { r: 255 - 255 * fDiff, g: 255 - 255 * fDiff, b: 255 };
          }
          return `rgb(${[rgb.r, rgb.g, rgb.b].join(',')})`;
        }
      })
      .style('stroke-width', '2')
      .on('mouseover', function (d) {
        d3.select(this).classed('highlighted', true);

        const coord = getCoordPair(d);

        const xPosition = (coord.sourceX + coord.targetX) / 2;
        const yPosition = (coord.sourceY + coord.targetY) / 2 + 20;

        // Update the tooltip position and value
        svg
          .append('text')
          .attr('id', 'tooltip')
          .attr('x', xPosition)
          .attr('y', yPosition)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('fill', 'blue')
          .text($(this).data('pdbs'));

        // TODO use jQuery UI
        // $(this).tooltip({
        //   container: containerSelector,
        //   placement: 'top',
        //   delay: 0,
        //   html: true,
        //   title: 'demo',
        // });
      })
      .on('mouseout', function (d) {
        d3.select(this).classed('highlighted', false);
        d3.select('#tooltip').remove();
      });
  }

  function repositionSegment(segment) {
    if (segment !== 'TM1') {
      let gradientSum = 0;
      let contactCount = 0;

      $(`path[data-target-segment='${segment}']`).each((i, path) => {
        const d = path.getAttribute('d');

        const regex = /M (.+) (.+) L (.+) (.+)/;
        const matches = regex.exec(d);

        const gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

        gradientSum += gradient;
        contactCount += 1;
      });

      const gradientMean = gradientSum / contactCount;
      const shiftY = gradientMean * colSpace;

      // console.log(-gradientMean);

      // Reposition each node
      $(`g.node[data-segment='${segment}'`).each((i, g) => {
        const transformValue = g.getAttribute('transform');

        const regex = /\((.+),(.+)\)/;
        const matches = regex.exec(transformValue);

        const x = matches[1];
        const y = matches[2] - shiftY;

        g.setAttribute('transform', `translate(${x},${y})`);
      });

      // Reposition the edges TERMINATING at the repositioned nodes
      $(`path[data-target-segment='${segment}']`).each((i, path) => {
        const d = path.getAttribute('d');

        const regex = /M (.+) (.+) L (.+) (.+)/;
        const matches = regex.exec(d);

        const newTargetY = matches[4] - shiftY;

        path.setAttribute('d', `M ${matches[1]} ${matches[2]} L ${matches[3]} ${newTargetY}`);
      });

      // Reposition the edges ORIGINATING at the repositioned nodes
      $(`path[data-source-segment='${segment}']`).each((i, path) => {
        const d = path.getAttribute('d');

        const regex = /M (.+) (.+) L (.+) (.+)/;
        const matches = regex.exec(d);

        const newSourceY = matches[2] - shiftY;

        path.setAttribute('d', `M ${matches[1]} ${newSourceY} L ${matches[3]} ${matches[4]}`);
      });
    }
  }

  let run = 0;

  while (config.isContiguousPlot && run < 10) {
    // Reposition the helices by minimizing the sum of gradients of contacts
    segmentList.forEach(s => repositionSegment(s));
    // console.log('=================');
    run += 1;
  }

  // if (config.isContiguousPlot) {
  //   console.log('^^^^^^^^^^^^^^^^^');
  //   console.log('Gradient Before');
  //   console.log('=================');
  //   console.log('Gradient After');
  //   console.log('vvvvvvvvvvvvvvvvv');

  //   segmentList.forEach((segment) => {
  //     if (segment !== 'TM1') {
  //       let gradientSum = 0;
  //       let contactCount = 0;

  //       $(`path[data-target-segment='${segment}']`).each((i, path) => {
  //         const d = path.getAttribute('d');

  //         const regex = /M (.+) (.+) L (.+) (.+)/;
  //         const matches = regex.exec(d);

  //         const gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

  //         gradientSum += gradient;
  //         contactCount += 1;
  //       });

  //       const gradientMean = gradientSum / contactCount;
  //       console.log(-gradientMean);
  //     }
  //   });
  // }

  function getCoordPair(pair) {
    const AAs = separatePair(pair);
    const coordSourceAA = getCoordAA(AAs[0]);
    const coordTargetAA = getCoordAA(AAs[1]);

    if (config.isContiguousPlot) {
      return {
        sourceY: parseFloat(coordSourceAA.y) + rectHeight / 2,
        sourceX: parseFloat(coordSourceAA.x) + rectWidth,
        targetX: parseFloat(coordTargetAA.x),
        targetY: parseFloat(coordTargetAA.y) + rectHeight / 2,
      };
    }
    return {
      sourceY: parseFloat(coordSourceAA.y) + rectHeight / 2,
      sourceX: parseFloat(coordSourceAA.x),
      targetX: parseFloat(coordTargetAA.x) + rectWidth,
      targetY: parseFloat(coordTargetAA.y) + rectHeight / 2,
    };
  }

  function isContiguous(segment1, segment2) {
    const regex = /[TMH]+([0-9])/;

    if (!regex.exec(segment1) || !regex.exec(segment2)) {
      return false;
    }
    const segNo1 = regex.exec(segment1)[1];
    const segNo2 = regex.exec(segment2)[1];

    if (segNo2 - segNo1 === 1) {
      return true;
    }
    return false;
  }

  function isNonContiguous(segment1, segment2) {
    const regex = /[TMH]+([0-9])/;

    if (!regex.exec(segment1) || !regex.exec(segment2)) {
      return false;
    }
    const segNo1 = regex.exec(segment1)[1];
    const segNo2 = regex.exec(segment2)[1];

    const nonContiguousPairs = {
      1: [2, 8],
      2: [1, 7],
      3: [6, 7],
      4: [5],
      5: [4],
      6: [3, 4],
      7: [2, 3, 8],
      8: [1, 7],
    };

    if (nonContiguousPairs[segNo1].indexOf(+segNo2) > -1) {
      return true;
    }

    return false;
  }

  function getCoordAA(aa) {
    const translate = d3.select(`.aa-${aa}`).attr('transform');

    const regex = /(-?[0-9]+),(-?[0-9]+)/;

    const matches = regex.exec(translate);

    return {
      x: matches[1],
      y: matches[2],
    };
  }

  function separatePair(stringPair) {
    const regex = /([0-9x]+),([0-9x]+)/;

    const matches = regex.exec(stringPair);

    return [matches[1], matches[2]];
  }

  function createLegendSingleCrystal() {
    let interactionTypes = new Set();

    $(`${containerSelector} .edge`).each(function () {
      const friendlyName = getFriendlyInteractionName($(this).data('interaction-type'));
      interactionTypes.add(friendlyName);
    });

    // Add interactions color legend
    let legendHtml = '<ul>';

    interactionTypes = Array.from(interactionTypes).sort((i1, i2) => getInteractionStrength(i2) - getInteractionStrength(i1));

    interactionTypes.forEach((i) => {
      const rgb = getInteractionColor(i);
      legendHtml =
        `${legendHtml}<li>` +
        `<div class="color-box" style="background-color: ${rgb2hex(rgb.r, rgb.g, rgb.b)}">` +
        `<input type="checkbox" data-interaction-type="${i.replace(/ /g, '-')}"></input>` +
        `</div><p>${i}</p>` +
        '</li>';
    });
    legendHtml += '</ul>';

    // Add SVG download button
    legendHtml +=
      `<button onclick="downloadSVG('${containerSelector}schematic', 'interactions.svg')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">` +
      '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
      '</button>';

    // Add CSV download button
    legendHtml +=
      `<br /><button onclick="downloadSingleCrystalCSV('${containerSelector}schematic', 'interactions.csv')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV` +
      '</button>';

    $(`${containerSelector} .schematic-legend`).append(legendHtml);

    $(`${containerSelector} .schematic-legend input[type=checkbox]`).each(function () {
      $(this).prop('checked', true);
      $(this).change(function () {
        const interactionType = $(this).data('interaction-type');
        const paths = $(`${containerSelector} path.${interactionType}`);

        if ($(this).is(':checked')) {
          paths.show();
        } else {
          paths.hide();
        }
      });
    });
  }

  function createLegendSingleCrystalGroup() {
    // Populate schematic legend
    let legendHtml =
      `${'<h4 class="center">Interaction count</h4>' +
        '<p>From: <span class="min-value">0</span></p>' +
        '<input class="min-interactions-range" type="range" min="0" max="'}${
        data.pdbs.length
      }" value="0" step="1" />` +
      '<div class="temperature-scale">' +
      '<span class="white-to-red"></span>' +
      '</div>' +
      `<p>To: <span class="max-value">${data.pdbs.length}</span></p>` +
      `<input class="max-interactions-range" type="range" min="0" max="${
        data.pdbs.length
      }" value="${data.pdbs.length}" step="1" />` +
      '<div class="temperature-scale">' +
      '<span class="white-to-red"></span>' +
      '</div>';

    // Add SVG download button
    legendHtml +=
      `<button onclick="downloadSVG('${containerSelector} .schematic', 'interactions.svg')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">` +
      '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
      '</button>';

    // Add CSV download button
    legendHtml +=
      `<br /><button onclick="downloadSingleCrystalGroupCSV('${containerSelector} .schematic', 'interactions.csv')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV` +
      '</button>';

    $(`${containerSelector} .schematic-legend`).append(legendHtml);

    function getRangeChangeFunction() {
      return function () {
        const tMin = $(`${containerSelector} .schematic-legend .min-interactions-range`).val();
        const tMax = $(`${containerSelector} .schematic-legend .max-interactions-range`).val();

        $(`${containerSelector} .schematic-legend .min-value`).html(tMin);
        $(`${containerSelector} .schematic-legend .max-value`).html(tMax);

        // Hide all below min treshold
        $(`${containerSelector} .edge`).each(function () {
          const n = $(this).data('num-interactions');
          if (n < tMin || tMax < n) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      };
    }

    $(`${containerSelector} .schematic-legend .min-interactions-range`).change(getRangeChangeFunction());

    $(`${containerSelector} .schematic-legend .max-interactions-range`).change(getRangeChangeFunction());
  }

  function createLegendTwoCrystalGroups() {
    // Populate heatmap legend
    let legendHtml =
      '<h4 class="center">Frequency</h4>' +
      '<p>From: <span class="min-value">-1</span></p>' +
      '<input class="min-interactions-range" type="range" min="-1" max="1" value="-1" step="0.01" />' +
      '<div class="temperature-scale">' +
      '<span class="red-to-white"></span>' +
      '<span class="white-to-blue"></span>' +
      '</div>' +
      '<p>To: <span class="max-value">1</span></p>' +
      '<input class="max-interactions-range" type="range" min="-1" max="1" value="1" step="0.01" />' +
      '<div class="temperature-scale">' +
      '<span class="red-to-white"></span>' +
      '<span class="white-to-blue"></span>' +
      '</div>';

    // Add SVG download button
    legendHtml +=
      `<button onclick="downloadSVG('${containerSelector} .schematic', 'interactions.svg')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">` +
      '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
      '</button>';

    // Add CSV download button
    legendHtml +=
      `<br /><button onclick="downloadTwoCrystalGroupsCSV('${containerSelector} .schematic', 'interactions.csv')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV` +
      '</button>';

    $(`${containerSelector} .schematic-legend`).append(legendHtml);

    function getRangeChangeFunction() {
      return function () {
        const tMin = $(`${containerSelector} .schematic-legend .min-interactions-range`).val();
        const tMax = $(`${containerSelector} .schematic-legend .max-interactions-range`).val();

        $(`${containerSelector} .schematic-legend .min-value`).html(tMin);
        $(`${containerSelector} .schematic-legend .max-value`).html(tMax);

        // Hide all below min treshold
        $(`${containerSelector} .edge`).each(function () {
          const f = $(this).data('frequency-diff');
          if (f <= tMin || tMax <= f) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      };
    }

    $(`${containerSelector} .schematic-legend .min-interactions-range`).change(getRangeChangeFunction());

    $(`${containerSelector} .schematic-legend .max-interactions-range`).change(getRangeChangeFunction());
  }
}
