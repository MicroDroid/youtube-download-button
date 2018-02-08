require('../img/512x512.png');
require('../img/256x256.png');
require('../img/128x128.png');
require('../img/96x96.png');
require('../img/48x48.png');
require('../img/32x32.png');

require('../css/injected.css');

var DOM = document.documentElement.innerElement;
var observed = false;
var initialized = false;

var ytdl = require('ytdl-core');
var sanitizeFilename = require('sanitize-filename');

var isDark = document.documentElement.getAttribute('dark') !== null;

var downloadBtn = document.createElement('button');
var dropdownMenu = document.createElement('div');
var dropdown = document.createElement('div');

dropdownMenu.id = 'ydb-dropdown-menu';
dropdown.id = 'ydb-dropdown-' + (isDark ? 'dark' : 'light');

downloadBtn.innerHTML = 'Download <span class="ydb-caret"></span>';
downloadBtn.onclick = function() {
	if (!initialized) {
		getInfo();
		initialized = true;
	}

	dropdownMenu.classList.toggle('ydb-show');
};

dropdown.insertBefore(dropdownMenu, dropdown.firstElementChild);
dropdown.insertBefore(downloadBtn, dropdown.firstElementChild);

var subscribeBtn;

function getInfo() {
	while (dropdownMenu.firstChild) {
		dropdownMenu.removeChild(dropdownMenu.firstChild);
	}

	var loading = document.createElement('a');
	loading.innerText = 'Loading..';
	loading.className = 'ytd-video';
	dropdownMenu.append(loading);

	ytdl.getInfo(window.location.href).then(function(data) {
		data.formats = data.formats.map(function(format) {
			format.isAudio = format.type.startsWith('audio');
			if (format.resolution)
				format.resolution = format.resolution.split(' ')[0];
			return format;
		});

		// Remove video-only sources
		data.formats = data.formats.filter(function(format) {
			return !!format.audioBitrate;
		});

		// Brain-twister incoming!
		data.formats = data.formats.sort(function(a, b) {
			if (a.type.startsWith('audio'))
				if (b.type.startsWith('audio'))
					if (a.audioBitrate > b.audioBitrate)
						return -1;
					else if (a.audioBitrate < b.audioBitrate)
						return 1;
					else
						return 0;
				else
					return 1;
			else if (b.type.startsWith('audio'))
				return -1;
			else
				if (parseInt(a.resolution.split('p')[0]) > parseInt(b.resolution.split('p')[0]))
					return -1;
				else if (parseInt(a.resolution.split('p')[0]) < parseInt(b.resolution.split('p')[0]))
					return 1;
				else
					return 0;
		});

		loading.remove();

		var link;
		for (let i = 0; i < data.formats.length; i++) {
			var format = data.formats[i];
			link = document.createElement('a');
			link.href = format.url;
			link.target = '_blank';
			if (format.isAudio)
				link.innerText = 'Audio: ' + format.audioBitrate + 'kbps' + '/' + format.audioEncoding;
			else
				link.innerText = 'Video: ' + format.resolution + '/' + format.encoding + ' @ ' + format.bitrate 
					+ 'Mbps' + (format.fps ? ' ~' + format.fps + 'fps' : '');
			link.download = sanitizeFilename(data.title);
			link.className = format.isAudio ? 'ydb-audio' : 'ydb-video';
			dropdownMenu.append(link);
		}
	});
}

var observer = new MutationObserver(function() {
	subscribeBtn = document.querySelector('#meta-contents #subscribe-button');
	var subscribePaperBtn = subscribeBtn ? subscribeBtn.getElementsByTagName('paper-button')[0] : null;
	if (subscribeBtn && subscribePaperBtn) {
		observer.disconnect();
		// YouTube behaves weird on different themes or whatever
		downloadBtn.style.height = subscribePaperBtn.offsetHeight + 'px';

		// This element exists only on certain circumstances and adds some padding
		var subscribeBtnRenderer = subscribeBtn.getElementsByTagName('ytd-subscribe-button-renderer')[0];
		if (!subscribeBtnRenderer)
			downloadBtn.style.marginRight = '4px';

		subscribeBtn.parentNode.insertBefore(dropdown, subscribeBtn);

		injected = true;
	}
});

if (window.location.pathname.startsWith('/watch')) {
	observer.observe(document, {
		childList: true,
		subtree: true,
	});

	observed = true;
}

// I found no better way for now
var oldHref = window.location.href;
setInterval(function() {
	if (oldHref !== window.location.href) {
		if (!observed && window.location.pathname.startsWith('/watch')) {
			observer.observe(document, {
				childList: true,
				subtree: true,
			});

			observed = true;
		}

		dropdownMenu.classList.remove('ydb-show');
		initialized = false;
	}
	oldHref = window.location.href;
}, 1000);
