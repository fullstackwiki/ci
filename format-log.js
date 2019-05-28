
var convert = new (require('ansi-to-html'))({
	stream: true,
	escapeXML: true,
});

process.stdin.setEncoding('utf8');

process.stdout.write('<!DOCTYPE html>\n');
process.stdout.write('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:w="tag:fullstack.wiki,2018:ns/" lang="en" dir="ltr">');
process.stdout.write('	<head>');
process.stdout.write('		<meta charset="UTF-8" />');
process.stdout.write('		<title>Welcome to Fullstack.wiki</title>');
process.stdout.write('		<meta name="description" content="Fullstack.wiki homepage" />');
process.stdout.write('	</head>');
process.stdout.write('	<body>');
process.stdout.write('		<main>');
process.stdout.write('			<h1>Welcome to Fullstack.wiki</h1>');
process.stdout.write('			<pre>');

process.stdin.on('data', function (chunk) {
	process.stdout.write(convert.toHtml(chunk, convert));
});

process.stdin.on('end', function (chunk) {
	process.stdout.write('</pre></main></body></html>');
});
