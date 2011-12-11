<?php

header('Content-type: text/html');

$callback = $_GET['callback'];
unset($_REQUEST['callback']);

$json = json_encode($_REQUEST);

// TODO: This should extract the base-level domain
//
// Example:
//   www.example.com -> example.com
//

$base_domain = $_SERVER['SERVER_NAME'];

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
