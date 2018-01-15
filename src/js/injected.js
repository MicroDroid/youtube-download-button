require('../img/512x512.png');
require('../img/256x256.png');
require('../img/128x128.png');
require('../img/96x96.png');
require('../img/48x48.png');
require('../img/32x32.png');

require('../css/injected.css');

var ytdl = require('ytdl-core');
var fetchStream = require('fetch-readablestream');


var downloadBtn = document.createElement('button');
var dropdownMenu = document.createElement('div');
var dropdown = document.createElement('div');

downloadBtn.id = 'ytb-dl';
dropdownMenu.id = 'ytb-dropdown-menu';
dropdown.id = 'ytb-dropdown';

downloadBtn.innerHTML = 'Download <span class="ytb-caret"></span>';

dropdown.insertBefore(dropdownMenu, dropdown.firstElementChild);
dropdown.insertBefore(downloadBtn, dropdown.firstElementChild);

var subscribeBtn;

function getInfo() {
	while (dropdownMenu.firstChild) {
		dropdownMenu.removeChild(dropdownMenu.firstChild);
	}

	ytdl.getInfo(window.location.href).then(function(data) {
		window.asdf = data;

		data.formats = data.formats.map(function(format) {
			format.isAudio = format.type.startsWith('audio');
			if (format.resolution)
				format.resolution = format.resolution.split(' ')[0];
			return format;
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

		var link;
		for (let i = 0; i < data.formats.length; i++) {
			var format = data.formats[i];
			link = document.createElement('a');
			link.href = format.url;
			if (format.isAudio)
				link.innerText = 'Audio: ' + format.audioBitrate + 'kbps' + '/' + format.audioEncoding;
			else
				link.innerText = 'Video: ' + format.resolution + '/' + format.encoding + ' @ ' + format.bitrate 
					+ 'Mbps' + (format.fps ? ' ~' + format.fps + 'fps' : '');
			link.download = true;
			link.className = format.isAudio ? 'ytb-audio' : 'ytb-video';
			dropdownMenu.append(link);
		}
	});
}

var observer = new MutationObserver(function() {
	subscribeBtn = document.getElementsByTagName('ytd-subscribe-button-renderer')[0];
	if (subscribeBtn) {
		observer.disconnect();	
		subscribeBtn.parentNode.parentNode.insertBefore(dropdown, subscribeBtn.parentNode);
	}
});

observer.observe(document, {
	childList: true,
	subtree: true,
});

// I found no better way for now
var oldHref = window.location.href;
setInterval(function() {
	if (oldHref !== window.location.href) {
		getInfo();
	}
	oldHref = window.location.href;
}, 1000);

getInfo();