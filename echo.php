<?php

header('Content-type: text/html');

$callback = $_GET['callback'];
unset($_REQUEST['callback']);

$json = json_encode($_REQUEST);

$domain_parts = explode('.', $_SERVER['SERVER_NAME']);
$base_domain = array_slice($doimain_parts, -2);

?>

<!DOCTYPE html>
<html>
    <head>
        <script>// document.domain = '<?= $base_domain ?>';</script>
    </head>
    <body>
        <script>
            <?= "window.parent.$callback($json)" ?>
        </script>
    </body>
</html>
