'use strict';
'require baseclass';
'require fs';
'require rpc';
'require uci';

/* ----------------- Internet Detector Integration ----------------- */
var InternetDetector = baseclass.extend({
  appName: 'internet-detector',
  currentAppMode: null,

  callUIPoll: rpc.declare({ object: 'luci.internet-detector', method: 'UIPoll', expect: { '': {} } }),
  callInetStatus: rpc.declare({ object: 'luci.internet-detector', method: 'InetStatus', expect: { '': {} } }),

  getUIPoll() { return this.callUIPoll().then(d => d); },
  getInetStatus() { return this.callInetStatus().then(d => d); },

  async load() {
    if (!this.currentAppMode) {
      await uci.load(this.appName).then(() => {
        this.currentAppMode = uci.get(this.appName, 'config', 'mode');
      }).catch(() => {});
    }

    if (this.currentAppMode == '2') return this.getUIPoll();
    else if (this.currentAppMode == '1') return L.resolveDefault(this.getInetStatus(), null);
    return null;
  },

  render(data) {
    var isMobile = window.innerWidth <= 600;

    // Jika tidak ada data → tampilkan Disconnected
    if (!data || !data.instances || !data.instances.length) {
      return E('span', {
        'style': `
          background:#f8aeba;
          color:#fff;
          padding:${isMobile ? '2px 5px' : '5px 10px'};
          border-radius:${isMobile ? '4px' : '6px'};
          font-size:${isMobile ? '10px' : '13px'};
          font-weight:500;
          white-space:nowrap;
        `
      }, _('Disconnected'));
    }

    var inetArea = E('div', {
      'style': 'display:flex;flex-wrap:wrap;gap:' + (isMobile ? '3px' : '6px') + ';'
    });

    data.instances.sort((a, b) => a.num - b.num);
    for (let i of data.instances) {
      let status = _('Disconnected');
      let bg = '#f8aeba';
      if (i.inet == 0) { status = _('Connected'); bg = '#18bc9c'; }
      else if (i.inet == -1) { status = _('Undefined'); bg = '#ccc'; }

      let pubip = (i.mod_public_ip !== undefined)
        ? ' | %s: %s'.format(_('Public IP'), (i.mod_public_ip == '') ? _('Undefined') : _(i.mod_public_ip))
        : '';

      inetArea.append(E('span', {
        'style': `
          background:${bg};
          color:${(i.inet == -1) ? '#333' : '#fff'};
          padding:${isMobile ? '2px 5px' : '5px 10px'};
          border-radius:${isMobile ? '4px' : '6px'};
          font-size:${isMobile ? '10px' : '13px'};
          font-weight:500;
          white-space:nowrap;
        `
      }, '%s: %s%s'.format(i.instance, status, pubip)));
    }

    return inetArea;
  }
});

/* ----------------- System Info Section d----------------- */

var callLuciVersion = rpc.declare({
  object: 'luci',
  method: 'getVersion'
});

var callSystemBoard = rpc.declare({
  object: 'system',
  method: 'board'
});

var callSystemInfo = rpc.declare({
  object: 'system',
  method: 'info'
});

return baseclass.extend({
  title: _('System'),

  load: function() {
    var inetDetector = new InternetDetector();
    this.inetDetector = inetDetector;

    return Promise.all([
      L.resolveDefault(callSystemBoard(), {}),
      L.resolveDefault(callSystemInfo(), {}),
      L.resolveDefault(callLuciVersion(), { revision: _('unknown version'), branch: 'LuCI' }),
      inetDetector.load()
    ]);
  },

  render: function(data) {
    var boardinfo = data[0];
    var systeminfo = data[1];
    var luciversion = data[2];
    var inetdata = data[3];

    luciversion = luciversion.branch + ' ' + luciversion.revision;

    var datestr = null;
    if (systeminfo.localtime) {
      var date = new Date(systeminfo.localtime * 1000);
      datestr = '%04d-%02d-%02d %02d:%02d:%02d'.format(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    }

    var fields = [
      _('Model'), "Amlogic B860H-V1 REYRE-WRT",
      _('Firmware Version'), (L.isObject(boardinfo.release) ? boardinfo.release.description + ' | ' : '') + (luciversion || ''),
      _('Kernel Version'), boardinfo.kernel,
      _('Local Time'), datestr,
      _('Uptime'), systeminfo.uptime ? '%t'.format(systeminfo.uptime) : null,
      _('Temperature'), tempcpu,
      _('CPU Usage'), cpuusage,
      _('Internet'), this.inetDetector.render(inetdata)
    ];

    var table = E('table', { 'class': 'table' });

    for (var i = 0; i < fields.length; i += 2) {
      table.appendChild(E('tr', { 'class': 'tr' }, [
        E('td', { 'class': 'td left', 'width': '33%' }, [fields[i]]),
        E('td', { 'class': 'td left' }, [(fields[i + 1] != null) ? fields[i + 1] : '?'])
      ]));
    }

    return table;
  }
});
'use strict';
'require baseclass';
'require fs';
'require rpc';
'require uci';

/* ----------------- Internet Detector Integration ----------------- */
var InternetDetector = baseclass.extend({
  appName: 'internet-detector',
  currentAppMode: null,

  callUIPoll: rpc.declare({ object: 'luci.internet-detector', method: 'UIPoll', expect: { '': {} } }),
  callInetStatus: rpc.declare({ object: 'luci.internet-detector', method: 'InetStatus', expect: { '': {} } }),

  getUIPoll() { return this.callUIPoll().then(d => d); },
  getInetStatus() { return this.callInetStatus().then(d => d); },

  async load() {
    if (!this.currentAppMode) {
      await uci.load(this.appName).then(() => {
        this.currentAppMode = uci.get(this.appName, 'config', 'mode');
      }).catch(() => {});
    }

    if (this.currentAppMode == '2') return this.getUIPoll();
    else if (this.currentAppMode == '1') return L.resolveDefault(this.getInetStatus(), null);
    return null;
  },

  render(data) {
    var isMobile = window.innerWidth <= 600;

    // Jika tidak ada data → tampilkan Disconnected
    if (!data || !data.instances || !data.instances.length) {
      return E('span', {
        'style': `
          background:#f8aeba;
          color:#fff;
          padding:${isMobile ? '2px 5px' : '5px 10px'};
          border-radius:${isMobile ? '4px' : '6px'};
          font-size:${isMobile ? '10px' : '13px'};
          font-weight:500;
          white-space:nowrap;
        `
      }, _('Disconnected'));
    }

    var inetArea = E('div', {
      'style': 'display:flex;flex-wrap:wrap;gap:' + (isMobile ? '3px' : '6px') + ';'
    });

    data.instances.sort((a, b) => a.num - b.num);
    for (let i of data.instances) {
      let status = _('Disconnected');
      let bg = '#f8aeba';
      if (i.inet == 0) { status = _('Connected'); bg = '#18bc9c'; }
      else if (i.inet == -1) { status = _('Undefined'); bg = '#ccc'; }

      let pubip = (i.mod_public_ip !== undefined)
        ? ' | %s: %s'.format(_('Public IP'), (i.mod_public_ip == '') ? _('Undefined') : _(i.mod_public_ip))
        : '';

      inetArea.append(E('span', {
        'style': `
          background:${bg};
          color:${(i.inet == -1) ? '#333' : '#fff'};
          padding:${isMobile ? '2px 5px' : '5px 10px'};
          border-radius:${isMobile ? '4px' : '6px'};
          font-size:${isMobile ? '10px' : '13px'};
          font-weight:500;
          white-space:nowrap;
        `
      }, '%s: %s%s'.format(i.instance, status, pubip)));
    }

    return inetArea;
  }
});

/* ----------------- System Info Section d----------------- */

var callLuciVersion = rpc.declare({
  object: 'luci',
  method: 'getVersion'
});

var callSystemBoard = rpc.declare({
  object: 'system',
  method: 'board'
});

var callSystemInfo = rpc.declare({
  object: 'system',
  method: 'info'
});

return baseclass.extend({
  title: _('System'),

  load: function() {
    var inetDetector = new InternetDetector();
    this.inetDetector = inetDetector;

    return Promise.all([
      L.resolveDefault(callSystemBoard(), {}),
      L.resolveDefault(callSystemInfo(), {}),
      L.resolveDefault(callLuciVersion(), { revision: _('unknown version'), branch: 'LuCI' }),
      inetDetector.load()
    ]);
  },

  render: function(data) {
    var boardinfo = data[0];
    var systeminfo = data[1];
    var luciversion = data[2];
    var inetdata = data[3];

    luciversion = luciversion.branch + ' ' + luciversion.revision;

    var datestr = null;
    if (systeminfo.localtime) {
      var date = new Date(systeminfo.localtime * 1000);
      datestr = '%04d-%02d-%02d %02d:%02d:%02d'.format(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    }

    var fields = [
      _('Model'), "Amlogic B860H-V1 REYRE-WRT",
      _('Firmware Version'), (L.isObject(boardinfo.release) ? boardinfo.release.description + ' | ' : '') + (luciversion || ''),
      _('Kernel Version'), boardinfo.kernel,
      _('Local Time'), datestr,
      _('Uptime'), systeminfo.uptime ? '%t'.format(systeminfo.uptime) : null,
      _('Temperature'), tempcpu,
      _('CPU Usage'), cpuusage,
      _('Internet'), this.inetDetector.render(inetdata)
    ];

    var table = E('table', { 'class': 'table' });

    for (var i = 0; i < fields.length; i += 2) {
      table.appendChild(E('tr', { 'class': 'tr' }, [
        E('td', { 'class': 'td left', 'width': '33%' }, [fields[i]]),
        E('td', { 'class': 'td left' }, [(fields[i + 1] != null) ? fields[i + 1] : '?'])
      ]));
    }

    return table;
  }
});
