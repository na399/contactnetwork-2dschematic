window.zoomHeatmap = {};

function toggleFullScreen(fullScreenElement) {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
        if (fullScreenElement.mozRequestFullScreen) {
            fullScreenElement.mozRequestFullScreen();
        } else {
            fullScreenElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else {
          document.webkitCancelFullScreen();
        }
    }
}

function hidePopovers() {
    $('.popover').each(function(){
        $(this).popover('hide');
    });
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgb2hex(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = '0' + r;

    if (g.length == 1)
        g = '0' + g;

    if (b.length == 1)
        b = '0' + b;

    return '#' + r + g + b;
}

function getInteractionStrength(i) {
    switch (i) { 
        case getFriendlyInteractionName('polarsidechainsidechaininteraction'):
        case getFriendlyInteractionName('polarbackbonesidechaininteraction'):
        case'polarsidechainsidechaininteraction':
        case'polarbackbonesidechaininteraction':
            return 4;
        case getFriendlyInteractionName('facetofaceinteraction'):
        case getFriendlyInteractionName('facetoedgeinteraction'):
        case getFriendlyInteractionName('picationinteraction'):
        case'facetofaceinteraction':
        case'facetoedgeinteraction':
        case'picationinteraction':
            return 3;
        case getFriendlyInteractionName('hydrophobicinteraction'):
        case'hydrophobicinteraction':
            return 2;
        case getFriendlyInteractionName('vanderwaalsinteraction'):
        case'vanderwaalsinteraction':
            return 1;
        default:
            return 0;
    }
}


function getStrongestInteractionType(interactions) {

    if ($.inArray('polarsidechainsidechaininteraction', interactions) > -1)
        return 'polarsidechainsidechaininteraction';

    if ($.inArray('polarbackbonesidechaininteraction', interactions) > -1)
        return 'polarbackbonesidechaininteraction';

    if ($.inArray('facetofaceinteraction', interactions) > -1)
        return 'facetofaceinteraction';

    if ($.inArray('facetoedgeinteraction', interactions) > -1)
        return 'facetoedgeinteraction';

    if ($.inArray('picationinteraction', interactions) > -1)
        return 'picationinteraction';

    if ($.inArray('hydrophobicinteraction', interactions) > -1)
        return 'hydrophobicinteraction';

    if ($.inArray('vanderwaalsinteraction', interactions) > -1)
        return 'vanderwaalsinteraction';

    return 'undefined';
}

function getStrongestInteractionTypeFromPdbObject(obj) {

    var interactions = [];

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var strongestInteraction = getStrongestInteractionType(obj[key]);
            interactions.push(strongestInteraction);
        }
    }

    return getStrongestInteractionType(interactions);
}

function getInteractionTypesFromPdbObject(obj) {

    var interactions = new Set();

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            for (var k in obj[key])
                interactions.add(obj[key][k]);
        }
    }

    // Sort according to strength
    interactions = Array.from(interactions);
    interactions.sort(function (i1, i2) {
        return  getInteractionStrength(i1) - getInteractionStrength(i2);
    });

    return interactions;
}


function getInteractionColor(interaction) {

    var r, g, b;

    switch (interaction) {
        case 'polarsidechainsidechaininteraction':
        case 'polarbackbonesidechaininteraction':
        case getFriendlyInteractionName('polarsidechainsidechaininteraction'):
        case getFriendlyInteractionName('polarbackbonesidechaininteraction'):
            // r = 215; g = 25; b = 28;
            r = 228; g = 26; b = 28;
            break;
        case 'facetofaceinteraction':
        case 'facetoedgeinteraction':
        case 'picationinteraction':
        case getFriendlyInteractionName('facetofaceinteraction'):
        case getFriendlyInteractionName('facetoedgeinteraction'):
        case getFriendlyInteractionName('picationinteraction'):
            // r = 253; g = 174; b = 97;
            r = 55; g = 126; b = 184;
            break;
        case 'hydrophobicinteraction':
        case getFriendlyInteractionName('hydrophobicinteraction'):
            // r = 171; g = 221; b = 164;
            r = 77; g = 175; b = 74;
            break;
        case 'vanderwaalsinteraction':
        case getFriendlyInteractionName('vanderwaalsinteraction'):
            // r = 43; g = 131; b = 186;
            r = 152; g = 78; b = 163;
            break;
        default:
            r = 0; g = 0; b = 0;
    }

    return { r: r, g: g, b: b };
}

function getFriendlyInteractionName(interaction) {
    switch (interaction) {
        case 'polarsidechainsidechaininteraction':
        case 'polarbackbonesidechaininteraction':
            return 'Polar';
        case 'facetofaceinteraction':
        case 'facetoedgeinteraction':
        case 'picationinteraction':
            return 'Aromatic';
        case 'hydrophobicinteraction':
            return 'Hydrophobic';
        case 'vanderwaalsinteraction':
            return 'Van der Waals';
        default:
            return 'Unknown';
    }
}

function getSegmentColor(segmentName) {
    var r, g, b;

    switch (segmentName) {
        case 'N-term':
        case 'C-term':
            r = 190; g = 190; b = 190;
            //r = 255; g = 150; b = 150;
            break;
        case 'TM1':
        case 'TM2':
        case 'TM3':
        case 'TM4':
        case 'TM5':
        case 'TM6':
        case 'TM7':
        case 'H8':
            r = 230; g = 230; b = 230;
            //r = 150; g = 255; b = 150;
            break;
        case 'ECL1':
        case 'ECL2':
        case 'ECL3':
            r = 190; g = 190; b = 190;
            //r = 150; g = 150; b = 255;
            break;
        case 'ICL1':
        case 'ICL2':
        case 'ICL3':
            r = 190; g = 190; b = 190;
            //r = 150; g = 150; b = 255;
            break;
        default:
            r = 0; g = 0; b = 0;
    }

    return { r: r, g: g, b: b };
}

function getAminoAcidOneLetterCode(threeLetterCode) {
    switch (threeLetterCode.toUpperCase()) {
        case 'ALA': 
            return 'A'; 
        case 'ARG': 
            return 'R'; 
        case 'ASN': 
            return 'N'; 
        case 'ASP': 
            return 'D';
        case 'CYS': 
            return 'C'; 
        case 'GLN': 
            return 'Q'; 
        case 'GLU': 
            return 'E'; 
        case 'GLY': 
            return 'G';
        case 'HIS': 
            return 'H'; 
        case 'ILE': 
            return 'I'; 
        case 'LEU': 
            return 'L'; 
        case 'LYS': 
            return 'K';
        case 'MET': 
            return 'M'; 
        case 'PHE': 
            return 'F'; 
        case 'PRO': 
            return 'P'; 
        case 'SER': 
            return 'S';
        case 'THR': 
            return 'T'; 
        case 'TRP': 
            return 'W'; 
        case 'TYR': 
            return 'Y'; 
        case 'VAL': 
            return 'V';
        default:
            return null;
    }
}

function downloadSVG(svgSelector, name) {
  var svgClone = $(svgSelector).clone();
  svgClone.find('.svg-pan-zoom_viewport').attr('transform', 'matrix(2.2,0,0,2.2,295,140)');
  
  var escapedSVG = new XMLSerializer().serializeToString(svgClone.get(0));

  downloadURI('data:image/svg+xml;base64,' + window.btoa(escapedSVG), name);
}

function downloadSingleCrystalCSV(singleCrystalSvgSelector, name) {
    var data = [];
    var header = ['Residue number 1', 'Residue number 2', 'Segment 1', 'Segment 2',  'Generic number 1', 'Generic number 2', 'Amino acid 1', 'Amino acid 2', 'Interaction type'];
    data.push(header);

    $(singleCrystalSvgSelector + ' rect[data-interaction-type]').each(function(e) {
      var rect = $(this);
      var resNo1 = rect.data('res-no-1');
      var resNo2 = rect.data('res-no-2');
      var seg1 = rect.data('seg-1');
      var seg2 = rect.data('seg-2');
      var genNo1 = rect.data('gen-no-1');
      var genNo2 = rect.data('gen-no-2');
      var aa1 = rect.data('aa-1');
      var aa2 = rect.data('aa-2');
      var iType = rect.data('interaction-type');
      data.push([resNo1, resNo2, seg1, seg2, genNo1, genNo2, aa1, aa2, iType]);
    });

    // Convert to CSV
    var csv = Papa.unparse(data);

    // Download file
    downloadURI('data:text/csv;charset=UTF-8,' + encodeURI(csv), name);
}

function downloadSingleCrystalGroupCSV(singleGroupSvgSelector, name) {
    var data = [];
    var header = ['Generic number 1', 'Generic number 2', 'Segment 1', 'Segment 2', 'Frequency',  'Number of interactions', 'Number of crystals'];
    data.push(header);

    $(singleGroupSvgSelector + ' rect[data-frequency]').each(function(e) {
      var rect = $(this);
      var genNo1 = rect.data('gen-no-1');
      var genNo2 = rect.data('gen-no-2');
      var seg1 = rect.data('seg-1');
      var seg2 = rect.data('seg-2');
      var nInteractions = rect.data('num-interactions');
      var nTotalInteractions = rect.data('total-possible-interactions');
      var frequency = rect.data('frequency');
      data.push([genNo1, genNo2, seg1, seg2, nInteractions, nTotalInteractions, frequency]);
    });

    // Convert to CSV
    var csv = Papa.unparse(data);

    // Download file
    downloadURI('data:text/csv;charset=UTF-8,' + encodeURI(csv), name);
}

function downloadTwoCrystalGroupsCSV(twoGroupsSvgSelector, name) {
    var data = [];
    var header = ['Generic number 1', 'Generic number 2', 'Segment 1', 'Segment 2', 'Interactions group 1', 'Interactions group 2', 'Crystals group 1', 'Crystals group 2', 'Frequency group 1', 'Frequency group 2', 'Frequency Difference'];
    data.push(header);

    $(twoGroupsSvgSelector + ' rect[data-frequency-diff]').each(function(e) {
      var rect = $(this);
      var genNo1 = rect.data('gen-no-1');
      var genNo2 = rect.data('gen-no-2');
      var seg1 = rect.data('seg-1');
      var seg2 = rect.data('seg-2');
      var numIntsGroup1 = rect.data('group-1-num-ints');
      var numIntsGroup2 = rect.data('group-2-num-ints');
      var numPdbsGroup1 = rect.data('group-1-num-pdbs');
      var numPdbsGroup2 = rect.data('group-2-num-pdbs');
      var freqGroup1 = rect.data('group-1-freq');
      var freqGroup2 = rect.data('group-2-freq');
      var fDiff = rect.data('frequency-diff').toFixed(2);
      data.push([genNo1, genNo2, seg1, seg2, numIntsGroup1, numIntsGroup2, numPdbsGroup1, numPdbsGroup2, freqGroup1, freqGroup2, fDiff]);
    });

    // Convert to CSV
    var csv = Papa.unparse(data);

    // Download file
    downloadURI('data:text/csv;charset=UTF-8,' + encodeURI(csv), name);
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function renderSingleCrystalHeatmap(data, heatMapSelector) {

    // Destroy old zoom on heatmap
    if (window.zoomHeatmap[heatMapSelector] != null) {
        window.zoomHeatmap[heatMapSelector].destroy();
        delete window.zoomHeatmap[heatMapSelector];
    }

    // Destroy old legend content
    $(heatMapSelector + ' .heatmap-legend').empty();

    // Destroy all previous contents
    $(heatMapSelector + ' .heatmap').empty();
    var heatmap = Snap(heatMapSelector + ' .heatmap');

    // Draw heatmap
    var interactions = data.interactions;
    var segment_map = data.segment_map;
    var sequence_numbers = data.sequence_numbers;
    var aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
    var gen_map = data.generic_map;
    var num_seq_numbers = Object.keys(data.sequence_numbers).length;

    x = 0; wi = num_seq_numbers;
    y = 0; hi = num_seq_numbers;

    heatmap.attr({viewBox:[x,y,wi,hi].join(',')});
    heatmap.attr({viewBox:[x,y,wi,hi].join(' ')});

    // Contains all labels
    var labelGroup = heatmap.g();

    // Contains all labels
    var contentGroup = heatmap.g();

    // Compute segment offsets
    var i;

    var segments = [];

    var seg, prevSeg = segment_map[sequence_numbers[0]];
    var seqStart = 0;

    for (i = 0; i < num_seq_numbers; i++) {
        seg = segment_map[sequence_numbers[i]];

        if (seg === prevSeg) {
            continue;
        }

        segments.push({
            seg: prevSeg,
            start: seqStart,
            end: i-1
        });

        seqStart = i;
        prevSeg = seg;
    }

    // Push last segment
    segments.push({
        seg: prevSeg,
        start: seqStart,
        end: i-1
    });

    // Draw segments
    segments.forEach(function(s) {
        var rgb = getSegmentColor(s.seg);

        // Place the segments vertically.
        var cell = heatmap.rect(s.start, 0, s.end - s.start + 1, num_seq_numbers);
        var line = heatmap.line(s.start, 0, s.start, num_seq_numbers);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });

        // Add text
        var label = heatmap.text(s.start + (s.end - s.start + 1)/2 - 6, 9 + cell.getBBox().height, s.seg);

        label.attr({
            'text-anchor': 'start',
            'font-size': 5
        });

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);

        label.transform("r270s-1,1");
    });

    segments.forEach(function(s) {
        rgb = getSegmentColor(s.seg);

        // Place the segments horizontally.
        cell = heatmap.rect(0, s.start, num_seq_numbers, s.end - s.start + 1);
        line = heatmap.line(0, s.end+1, num_seq_numbers, s.end+1);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });

        var label = heatmap.text(-2, s.start + (s.end - s.start + 1)/2, s.seg);

        label.attr({
            'text-anchor': 'end',
            'font-size': 5,
            'alignment-baseline': 'middle'
        });

        label.transform("r180s-1,1");

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);
    });


    // Draw cells
    for (i = 0; i < num_seq_numbers; i++) {
        for (var j = 0; j < num_seq_numbers; j++) {
            // Get the sequence numbers
            var seq_i = data.sequence_numbers[i];
            var seq_j = data.sequence_numbers[j];

            // Only draw if an interaction exists
            var num = seq_i + "," + seq_j;

            if (num in interactions) {
                var cells = [];
                // Get all interactions at a given coordinate
                getInteractionTypesFromPdbObject(interactions[num]).forEach(function(interaction) {
                    var rgb = getInteractionColor(interaction);
                    var cell = heatmap.rect(i, j, 1, 1);

                    var interactionsString = getInteractionTypesFromPdbObject(interactions[num]).map(getFriendlyInteractionName).filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    }).join(", ");

                    var content, title = 'Residues ' + aa_map[seq_i] + seq_i + '-' + aa_map[seq_j] + seq_j + '<br />'
                            + 'Interactions: ' + interactionsString + '<br />'
                            + 'Segments: ' + segment_map[seq_i] + ', ' + segment_map[seq_j] + '<br />';

                    // Add generic numbers where applicable
                    if (seq_i in gen_map) {
                        title += 'Res. 1 gen. no: ' + gen_map[seq_i] + '<br />';
                    }

                    if (seq_j in gen_map) {
                        title += 'Res. 2 gen. no: ' + gen_map[seq_j] + '<br />';
                    }

                    var genStrI = gen_map[seq_i];
                    var genStrJ = gen_map[seq_j];

                    if (typeof gen_map[seq_i] == 'undefined') {
                        genStrI = '-';
                    }

                    if (typeof gen_map[seq_j] == 'undefined') {
                        genStrJ = '-';
                    }

                    var popoverTable = '<table class="table">'
                    + '<thead>'
                    + '<tr>'
                    + '<th>Residue</th>'
                    + '<th>' + aa_map[seq_i] + seq_i + '</th>'
                    + '<th>' + aa_map[seq_j] + seq_j + '</th>'
                    + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                    + '<td>Segment</td>'
                    + '<td>' + segment_map[seq_i] + '</td>'
                    + '<td>' + segment_map[seq_j] + '</td>'
                    + '</tr>'
                    + '<tr>'
                    + '<td>Gen. no.</td>'
                    + '<td>' + genStrI + '</td>'
                    + '<td>' + genStrJ + '</td>'
                    + '</tr>'
                    + '</tbody>'
                    + '</table>'
                    + '<table class="table">'
                    + '<thead>'
                    + '<tr>'
                    + '<th>Interactions</th>'
                    + '</tr>'
                    + '<tr>'
                    + '</thead>'
                    + '<tbody>'
                    + '<tr>'
                    + '<td>' + interactionsString + '</td>'
                    + '</tr>'
                    + '</tbody>'
                    + '</table>'

                    var interactionId = 'single-i-' + num.replace(',','-');

                    // Create cell for interaction
                    cell.attr({
                        'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
                        'data-interaction-type': interaction,
                        'data-res-no-1': seq_i,
                        'data-res-no-2': seq_j,
                        'data-aa-1': aa_map[seq_i],
                        'data-aa-2': aa_map[seq_j],
                        'data-seg-1': segment_map[seq_i],
                        'data-seg-2': segment_map[seq_j],
                        'data-gen-no-1': genStrI,
                        'data-gen-no-2': genStrJ,
                        'class': 'heatmap-interaction' + ' ' + getFriendlyInteractionName(interaction).replace(/ /g,"-"),
                        'id': interactionId
                    });

                    contentGroup.add(cell);

                    // Add tooltip to cell
                    cell = $(heatMapSelector + ' rect.heatmap-interaction#' + interactionId);

                    cell.tooltip({
                        'container': heatMapSelector,
                        'placement': 'top',
                        'delay': 75,
                        'html': true,
                        'title': title
                    });

                    // Add popover to cells
                    cell.popover({
                        'container': heatMapSelector,
                        'placement': 'bottom',
                        'animation': true,
                        'html': true,
                        'title': 'Interactions at ' + aa_map[seq_i] + seq_i + ', ' + aa_map[seq_j] + seq_j,
                        'content': popoverTable,
                        'tabindex': '0'
                    });

                    cells.push(cell);
                });
            }
        }
    }

    // Add cover-up triangle
    var bbox = contentGroup.getBBox();
    contentGroup.add(heatmap.polygon([bbox.x, bbox.y, bbox.x2, bbox.y, bbox.x2, bbox.y2]).attr({ fill: "white" }));

    // Add bottom line
    var line = heatmap.line(bbox.x, bbox.y, bbox.x2, bbox.y2);
    line.attr({
        'stroke': "rgb(150,150,150)",
        'strokeWidth': "0.1"
    });
    contentGroup.add(line);

    // Rotate contents
    var g = heatmap.g();
    g.add(contentGroup);
    g.add(labelGroup);
    g.transform("r225s-1,1");


    // Populate heatmap legend
    var interactionTypes = new Set();

    $(heatMapSelector + ' .heatmap-interaction').each(function() {
        var friendlyName = getFriendlyInteractionName($(this).data('interaction-type'));
        interactionTypes.add(friendlyName);
    });

    // Add interactions color legend
    var legendHtml = '<ul>';

    interactionTypes = Array.from(interactionTypes).sort(function (i1, i2) {
        return getInteractionStrength(i2) - getInteractionStrength(i1);
    });

    interactionTypes.forEach(function(i) {
        var rgb = getInteractionColor(i);
        legendHtml = legendHtml
                + '<li>'
                + '<div class="color-box" style="background-color: ' + rgb2hex(rgb.r, rgb.g, rgb.b) + '">' + '<input type="checkbox" data-interaction-type="' + i.replace(/ /g,"-") +'"></input>' + '</div><p>' + i + '</p>'
                + '</li>';
    });
    legendHtml += '</ul>';

    // Add SVG download button
    legendHtml += '<button onclick="downloadSVG(\'' + heatMapSelector + ' .heatmap\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' +
                    '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
                  '</button>';

    // Add CSV download button
    legendHtml += '<br /><button onclick="downloadSingleCrystalCSV(\'' + heatMapSelector + ' .heatmap\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' +
      '</button>';

    $(heatMapSelector + ' .heatmap-legend').append(legendHtml);

    $(heatMapSelector + ' .heatmap-legend input[type=checkbox]').each(function() {
        $(this).prop('checked', true);
        $(this).change(function() {
            var interactionType = $(this).data('interaction-type');
            var rects = $(heatMapSelector + ' .heatmap rect.' + interactionType);
            if ($(this).is(':checked')) {
                rects.show();
            } else {
                rects.hide();
            }
        });
    });


    // Make zoomable
    window.zoomHeatmap[heatMapSelector] = svgPanZoom(heatMapSelector + ' .heatmap', {
        zoomEnabled: true,
        // controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.75,
        maxZoom: 50,
        zoomScaleSensitivity: 0.25,
        dblClickZoomEnabled: true,
        beforeZoom: hidePopovers,
        beforePan: hidePopovers
    });

    // Set initial zoom level
    window.zoomHeatmap[heatMapSelector].zoom(1);
    window.zoomHeatmap[heatMapSelector].pan({x: 325, y: 140});

    // Close popovers on clicking elsewhere
    $('html').on('mousedown', function(e) {
        if(!$(e.target).closest('.popover').length) {
            if ($(e.target).closest(heatMapSelector).length) {
                hidePopovers();
            }
        }
    });
}

function renderSingleCrystalGroupHeatmap(data, heatMapSelector) {

    // Destroy old zoom on heatmap
    if (window.zoomHeatmap[heatMapSelector] != null) {
        window.zoomHeatmap[heatMapSelector].destroy();
        delete window.zoomHeatmap[heatMapSelector];
    }

    // Destroy old legend content
    $(heatMapSelector + ' .heatmap-legend').empty();

    // Destroy all previous contents
    $(heatMapSelector + ' .heatmap').empty();
    var heatmap = Snap(heatMapSelector + ' .heatmap');

    // Draw heatmap
    var interactions = data.interactions;
    var segment_map = data.segment_map;
    var sequence_numbers = data.sequence_numbers;
    var num_seq_numbers = Object.keys(data.sequence_numbers).length;

    x = 0; wi = num_seq_numbers;
    y = 0; hi = num_seq_numbers;

    heatmap.attr({viewBox:[x,y,wi,hi].join(',')});
    heatmap.attr({viewBox:[x,y,wi,hi].join(' ')});

    // Contains all labels
    var labelGroup = heatmap.g();

    // Contains all content
    var contentGroup = heatmap.g();

    // Compute segment offsets
    var i;

    var segments = [];

    var seg, prevSeg = segment_map[sequence_numbers[0]];
    var seqStart = 0;

    for (i = 0; i < num_seq_numbers; i++) {
        seg = segment_map[sequence_numbers[i]];

        if (seg === prevSeg) {
            continue;
        }

        segments.push({
            seg: prevSeg,
            start: seqStart,
            end: i-1
        });

        seqStart = i;
        prevSeg = seg;
    }

    // Push last segment
    segments.push({
        seg: prevSeg,
        start: seqStart,
        end: i-1
    });

    // Draw segments
    segments.forEach(function(s) {
        var rgb = getSegmentColor(s.seg);

        // Place the segments vertically.
        var cell = heatmap.rect(s.start, 0, s.end - s.start + 1, num_seq_numbers);
        var line = heatmap.line(s.start, 0, s.start, num_seq_numbers);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });


        // Add text
        var label = heatmap.text(s.start + (s.end - s.start + 1)/2 - 6, 9 + cell.getBBox().height, s.seg);

        label.attr({
            'text-anchor': 'start',
            'font-size': 5
        });

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);

        label.transform("r270s-1,1");
    });

    segments.forEach(function(s) {
        rgb = getSegmentColor(s.seg);

        // Place the segments horizontally.
        cell = heatmap.rect(0, s.start, num_seq_numbers, s.end - s.start + 1);
        line = heatmap.line(0, s.end+1, num_seq_numbers, s.end+1);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });

        var label = heatmap.text(-2, s.start + (s.end - s.start + 1)/2, s.seg);

        label.attr({
            'text-anchor': 'end',
            'font-size': 5,
            'alignment-baseline': 'middle'
        });

        label.transform("r180s-1,1");

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);
    });

    // Draw cells
    for (i = 0; i < num_seq_numbers; i++) {
        for (var j = 0; j < num_seq_numbers; j++) {
            // Get the sequence numbers
            var seq_i = data.sequence_numbers[i];
            var seq_j = data.sequence_numbers[j];

            // Only draw if an interaction exists
            var num = seq_i + "," + seq_j;

            if (num in interactions) {
                // Get the strongest interaction.
                var nInteractions = Object.keys(interactions[num]).length;
                var frequency = nInteractions / data.pdbs.length;

                var rgb = { r: 255, g: 255-frequency*255, b: 255-frequency*255 };
                var cell = heatmap.rect(i, j, 1, 1);

                var title =  'Residues ' + seq_i + ', ' + seq_j + '<br />'
                        + 'Interaction count: ' + nInteractions + '<br />'
                        + segment_map[seq_i] + ', ' + segment_map[seq_j];

                var popoverTable = '<table class="table">'
                    + '<thead>'
                    + '<tr>'
                    + '<th>Residue #</th>'
                    + '<th>' + seq_i + '</th>'
                    + '<th>' + seq_j + '</th>'
                    + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                    + '<td>Segment</td>'
                    + '<td>' + segment_map[seq_i] + '</td>'
                    + '<td>' + segment_map[seq_j] + '</td>'
                    + '</tr>'
                    + '</tbody>'
                    + '</table>'
                    + 'Interaction count: ' + nInteractions + '<br />'
                    + 'Interaction frequency: ' + frequency.toFixed(2)

                cell.attr({
                    'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
                    'data-num-interactions': nInteractions,
                    'data-total-possible-interactions': data.pdbs.length,
                    'data-frequency': frequency,
                    'data-gen-no-1': seq_i,
                    'data-gen-no-2': seq_j,
                    'data-seg-1': segment_map[seq_i],
                    'data-seg-2': segment_map[seq_j],
                    'class': 'heatmap-interaction'
                });

                $(heatMapSelector + ' rect.heatmap-interaction').tooltip({
                    'container': heatMapSelector,
                    'placement': 'top',
                    'delay': 75,
                    'title': title,
                    'html': true
                });

                // Add popover to cells
                $(heatMapSelector + ' rect.heatmap-interaction').popover({
                    'container': heatMapSelector,
                    'placement': 'bottom',
                    'animation': true,
                    'html': true,
                    'title': 'Interactions at ' + seq_i + ', ' + seq_j,
                    'content': popoverTable,
                    'tabindex': '0'
                });

                contentGroup.add(cell);
            }
        }
    }

    // Add cover-up triangle
    var bbox = contentGroup.getBBox();
    contentGroup.add(heatmap.polygon([bbox.x, bbox.y, bbox.x2, bbox.y, bbox.x2, bbox.y2]).attr({ fill: "white" }));

    // Rotate contents
    var g = heatmap.g();
    g.add(contentGroup);
    g.add(labelGroup);
    g.transform("r225s-1,1");

    // Populate heatmap legend
    var legendHtml = '<h4 class="center">Interaction count</h4>'
        + '<p>From: <span class="min-value">0</span></p>'
        + '<input class="min-interactions-range" type="range" min="0" max="' + data.pdbs.length + '" value="0" step="1" />'
        + '<div class="temperature-scale">'
        + '<span class="white-to-red"></span>'
        + '</div>'
        + '<p>To: <span class="max-value">' + data.pdbs.length + '</span></p>'
        + '<input class="max-interactions-range" type="range" min="0" max="' + data.pdbs.length + '" value="' + data.pdbs.length + '" step="1" />'
        + '<div class="temperature-scale">'
        + '<span class="white-to-red"></span>'
        + '</div>';

    // Add SVG download button
    legendHtml += '<button onclick="downloadSVG(\'' + heatMapSelector + ' .heatmap\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' +
                    '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
                  '</button>';

    // Add CSV download button
    legendHtml += '<br /><button onclick="downloadSingleCrystalGroupCSV(\'' + heatMapSelector + ' .heatmap\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' +
      '</button>';


    $(heatMapSelector + ' .heatmap-legend').append(legendHtml); 

    function getRangeChangeFunction() {

        return function() {
            var tMin = $(heatMapSelector + ' .heatmap-legend .min-interactions-range').val();
            var tMax = $(heatMapSelector + ' .heatmap-legend .max-interactions-range').val();


            $(heatMapSelector + ' .heatmap-legend .min-value').html(tMin);
            $(heatMapSelector + ' .heatmap-legend .max-value').html(tMax    );

            // Hide all below min treshold
            $(heatMapSelector + ' rect').each(function() {
                var n = $(this).data("num-interactions");
                if (n < tMin || tMax < n) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    }

    $(heatMapSelector + ' .heatmap-legend .min-interactions-range').change(getRangeChangeFunction());

    $(heatMapSelector + ' .heatmap-legend .max-interactions-range').change(getRangeChangeFunction());

    // Make zoomable
    window.zoomHeatmap[heatMapSelector] = svgPanZoom(heatMapSelector + ' .heatmap', {
        zoomEnabled: true,
        // controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.75,
        maxZoom: 50,
        zoomScaleSensitivity: 0.25,
        dblClickZoomEnabled: true,
        beforeZoom: hidePopovers,
        beforePan: hidePopovers
    });

    // Set initial zoom level
    window.zoomHeatmap[heatMapSelector].zoom(1);
    window.zoomHeatmap[heatMapSelector].pan({x: 325, y: 140});

    // Close popovers on clicking elsewhere
    $('html').on('mousedown', function(e) {
        if(!$(e.target).closest('.popover').length) {
            if ($(e.target).closest(heatMapSelector).length) {
                hidePopovers();
            }
        }
    });
}

function renderTwoCrystalGroupsHeatmap(data1, data2, data3, heatMapSelector) {

    // Destroy old zoom on heatmap
    if (window.zoomHeatmap[heatMapSelector] != null) {
        window.zoomHeatmap[heatMapSelector].destroy();
        delete window.zoomHeatmap[heatMapSelector];
    }

    // Destroy old legend content
    $(heatMapSelector + ' .heatmap-legend').empty();

    // Destroy all previous contents
    $(heatMapSelector + ' .heatmap').empty();
    var heatmap = Snap(heatMapSelector + ' .heatmap');

    // Draw heatmap
    var interactions = data3.interactions;
    var segment_map = data3.segment_map;
    var sequence_numbers = data3.sequence_numbers;
    var num_seq_numbers = Object.keys(data3.sequence_numbers).length;

    x = 0; wi = num_seq_numbers;
    y = 0; hi = num_seq_numbers;

    heatmap.attr({viewBox:[x,y,wi,hi].join(',')});
    heatmap.attr({viewBox:[x,y,wi,hi].join(' ')});

    // Contains all labels
    var labelGroup = heatmap.g();

    // Contains all labels
    var contentGroup = heatmap.g();

    // Compute segment offsets
    var i;

    var segments = [];

    var seg, prevSeg = segment_map[sequence_numbers[0]];
    var seqStart = 0;

    for (i = 0; i < num_seq_numbers; i++) {
        seg = segment_map[sequence_numbers[i]];

        if (seg === prevSeg) {
            continue;
        }

        segments.push({
            seg: prevSeg,
            start: seqStart,
            end: i-1
        });

        seqStart = i;
        prevSeg = seg;
    }

    // Push last segment
    segments.push({
        seg: prevSeg,
        start: seqStart,
        end: i-1
    });

    // Draw segments
    segments.forEach(function(s) {
        var rgb = getSegmentColor(s.seg);

        // Place the segments vertically.
        var cell = heatmap.rect(s.start, 0, s.end - s.start + 1, num_seq_numbers);
        var line = heatmap.line(s.start, 0, s.start, num_seq_numbers);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });

        // Add text
        var label = heatmap.text(s.start + (s.end - s.start + 1)/2 - 6, 9 + cell.getBBox().height, s.seg);

        label.attr({
            'text-anchor': 'start',
            'font-size': 5
        });

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);

        label.transform("r270s-1,1");
    });

    segments.forEach(function(s) {
        rgb = getSegmentColor(s.seg);

        // Place the segments horizontally.
        cell = heatmap.rect(0, s.start, num_seq_numbers, s.end - s.start + 1);
        line = heatmap.line(0, s.end+1, num_seq_numbers, s.end+1);

        cell.attr({
            'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
            'fill-opacity': "0.5"
        });

        line.attr({
            'stroke': "rgb(150,150,150)",
            'strokeWidth': "0.1"
        });

        var label = heatmap.text(-2, s.start + (s.end - s.start + 1)/2, s.seg);

        label.attr({
            'text-anchor': 'end',
            'font-size': 5,
            'alignment-baseline': 'middle'
        });

        label.transform("r180s-1,1");

        contentGroup.add(cell);
        contentGroup.add(line);
        labelGroup.add(label);
    });

    // Draw cells
    for (i = 0; i < num_seq_numbers; i++) {
        for (var j = 0; j < num_seq_numbers; j++) {
            // Get the sequence numbers
            var seq_i = data3.sequence_numbers[i];
            var seq_j = data3.sequence_numbers[j];

            // Only draw if an interaction exists
            var num = seq_i + "," + seq_j;

            var n1 = 0;
            var n2 = 0;

            if (num in data1.interactions) {
                n1 = Object.keys(data1.interactions[num]).length;
            }

            if (num in data2.interactions) {
                n2 = Object.keys(data2.interactions[num]).length;
            }

            if ((num in data1.interactions) || (num in data2.interactions)) {
                // Difference in frequencies
                var f1 = (n1 / data1.pdbs.length);
                var f2 = (n2 / data2.pdbs.length);
                var fDiff = (n1 / data1.pdbs.length) - (n2 / data2.pdbs.length);

                if (fDiff <= 0) {
                    // If fDiff is close to -1, we want a red color
                    var rgb = { r: 255, g: 255-255*(-fDiff), b: 255-255*(-fDiff) };
                } else {
                    // If fDiff is close to 1 we want a blue color
                    var rgb = { r: 255-255*fDiff, g: 255-255*fDiff, b: 255 };
                }

                var cell = heatmap.rect(i, j, 1, 1);

                var title =  'Residues ' + seq_i + ', ' + seq_j + '<br />' 
                           + 'Frequency group 1: ' + f1.toFixed(2)+ '<br />' 
                           + 'Frequency group 2: ' + f2.toFixed(2)+ '<br />' 
                           + 'Frequency difference: ' + fDiff.toFixed(2)+ '<br />' ;

                var popoverTable = '<table class="table">'
                    + '<thead>'
                    + '<tr>'
                    + '<th>Residue #</th>'
                    + '<th>' + seq_i + '</th>'
                    + '<th>' + seq_j + '</th>'
                    + '</tr>'
                    + '</thead>'
                    + '<tbody>'
                    + '<td>Segment</td>'
                    + '<td>' + segment_map[seq_i] + '</td>'
                    + '<td>' + segment_map[seq_j] + '</td>'
                    + '</tr>'
                    + '</tbody>'
                    + '</table>'
                    + 'Group 1 freq: ' + f1.toFixed(2) + '<br />'
                    + 'Group 2 freq: ' + f2.toFixed(2) + '<br />'
                    + 'Frequency difference: ' + fDiff.toFixed(2)

                cell.attr({
                    'fill': "rgb(" + [rgb.r, rgb.g, rgb.b].join(',') + ")",
                    'data-frequency-diff': fDiff,
                    'data-gen-no-1': seq_i,
                    'data-gen-no-2': seq_j,
                    'data-seg-1': segment_map[seq_i],
                    'data-seg-2': segment_map[seq_j],
                    'data-group-1-num-ints': n1,
                    'data-group-2-num-ints': n2,
                    'data-group-1-num-pdbs': data1.pdbs.length,
                    'data-group-2-num-pdbs': data2.pdbs.length,
                    'data-group-1-freq': f1.toFixed(2),
                    'data-group-2-freq': f2.toFixed(2),
                    'class': 'heatmap-interaction'
                });

                $(heatMapSelector + ' rect.heatmap-interaction').tooltip({
                    'container': heatMapSelector,
                    'placement': 'top',
                    'delay': 75,
                    'html': true,
                    'title': title
                });

                // Add popover to cells
                $(heatMapSelector + ' rect.heatmap-interaction').popover({
                    'container': heatMapSelector,
                    'placement': 'bottom',
                    'animation': true,
                    'html': true,
                    'title': 'Interactions at ' + seq_i + ', ' + seq_j,
                    'content': popoverTable,
                    'tabindex': '0'
                });

                contentGroup.add(cell);
            }
        }
    }

    // Add cover-up triangle
    var bbox = contentGroup.getBBox();
    contentGroup.add(heatmap.polygon([bbox.x, bbox.y, bbox.x2, bbox.y, bbox.x2, bbox.y2]).attr({ fill: "white" }));

    // Rotate contents
    var g = heatmap.g();
    g.add(contentGroup);
    g.add(labelGroup);
    g.transform("r225s-1,1");

    // Populate heatmap legend
    var legendHtml = '<h4 class="center">Frequency</h4>'
        + '<p>From: <span class="min-value">-1</span></p>'
        + '<input class="min-interactions-range" type="range" min="-1" max="1" value="-1" step="0.01" />'
        + '<div class="temperature-scale">'
        + '<span class="red-to-white"></span>'
        + '<span class="white-to-blue"></span>'
        + '</div>'
        + '<p>To: <span class="max-value">1</span></p>'
        + '<input class="max-interactions-range" type="range" min="-1" max="1" value="1" step="0.01" />'
        + '<div class="temperature-scale">'
        + '<span class="red-to-white"></span>'
        + '<span class="white-to-blue"></span>'
        + '</div>';

    // Add SVG download button
    legendHtml += '<button onclick="downloadSVG(\'' + heatMapSelector + ' .heatmap\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' +
                    '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
                  '</button>';

    // Add CSV download button
    legendHtml += '<br /><button onclick="downloadTwoCrystalGroupsCSV(\'' + heatMapSelector + ' .heatmap\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' +
      '</button>';

    $(heatMapSelector + ' .heatmap-legend').append(legendHtml); 

    function getRangeChangeFunction() {

        return function() {
            var tMin = $(heatMapSelector + ' .heatmap-legend .min-interactions-range').val();
            var tMax = $(heatMapSelector + ' .heatmap-legend .max-interactions-range').val();


            $(heatMapSelector + ' .heatmap-legend .min-value').html(tMin);
            $(heatMapSelector + ' .heatmap-legend .max-value').html(tMax);

            // Hide all below min treshold
            $(heatMapSelector + ' rect').each(function() {
                var f = $(this).data("frequency-diff");
                if (f <= tMin || tMax <= f) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    }

    $(heatMapSelector + ' .heatmap-legend .min-interactions-range').change(getRangeChangeFunction());

    $(heatMapSelector + ' .heatmap-legend .max-interactions-range').change(getRangeChangeFunction());

    // Make zoomable
    window.zoomHeatmap[heatMapSelector] = svgPanZoom(heatMapSelector + ' .heatmap', {
        zoomEnabled: true,
        // controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.75,
        maxZoom: 50,
        zoomScaleSensitivity: 0.25,
        dblClickZoomEnabled: true,
        beforeZoom: hidePopovers,
        beforePan: hidePopovers
    });

    // Set initial zoom level
    window.zoomHeatmap[heatMapSelector].zoom(1);
    window.zoomHeatmap[heatMapSelector].pan({x: 325, y: 140});

    // Close popovers on clicking elsewhere
    $('html').on('mousedown', function(e) {
        if(!$(e.target).closest('.popover').length) {
            if ($(e.target).closest(heatMapSelector).length) {
                hidePopovers();
            }
        }
    });
}

function initializeSegmentButtons(selector) {
    // Initialize segment buttons.
    $(selector + ' .segments-panel button').each(function() {
        var s = $(this).attr('data-segment');

        // Return if no segment data
        if (s == null) {
            return;
        }

        $(this).click(function() {
            var segments = [];
            $(this).toggleClass('active');
            $(selector + ' .segments-panel button.active').each(function() {
                segments = segments.concat($(this).data('segment').split(' '));
            });
            $(selector + ' .segments-input').val(JSON.stringify(segments));
        });
    });

    // Initialize 'all' buttons.
    $(selector  + ' .segments-panel .all-button').each(function() {
        $(this).click(function() {
            if ($(this).html() === 'All') {
                $(this).html('None');
                $(this).parent().find('button').each(function() {
                    var s = $(this).attr('data-segment');

                    // Return if no segment data
                    if (s == null) {
                        return;
                    }

                    if (!$(this).hasClass('active')) {
                        $(this).trigger('click');
                    }
                });
            } else {
                $(this).html('All');
                $(this).parent().find('button').each(function() {
                    var s = $(this).attr('data-segment');

                    // Return if no segment data
                    if (s == null) {
                        return;
                    }

                    if ($(this).hasClass('active')) {
                        $(this).trigger('click');
                    }
                });
            }

        }); 

        // Update data
        var segments = [];
        $(selector + ' .segments-panel button.active').each(function() {
            segments.push($(this).data('segment'));
        });
        $(selector + ' .segments-panel .segments-input').val(JSON.stringify(segments));

        // Trigger click on initialization
        $(this).trigger('click');
    });
}

function initializeInteractionButtons(selector) {
    // Initialize interaction buttons.
    $(selector + ' .interactions-panel button').each(function() {
        var s = $(this).attr('data-interaction-type');

        // Return if no segment data
        if (s == null) {
            return;
        }

        $(this).click(function() {
            var interactions = [];
            $(this).toggleClass('active');
            $(selector + ' .interactions-panel button.active').each(function() {
                interactions = interactions.concat($(this).data('interaction-type').split(' '));
            });
            $(selector + ' .interactions-input').val(JSON.stringify(interactions));
        });
    });

    // Initialize 'all' buttons.
    $(selector  + ' .interactions-panel .all-button').each(function() {
        $(this).click(function() {
            if ($(this).html() === 'All') {
                $(this).html('None');
                $(this).parent().find('button').each(function() {
                    var s = $(this).attr('data-interaction-type');

                    // Return if no segment data
                    if (s == null) {
                        return;
                    }

                    if (!$(this).hasClass('active')) {
                        $(this).trigger('click');
                    }
                });
            } else {
                $(this).html('All');
                $(this).parent().find('button').each(function() {
                    var s = $(this).attr('data-interaction-type');

                    // Return if no segment data
                    if (s == null) {
                        return;
                    }

                    if ($(this).hasClass('active')) {
                        $(this).trigger('click');
                    }
                });
            }
        }); 

        // Update data
        var interactions = [];
        $(selector + ' .interactions-panel button.active').each(function() {
            interactions.push($(this).data('interaction-type'));
        });
        $(selector + ' .interactions-input').val(JSON.stringify(interactions));

        // Trigger click on initialization
        $(this).trigger('click');
    });
}

function initializeGoButton(selector, heatmapFunction, generic=false) {
    $(selector + ' .go-button').click(function() {
        var pdb = JSON.parse($(selector + ' .crystal-pdb').val());
        var segments = JSON.parse($(selector + ' .segments-input').val());
        var interactionTypes = JSON.parse($(selector + ' .interactions-input').val());

        if (!$(selector + ' .interactions-input').val() == null) 
            interactionTypes = JSON.parse($(selector + ' .interactions-input').val());

        $.getJSON( '/contactnetwork/interactiondata',
        {
            'segments': segments,
            'generic': generic,
            'pdbs': pdb,
            'interaction_types': interactionTypes
        },
        function( data ) {
            // Re-render heatmap
            heatmapFunction(data, selector + ' .heatmap-container');

            // Re-render flareplot
            createFlareplot(600, parseGPCRdb2flare(data), ".flareplot-container");
        });
    });
}

function initializeGoButtonTwoCrystalGroups(selector, heatmapFunction, generic=false) {
    $(selector + ' .go-button').click(function() {
        var pdbs1 = JSON.parse($(selector + ' .crystal-group-1-pdbs').val());
        var pdbs2 = JSON.parse($(selector + ' .crystal-group-2-pdbs').val());
        var segments = JSON.parse($(selector + ' .segments-input').val());
        var interactionTypes = JSON.parse($(selector + ' .interactions-input').val());

        $.getJSON( '/contactnetwork/interactiondata',
        {
            'segments': segments,
            'generic': generic,
            'pdbs': pdbs1,
            'interaction_types': interactionTypes
        },
        function( data1 ) {
            $.getJSON( '/contactnetwork/interactiondata',
            {
                'segments': segments,
                'generic': generic,
                'pdbs': pdbs2,
                'interaction_types': interactionTypes
            },
            function( data2 ) {
                $.getJSON( '/contactnetwork/interactiondata',
                {
                    'segments': segments,
                    'generic': generic,
                    'pdbs': pdbs1.concat(pdbs2),
                    'interaction_types': interactionTypes
                }, function ( data3 ) {
                // Re-render heatmap
                heatmapFunction(data1, data2, data3, selector + ' .heatmap-container');
                });
            });
        });
    });
}

function initializeFullscreenButton(selector) {
    var fullScreenElement = $(selector + ' .heatmap-container').get(0);
    $(selector + ' .btn-fullscreen').click(function() {
        toggleFullScreen(fullScreenElement);
    });
}

function reshapeTreeData(node) {

    var nodes = [];

    // Check if we are at a leaf-node, i.e. a list of PDB codes.
    if (Array.isArray(node)) {
        for (var i in node) {
            nodes.push({
                'text': node[i],
                'slug': node[i]
            });
        }
    } else {
        for (var name in node) {
            if (node.hasOwnProperty(name)) {
                nodes.push({
                    'text': name.split(',')[1],
                    'slug': name.split(',')[0],
                    'nodes': reshapeTreeData(node[name])
                });
            }
        }
    }

    // Sort nodes
    nodes.sort(function(a,b) {
      return a.slug >= b.slug;
    });

    return nodes;
}

function initializePdbChooser(treeSelector, pdbsCountSelector, pdbsInputSelector, multiSelect=true, chooseActiveSelector='', chooseInactiveSelector='', chooseRepresentativeSelector='', chooseNonRepresentativeSelector='') {
    $.get('pdbtreedata', function ( data ) {

        var treeData = reshapeTreeData(data);

        console.log(treeData);

        var $searchableTree = $(treeSelector).treeview({
            data: treeData,
            showIcon: false,
            showCheckbox: multiSelect,
            propagateCheckEvent: true,
            hierarchicalCheck: true,
            levels: 1,

            // Single crystal selection.
            onNodeSelected: function(event, node) {
                if (!multiSelect && "undefined" === typeof node.nodes) {
                    var pdbs = JSON.parse($(pdbsInputSelector).val());
                    var pdbName = node.text.substring(0,4);
                    pdbs.push(pdbName);
                    $(pdbsInputSelector).val(JSON.stringify(pdbs));

                    // Get family name
                    var domNode = $(treeSelector + ' *[data-nodeid="' + node.parentId +'"]');
                    var html = domNode.html();
                    var familyName = html.substring(html.lastIndexOf("</span>") + 7, html.length);

                    // Update view
                    $(pdbsCountSelector).html(familyName + ' - ' + pdbName + ' selected.');
                }
            },
            onNodeUnselected: function(event, node) {
                if (!multiSelect && "undefined" === typeof node.nodes) {
                    var pdbs = JSON.parse($(pdbsInputSelector).val());
                    for (var i=pdbs.length-1; i>=0; i--) {
                        if (pdbs[i] === node.text.substring(0,4)) {
                            pdbs.splice(i, 1);
                            break;
                        }
                    }
                    $(pdbsInputSelector).val(JSON.stringify(pdbs));

                    // Update view
                    $(pdbsCountSelector).html('No crystal selected.');
                }
            },
            // Multiple crystal selection
            onNodeChecked: function(event, node) {
                var chooseActive = $(chooseActiveSelector).is(':checked');
                var chooseInactive = $(chooseInactiveSelector).is(':checked');
                var chooseRepresentative = $(chooseRepresentativeSelector).is(':checked');
                var chooseNonRepresentative = $(chooseNonRepresentativeSelector).is(':checked');

                var domNode = $(treeSelector + ' *[data-nodeid="' + node.nodeId +'"]').find('span.icon.check-icon.glyphicon').first();

                if ("undefined" === typeof node.nodes) {
                    if (!chooseActive && (node.text.indexOf('(A)') !== -1)) {
                        setTimeout(function(){
                            domNode.trigger('click');
                        }, 1);
                        return;
                    }

                    if (!chooseInactive && (node.text.indexOf('(I)') !== -1)) {
                        setTimeout(function(){
                            domNode.trigger('click');
                        }, 1);
                        return;
                    }

                    if (!chooseRepresentative && (node.text.indexOf('(R)') !== -1)) {
                        setTimeout(function(){
                            domNode.trigger('click');
                        }, 1);
                        return;
                    }

                    if (!chooseNonRepresentative && (node.text.indexOf('(N)') !== -1)) {
                        setTimeout(function(){
                            domNode.trigger('click');
                        }, 1);
                        return;
                    }
                    
                    var pdbs = JSON.parse($(pdbsInputSelector).val());
                    pdbs.push(node.text.substring(0,4));
                    $(pdbsInputSelector).val(JSON.stringify(pdbs));

                    // Update view
                    $(pdbsCountSelector).html(pdbs.length);
                }
            },
            onNodeUnchecked: function (event, node) {

                // Uncheck all child nodes
                if ("undefined" === typeof node.nodes) {
                    var pdbs = JSON.parse($(pdbsInputSelector).val());
                    for (var i=pdbs.length-1; i>=0; i--) {
                        if (pdbs[i] === node.text.substring(0,4)) {
                            pdbs.splice(i, 1);
                            break;
                        }
                    }
                    $(pdbsInputSelector).val(JSON.stringify(pdbs));

                    // Update view
                    $(pdbsCountSelector).html(pdbs.length);
                }
            }
        });
    });
}


function initalizeSingleCrystalView() {
    initializePdbChooser('#single-crystal-pdb-modal .treeview', '#single-crystal-tab .crystal-count', '#single-crystal-tab .crystal-pdb', false);
    initializeSegmentButtons('#single-crystal-tab');
    initializeGoButton('#single-crystal-tab', renderSingleCrystalHeatmap);
    initializeFullscreenButton('#single-crystal-tab');
}

function initializeSingleGroupCrystalView() {
    initializePdbChooser('#single-crystal-group-pdbs-modal .treeview', '#single-crystal-group-tab .crystal-count', '#single-crystal-group-tab .crystal-pdb', true, '#single-crystal-group-pdbs-modal .choose-active', '#single-crystal-group-pdbs-modal .choose-inactive', '#single-crystal-group-pdbs-modal .choose-representative', '#single-crystal-group-pdbs-modal .choose-non-representative');
    initializeSegmentButtons('#single-crystal-group-tab');
    initializeGoButton('#single-crystal-group-tab', renderSingleCrystalGroupHeatmap, true);
    initializeFullscreenButton('#single-crystal-group-tab');
    initializeInteractionButtons('#single-crystal-group-tab');
}

function initializeTwoCrystalGroupsView() {
    initializePdbChooser('#two-crystal-group-pdbs-modal-1 .treeview', '#two-crystal-groups-tab .crystal-count-1', '#two-crystal-groups-tab .crystal-group-1-pdbs', true, '#two-crystal-group-pdbs-modal-1 .choose-active', '#two-crystal-group-pdbs-modal-1 .choose-inactive', '#two-crystal-group-pdbs-modal-1 .choose-representative', '#two-crystal-group-pdbs-modal-1 .choose-non-representative');
    initializePdbChooser('#two-crystal-group-pdbs-modal-2 .treeview', '#two-crystal-groups-tab .crystal-count-2', '#two-crystal-groups-tab .crystal-group-2-pdbs', true, '#two-crystal-group-pdbs-modal-2 .choose-active', '#two-crystal-group-pdbs-modal-2 .choose-inactive', '#two-crystal-group-pdbs-modal-2 .choose-representative', '#two-crystal-group-pdbs-modal-2 .choose-non-representative');
    initializeSegmentButtons('#two-crystal-groups-tab');
    initializeGoButtonTwoCrystalGroups('#two-crystal-groups-tab', renderTwoCrystalGroupsHeatmap, true);
    initializeFullscreenButton('#two-crystal-groups-tab');
    initializeInteractionButtons('#two-crystal-groups-tab');
}

// $(document).ready(function() {
//     // Single PDB files
//     initalizeSingleCrystalView();

//     // Single group of PDB files
//     initializeSingleGroupCrystalView();

//     // Two groups of PDB files
//     initializeTwoCrystalGroupsView();
// });
