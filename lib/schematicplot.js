'use strict';

function createSchematicPlot(data, containerSelector, options) {
  var config = {
    w: 1200, // Width of the circle
    h: 900, // Height of the circle
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    type: 'singleCrystal'
  };

  // Put all of the options into a variable called config
  if (typeof options !== 'undefined') {
    Object.keys(options).forEach(function (i) {
      if (typeof options[i] !== 'undefined') {
        config[i] = options[i];
      }
    });
  }

  var isGeneric = false;

  if (config.type !== 'singleCrystal') {
    isGeneric = true;
  }

  // Process the data
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  var interactions = data.interactions;
  var segment_map_full = data.segment_map_full;
  var segment_map_full_gn = data.segment_map_full_gn;
  var sequence_numbers = data.sequence_numbers;
  var aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
  var gen_map = data.generic_map;
  var gen_map_full = data.generic_map_full;
  var num_seq_numbers = Object.keys(data.sequence_numbers).length;

  // Compute segment offsets
  var i = void 0;

  var segments = [];

  var seg = void 0;
  var prevSeg = isGeneric ? segment_map_full_gn[sequence_numbers[0]] : segment_map_full[sequence_numbers[0]];
  var seqStart = 0;

  for (i = 0; i < num_seq_numbers; i++) {
    seg = isGeneric ? segment_map_full_gn[sequence_numbers[i]] : segment_map_full[sequence_numbers[i]];

    if (seg === prevSeg) {
      continue;
    }

    segments.push({
      seg: prevSeg,
      start: seqStart,
      end: i - 1
    });

    seqStart = i;
    prevSeg = seg;
  }

  // Push last segment
  segments.push({
    seg: prevSeg,
    start: seqStart,
    end: i - 1
  });

  var segmentList = [
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
  'TM7', 'H8'];

  // Remove whatever chart with the same id/class was present before
  d3.select(containerSelector).select('svg').remove();

  // Initiate the SVG
  var svg = d3.select(containerSelector).append('svg').attr('width', config.w + config.margin.left + config.margin.right).attr('height', config.h + config.margin.top + config.margin.bottom).attr('class', 'schematic2d');

  // Draw Reisues
  var oldCol = 0;
  var oldI = 0;
  var offset = 0;
  var colSpace = 120;

  var rectWidth = 30;
  var rectHeight = 14;

  var g = svg.selectAll('g').data(isGeneric ? Object.keys(segment_map_full_gn) : Object.keys(segment_map_full)).enter().append('g').attr('class', function (d) {
    return 'node aa-' + d;
  }).attr('data-aa', function (d) {
    return d;
  }).attr('data-segment', function (d) {
    return isGeneric ? segment_map_full_gn[d] : segment_map_full[d];
  }).attr('transform', function (d, i) {
    var col = segmentList.indexOf(isGeneric ? segment_map_full_gn[d] : segment_map_full[d]);

    var height = rectHeight + 1;
    var x = colSpace * col;

    if (oldCol !== col) {
      oldI = i - 1;
    }

    var y = void 0;
    if (col % 2 === 0) {
      y = (i - oldI) * height;
    } else {
      y = 700 - (i - oldI) * height;
    }

    oldCol = col;

    return 'translate(' + x + ',' + y + ')';
  });

  g.append('rect').attr('width', rectWidth).attr('height', rectHeight).style('fill', 'white').style('stroke', 'black');

  g.append('text').attr('x', rectWidth / 2).attr('y', rectHeight - 3).attr('font-size', 10).attr('text-anchor', 'middle').text(function (d) {
    return isGeneric ? d : gen_map_full[d];
  });

  // Draw contact lines
  var interactionsList = [];

  if (isGeneric) {
    Object.keys(interactions).forEach(function (interaction) {
      var pair = separatePair(interaction);
      if (pair[0] in segment_map_full_gn && pair[1] in segment_map_full_gn) {
        if (isContiguous(segment_map_full_gn[pair[0]], segment_map_full_gn[pair[1]])) {
          getInteractionTypesFromPdbObject(Object.values(interactions[interaction])).forEach(function (interactionType) {
            var d = {
              pair: interaction,
              interactionType: interactionType
            };
            interactionsList.push(d);
          });
        }
      }
    });
  } else {
    Object.keys(interactions).forEach(function (interaction) {
      var pair = separatePair(interaction);
      if (pair[0] in segment_map_full && pair[1] in segment_map_full) {
        if (isContiguous(segment_map_full[pair[0]], segment_map_full[pair[1]])) {
          getInteractionTypesFromPdbObject(Object.values(interactions[interaction])).forEach(function (interactionType) {
            var d = {
              pair: interaction,
              interactionType: interactionType
            };
            interactionsList.push(d);
          });
        }
      }
    });
  }

  if (isGeneric) {
    svg.append('g').selectAll('path').data(Object.keys(interactions)).enter().append('path').filter(function (d) {
      var pair = separatePair(d);
      if (pair[0] in segment_map_full_gn && pair[1] in segment_map_full_gn) {
        if (isContiguous(segment_map_full_gn[pair[0]], segment_map_full_gn[pair[1]])) {
          return d;
        }
      }
    }).attr('d', function (d) {
      var coord = getCoordPair(d);
      return 'M ' + coord.sourceX + ' ' + coord.sourceY + ' L ' + coord.targetX + ' ' + coord.targetY;
    }).attr('data-source-segment', function (d) {
      return segment_map_full_gn[separatePair(d)[0]];
    }).attr('data-target-segment', function (d) {
      return segment_map_full_gn[separatePair(d)[1]];
    }).attr('data-pdbs', function (d) {
      return Object.keys(interactions[d]);
    }).attr('data-num-interactions', function (d) {
      var nInteractions = Object.keys(interactions[d]).length;
      return nInteractions;
    }).style('stroke', function (d) {
      var nInteractions = Object.keys(interactions[d]).length;
      var frequency = nInteractions / data.pdbs.length;
      return d3.interpolateReds(frequency / 1.5);
    }).style('stroke-width', '2').style('opacity', '0.6').attr('class', function (d) {
      return 'edge edge-' + d;
    }).on('mouseover', function (d) {
      d3.select(this).classed('highlighted', true);

      var coord = getCoordPair(d);

      var xPosition = (coord.sourceX + coord.targetX) / 2;
      var yPosition = (coord.sourceY + coord.targetY) / 2 + 20;

      // Update the tooltip position and value
      svg.append('text').attr('id', 'tooltip').attr('x', xPosition).attr('y', yPosition).attr('text-anchor', 'middle').attr('font-family', 'sans-serif').attr('font-size', '11px').attr('font-weight', 'bold').attr('fill', 'blue').text($(this).data('pdbs'));

      // TODO use jQuery UI
      // $(this).tooltip({
      //   container: containerSelector,
      //   placement: 'top',
      //   delay: 0,
      //   html: true,
      //   title: 'demo',
      // });
    }).on('mouseout', function (d) {
      d3.select(this).classed('highlighted', false);
      d3.select('#tooltip').remove();
    });
  } else {
    svg.append('g').selectAll('path').data(interactionsList).enter().append('path').attr('d', function (d) {
      var coord = getCoordPair(d.pair);
      return 'M ' + coord.sourceX + ' ' + coord.sourceY + ' L ' + coord.targetX + ' ' + coord.targetY;
    }).attr('data-source-segment', function (d) {
      return segment_map_full[separatePair(d.pair)[0]];
    }).attr('data-target-segment', function (d) {
      return segment_map_full[separatePair(d.pair)[1]];
    }).attr('data-interaction-type', function (d) {
      return d.interactionType;
    }).style('stroke', function (d) {
      var rgb = getInteractionColor(d.interactionType);
      var hex = rgb2hex(rgb.r, rgb.g, rgb.b);
      return hex;
    }).style('stroke-width', '3').style('opacity', '0.6').attr('class', function (d) {
      return getFriendlyInteractionName(d.interactionType).replace(/ /g, '-') + ' edge edge-' + d.pair;
    });
  }

  var run = 0;

  while (run < 10) {
    // Reposition the helices by minimizing the sum of gradients of contacts
    segmentList.forEach(function (segment) {
      if (segment !== 'TM1') {
        var gradientSum = 0;
        var contactCount = 0;

        $('path[data-target-segment=\'' + segment + '\']').each(function (i, path) {
          var d = path.getAttribute('d');

          var regex = /M (.+) (.+) L (.+) (.+)/;
          var matches = regex.exec(d);

          var gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

          gradientSum += gradient;
          contactCount += 1;
        });

        var gradientMean = gradientSum / contactCount;
        var shiftY = gradientMean * colSpace;

        console.log(-gradientMean);

        // Reposition each node
        $('g.node[data-segment=\'' + segment + '\'').each(function (i, g) {
          var transformValue = g.getAttribute('transform');

          var regex = /\((.+),(.+)\)/;
          var matches = regex.exec(transformValue);

          var x = matches[1];
          var y = matches[2] - shiftY;

          g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        });

        // Reposition the edges TERMINATING at the repositioned nodes
        $('path[data-target-segment=\'' + segment + '\']').each(function (i, path) {
          var d = path.getAttribute('d');

          var regex = /M (.+) (.+) L (.+) (.+)/;
          var matches = regex.exec(d);

          var newTargetY = matches[4] - shiftY;

          path.setAttribute('d', 'M ' + matches[1] + ' ' + matches[2] + ' L ' + matches[3] + ' ' + newTargetY);
        });

        // Reposition the edges ORIGINATING at the repositioned nodes
        $('path[data-source-segment=\'' + segment + '\']').each(function (i, path) {
          var d = path.getAttribute('d');

          var regex = /M (.+) (.+) L (.+) (.+)/;
          var matches = regex.exec(d);

          var newSourceY = matches[2] - shiftY;

          path.setAttribute('d', 'M ' + matches[1] + ' ' + newSourceY + ' L ' + matches[3] + ' ' + matches[4]);
        });
      }
    });
    console.log('=================');
    run += 1;
  }

  console.log('^^^^^^^^^^^^^^^^^');
  console.log('Gradient Before');
  console.log('=================');
  console.log('Gradient After');
  console.log('vvvvvvvvvvvvvvvvv');

  segmentList.forEach(function (segment) {
    if (segment !== 'TM1') {
      var gradientSum = 0;
      var contactCount = 0;

      $('path[data-target-segment=\'' + segment + '\']').each(function (i, path) {
        var d = path.getAttribute('d');

        var regex = /M (.+) (.+) L (.+) (.+)/;
        var matches = regex.exec(d);

        var gradient = (matches[4] - matches[2]) / (matches[3] - matches[1]);

        gradientSum += gradient;
        contactCount += 1;
      });

      var gradientMean = gradientSum / contactCount;
      console.log(-gradientMean);
    }
  });

  function getCoordPair(pair) {
    var AAs = separatePair(pair);
    var coordSourceAA = getCoordAA(AAs[0]);
    var coordTargetAA = getCoordAA(AAs[1]);

    return {
      sourceY: parseFloat(coordSourceAA.y) + rectHeight / 2,
      sourceX: parseFloat(coordSourceAA.x) + rectWidth,
      targetX: parseFloat(coordTargetAA.x),
      targetY: parseFloat(coordTargetAA.y) + rectHeight / 2
    };
  }

  function isContiguous(segment1, segment2) {
    var regex = /[TMH]+([0-9])/;

    if (!regex.exec(segment1) || !regex.exec(segment2)) {
      return false;
    }
    var segNo1 = regex.exec(segment1)[1];
    var segNo2 = regex.exec(segment2)[1];

    if (segNo2 - segNo1 === 1) {
      return true;
    }
    return false;
  }

  function getCoordAA(aa) {
    var translate = d3.select('.aa-' + aa).attr('transform');

    var regex = /(-?[0-9]+),(-?[0-9]+)/;

    var matches = regex.exec(translate);

    return { x: matches[1], y: matches[2] };
  }

  function separatePair(stringPair) {
    var regex = /([0-9x]+),([0-9x]+)/;

    var matches = regex.exec(stringPair);

    return [matches[1], matches[2]];
  }

  // Create Legend

  if (isGeneric) {
    var getRangeChangeFunction = function getRangeChangeFunction() {
      return function () {
        var tMin = $(containerSelector + ' .schematic-legend .min-interactions-range').val();
        var tMax = $(containerSelector + ' .schematic-legend .max-interactions-range').val();

        $(containerSelector + ' .schematic-legend .min-value').html(tMin);
        $(containerSelector + ' .schematic-legend .max-value').html(tMax);

        // Hide all below min treshold
        $(containerSelector + ' .edge').each(function () {
          var n = $(this).data('num-interactions');
          if (n < tMin || tMax < n) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      };
    };

    // Populate schematic legend
    var legendHtml = '' + ('<h4 class="center">Interaction count</h4>' + '<p>From: <span class="min-value">0</span></p>' + '<input class="min-interactions-range" type="range" min="0" max="') + data.pdbs.length + '" value="0" step="1" />' + '<div class="temperature-scale">' + '<span class="white-to-red"></span>' + '</div>' + ('<p>To: <span class="max-value">' + data.pdbs.length + '</span></p>') + ('<input class="max-interactions-range" type="range" min="0" max="' + data.pdbs.length + '" value="' + data.pdbs.length + '" step="1" />') + '<div class="temperature-scale">' + '<span class="white-to-red"></span>' + '</div>';

    // Add SVG download button
    legendHtml += '<button onclick="downloadSVG(\'' + containerSelector + ' .schematic\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' + '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' + '</button>';

    // Add CSV download button
    legendHtml += '<br /><button onclick="downloadSingleCrystalGroupCSV(\'' + containerSelector + ' .schematic\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' + '</button>';

    $(containerSelector + ' .schematic-legend').append(legendHtml);

    $(containerSelector + ' .schematic-legend .min-interactions-range').change(getRangeChangeFunction());

    $(containerSelector + ' .schematic-legend .max-interactions-range').change(getRangeChangeFunction());
  } else {
    // Populatschematic legend
    var interactionTypes = new Set();

    $(containerSelector + ' .edge').each(function () {
      var friendlyName = getFriendlyInteractionName($(this).data('interaction-type'));
      interactionTypes.add(friendlyName);
    });

    // Add interactions color legend
    var _legendHtml = '<ul>';

    interactionTypes = Array.from(interactionTypes).sort(function (i1, i2) {
      return getInteractionStrength(i2) - getInteractionStrength(i1);
    });

    interactionTypes.forEach(function (i) {
      var rgb = getInteractionColor(i);
      _legendHtml = _legendHtml + '<li>' + ('<div class="color-box" style="background-color: ' + rgb2hex(rgb.r, rgb.g, rgb.b) + '">') + ('<input type="checkbox" data-interaction-type="' + i.replace(/ /g, '-') + '"></input>') + ('</div><p>' + i + '</p>') + '</li>';
    });
    _legendHtml += '</ul>';

    // Add SVG download button
    _legendHtml += '<button onclick="downloadSVG(\'' + containerSelector + 'schematic\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' + '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' + '</button>';

    // Add CSV download button
    _legendHtml += '<br /><button onclick="downloadSingleCrystalCSV(\'' + containerSelector + 'schematic\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' + '</button>';

    $(containerSelector + ' .schematic-legend').append(_legendHtml);

    $(containerSelector + ' .schematic-legend input[type=checkbox]').each(function () {
      $(this).prop('checked', true);
      $(this).change(function () {
        var interactionType = $(this).data('interaction-type');
        var paths = $(containerSelector + ' path.' + interactionType);

        if ($(this).is(':checked')) {
          paths.show();
        } else {
          paths.hide();
        }
      });
    });
  }
}