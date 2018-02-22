import io from 'socket.io-client';

var socket = io.connect('http://localhost:4040');
var form = document.getElementById('form');
var formencrypt = document.getElementById('formencrypt');
var formbitrix = document.getElementById('formbitrix');

socket.on('files signed', function (data) {
	console.log(data);
});

socket.on('file saved', function () {
	console.log("file saved");
});

form.onsubmit = function(ev) {
	ev.preventDefault();
	
	var fileEl = document.getElementById('file');
	const file = fileEl.files[0];
	const name = fileEl.files[0].name;
	socket.emit("sign file", name);

	var stream = ss.createStream();

	// upload a file to the server.
	ss(socket).emit('file stream', stream, {size: file.size, name: name});
	var blobStream =  ss.createBlobReadStream(file);

	var size = 0;

	blobStream.on('data', function (chunk) {
		size += chunk.length;
		console.log(Math.floor(size / file.size * 100) + '%');
		// -> e.g. '42%'
	});

	
	blobStream.pipe(stream);
};

formencrypt.onsubmit = function(ev) {
	ev.preventDefault();
	
	var fileEl = document.getElementById('fileencrypt');
	const file = fileEl.files[0];
	const name = fileEl.files[0].name;

	socket.emit("encrypt file", name);

	var stream = ss.createStream();

	// upload a file to the server.
	ss(socket).emit('file stream', stream, {size: file.size, name: name});
	var blobStream = ss.createBlobReadStream(file);


	var size = 0;

	blobStream.on('data', function (chunk) {
		size += chunk.length;
		console.log(Math.floor(size / file.size * 100) + '%');
		// -> e.g. '42%'
	});

	
	blobStream.pipe(stream);
};

formbitrix.onsubmit = function(ev) {
	ev.preventDefault();

	socket.emit("bitrix", {url: "https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.docs/ajax.php?command=content&id=1", name: "file1.txt"});
}
