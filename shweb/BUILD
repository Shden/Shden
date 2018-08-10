# Making shweb working

## Apache and PHP

On Mac, check /etc/apache2/httpd.conf for:

- PHP is allowed, uncomment LoadModule php#### if needed
- Rewrite is allowed, uncomment LoadModule rewrite_module ... if needed
- <Directory "/Users/den/Shden/shweb"> or similar is there

make sure Apache is up and running:

sudo apachectl start

At this stage at lease status.php shoud render itself (with proper .css).

If calls to API/1.1 return 404, make sure:

- httpd.conf has AllowOverride All in shden section
- API/1.1 has .htaccess with override instructions (should be pulled from Git)

## MySQL

Check if http://localhost/API/1.1/status/GetStatus is working. If not, make sure
MySQL is installed and SHDEN DB is available. More on MySQL in ../db/BUILD
