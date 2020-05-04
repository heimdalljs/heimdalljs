var boxplot = require('plain-text-box-plot');
var outliers = require('outliers');

function Stat() {
  this.value = null;
  this.range = [];
}

Object.defineProperty(Stat.prototype, 'length', {
  get: function() {
    return this.value.length;
  }
});

function fixForPlot(n) {
  return n.toFixed(2);
}


Object.defineProperty(Stat.prototype, 'filteredRange', {
  get: function() {
    var r = this.range;

    // console.log('range', JSON.stringify(r, null, 2));

    r.sort(function(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });

    return r.filter(outliers());
  }
});

Object.defineProperty(Stat.prototype, 'stats', {
  get: function() {
    if (typeof this.value !== 'number') {
      return {};
    }

    var filtered = this.filteredRange;

    var len = filtered.length;
    var q1i = Math.round(len / 4);
    var q2i = Math.round(len / 2);
    var q3i = Math.round(len / 4 * 3);

    var stats = {
      min: fixForPlot(Math.min.apply(Math, filtered)),
      q1: fixForPlot(filtered[q1i]),
      q2: fixForPlot(filtered[q2i]),
      q3: fixForPlot(filtered[q3i]),
      max: fixForPlot(Math.max.apply(Math, filtered))
    };

    // console.log(stats);

    return stats;
  }
});

Object.defineProperty(Stat.prototype, 'plot', {
  get: function() {
    if (typeof this.value !== 'number') {
      return '';
    }

    return boxplot(this.stats, 25);
  }
});

Stat.prototype.toFixed = function toFixed(n) {
  return this.value.toFixed(n || this.value.length);
};

Stat.prototype.toString = function toString() {
  return String(this.value);
};

Stat.prototype.valueOf = function valueOf() {
  if (typeof this.value === 'number' && this.range) {
    var value = this.filteredRange.reduce(function(v, c) { return v + c; }, 0);
    var len = this.filteredRange.length;

    return value / len;
  } else {
    return this.value;
  }
};

function combineRows(a, b) {
  let l = Math.max(a.length, b.length);

  if (!a[0]) {
    a[0] = new Stat();
    a[0].value = b[0];
    a[0].range.push(b[0]);
  }

  for (let i = 1; i < l; i++) {

    if (!a[i]) {
      a[i] = new Stat();
    }

    a[i].range.push(b[i]);

    if (typeof a[i].value === 'number') {
      a[i].value += b[i];
    } else if (!a[i].value) {
      a[i].value = b[i];
    }
  }
}


module.exports = function combineTables(tables) {
  let master = tables.shift();
  let len = master.length;
  let table = [];

  for (let i = 0; i < len; i++) {
    let masterRow = [];
    combineRows(masterRow, master[i]);
    table.push(masterRow);

    for (let j = 0; j < tables.length; j++) {
      let row = tables[j][i];

      if (masterRow[0].value !== row[0]) {
        throw new Error("Table Mismatch!");
      } else {
        combineRows(masterRow, row);
      }
    }
  }

  return table;
};
