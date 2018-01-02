var fs = require('fs');

function parseGPCRdb2flare(data) {
  if (typeof data == 'string') {
    data = JSON.parse(data);
  }

  var dataFlare = {
    edges: [],
    tracks: [
      {
        trackLabel: 'Secondary Structure',
        trackProperties: [],
      },
    ],
    trees: [
      {
        treeLabel: 'Secondary Structure',
        treePaths: [],
      },
    ],
    defaults: {
      edgeColor: 'rgba(100,100,100,100)',
      edgeWidth: 1,
    },
  };

  var segmentColors = {
    '1': '#1500D6',
    '2': '#006BDB',
    '3': '#00E1D1',
    '4': '#00E74F',
    '5': '#39ED00',
    '6': '#C9F300',
    '7': '#F99100',
    '8': '#FF0000',
    '0': '#FFFFFF',
  };

  function assignColor(segment) {
    var color = '';
    switch (segment) {
      case 'TM1':
        color = segmentColors['1'];
        break;
      case 'TM2':
        color = segmentColors['2'];
        break;
      case 'TM3':
        color = segmentColors['3'];
        break;
      case 'TM4':
        color = segmentColors['4'];
        break;
      case 'TM5':
        color = segmentColors['5'];
        break;
      case 'TM6':
        color = segmentColors['6'];
        break;
      case 'TM7':
        color = segmentColors['7'];
        break;
      case 'H8':
        color = segmentColors['8'];
        break;
      default:
        color = segmentColors['0'];
    }
    return color;
  }

  function separatePair(stringPair) {
    var regex = /([0-9x]+),([0-9x]+)/g;
    var m;

    matches = regex.exec(stringPair);

    return [matches[1], matches[2]];
  }

  // Fill tracks and trees
  Object.keys(data.segment_map).forEach(function(residue) {
    dataFlare.tracks[0].trackProperties.push({
      nodeName: residue,
      color: assignColor(data.segment_map[residue]),
      size: 1,
    });

    dataFlare.trees[0].treePaths.push(
      data.segment_map[residue] + '.' + residue,
    );
  });

  // Fill edges
  if (data.generic == false) {
    // data.generic == false in case of single crystal

    Object.keys(data.interactions).forEach(function(pair) {
      pairResidues = separatePair(pair);

      getInteractionTypesFromPdbObject(data.interactions[pair]).forEach(
        function(interaction) {
          var rgb = getInteractionColor(interaction);

          dataFlare.edges.push({
            name1: pairResidues[0],
            name2: pairResidues[1],
            frames: [0],
            color: rgb2hex(rgb.r, rgb.g, rgb.b),
            'data-interaction-type': interaction,
            class:
              'flareplot-interaction' +
              ' ' +
              getFriendlyInteractionName(interaction).replace(/ /g, '-'),
          });
        }
      );
    });
  } else {
    crystals = Object.keys(data.aa_map);

    Object.keys(data.interactions).forEach(function(pair) {
      pairResidues = separatePair(pair);

      var frames = [];

      Object.keys(data.interactions[pair]).forEach(function(crystal) {
        var frame = crystals.indexOf(crystal);
        frames.push(frame);
      });

      dataFlare.edges.push({
        name1: pairResidues[0],
        name2: pairResidues[1],
        frames: frames,
      });
    });
  }

  return dataFlare;
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgb2hex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = '0' + r;

  if (g.length == 1) g = '0' + g;

  if (b.length == 1) b = '0' + b;

  return '#' + r + g + b;
}

function getInteractionStrength(i) {
  switch (i) {
    case getFriendlyInteractionName('polarsidechainsidechaininteraction'):
    case getFriendlyInteractionName('polarbackbonesidechaininteraction'):
    case 'polarsidechainsidechaininteraction':
    case 'polarbackbonesidechaininteraction':
      return 4;
    case getFriendlyInteractionName('facetofaceinteraction'):
    case getFriendlyInteractionName('facetoedgeinteraction'):
    case getFriendlyInteractionName('picationinteraction'):
    case 'facetofaceinteraction':
    case 'facetoedgeinteraction':
    case 'picationinteraction':
      return 3;
    case getFriendlyInteractionName('hydrophobicinteraction'):
    case 'hydrophobicinteraction':
      return 2;
    case getFriendlyInteractionName('vanderwaalsinteraction'):
    case 'vanderwaalsinteraction':
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
      for (var k in obj[key]) interactions.add(obj[key][k]);
    }
  }

  // Sort according to strength
  interactions = Array.from(interactions);
  interactions.sort(function(i1, i2) {
    return getInteractionStrength(i1) - getInteractionStrength(i2);
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
      r = 254;
      g = 0;
      b = 16;
      break;
    case 'facetofaceinteraction':
    case 'facetoedgeinteraction':
    case 'picationinteraction':
    case getFriendlyInteractionName('facetofaceinteraction'):
    case getFriendlyInteractionName('facetoedgeinteraction'):
    case getFriendlyInteractionName('picationinteraction'):
      r = 94;
      g = 241;
      b = 242;
      break;
    case 'hydrophobicinteraction':
    case getFriendlyInteractionName('hydrophobicinteraction'):
      r = 0;
      g = 117;
      b = 220;
      break;
    case 'vanderwaalsinteraction':
    case getFriendlyInteractionName('vanderwaalsinteraction'):
      r = 89;
      g = 252;
      b = 197;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
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
      r = 190;
      g = 190;
      b = 190;
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
      r = 230;
      g = 230;
      b = 230;
      //r = 150; g = 255; b = 150;
      break;
    case 'ECL1':
    case 'ECL2':
    case 'ECL3':
      r = 190;
      g = 190;
      b = 190;
      //r = 150; g = 150; b = 255;
      break;
    case 'ICL1':
    case 'ICL2':
    case 'ICL3':
      r = 190;
      g = 190;
      b = 190;
      //r = 150; g = 150; b = 255;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }

  return { r: r, g: g, b: b };
}

var dataTest = require('./resources/4IAQ.new.json');
// var dataTest2 = require('../resources/5-HT.json');

fs.writeFile(
  './resources/4IAQflare.new.json',
  JSON.stringify(parseGPCRdb2flare(dataTest)),
  'utf8',
  function(err) {
    if (err) throw err;
    console.log('saved');
  },
);

// fs.writeFile(
//   '../resources/5-HTflare.json',
//   JSON.stringify(parseGPCRdb2flare(dataTest2)),
//   'utf8',
//   function(err) {
//     if (err) throw err;
//     console.log('saved2');
//   }
// );
