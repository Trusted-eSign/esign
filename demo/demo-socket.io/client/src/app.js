import io from 'socket.io-client';

var socket = io.connect('https://localhost:4040');
var formsign = document.getElementById('sign');

var file1 = {};
file1.name = 'filename1.txt';
file1.sys_name = 'filename1.txt';
file1.url = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.docs/ajax.php?command=content&id=1'
file1.id = 1;

var file2 = {};
file2.name = 'filename2.txt';
file2.sys_name = 'filename2.txt.p7s';
file2.url = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.docs/ajax.php?command=content&id=2'
file2.id = 2;

var file3 = {};
file3.name = 'filename3.txt';
file3.sys_name = 'filename3.txt';
file3.url = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.docs/ajax.php?command=content&id=3'
file3.id = 3;

var signRequest = {};
signRequest.jsonrpc = '2.0';
signRequest.method = 'sign';
signRequest.params = {};
signRequest.params.token = '';
signRequest.params.files = [file1, file2, file3];
signRequest.params.extra = {};
signRequest.params.uploader = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.sign/ajax.php?command=upload';
signRequest.params.cancel = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.sign/ajax.php?command=updateStatus&status=2';
signRequest.params.error = 'https://bitrix.tsumo.org/bitrix/components/trustednet/trustednet.sign/ajax.php?command=updateStatus&status=3';

socket.on('files signed', function (data) {
	console.log('файл подписан', data);
});

socket.on('file saved', function () {
	console.log("file saved");
});

socket.on('signature verified', function (data) {
	console.log('информация о подписи', data);
});

formsign.onsubmit = function(ev) {
	ev.preventDefault();

	socket.emit("sign", signRequest);
}
