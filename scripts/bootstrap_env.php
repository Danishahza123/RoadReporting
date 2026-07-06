<?php
$envExample = __DIR__ . '/../.env.example';
$envFile = __DIR__ . '/../.env';

if (!file_exists($envFile) && file_exists($envExample)) {
    copy($envExample, $envFile);
}

$contents = '';
if (file_exists($envFile)) {
    $contents = file_get_contents($envFile);
}

// Ensure APP_KEY exists
if (strpos($contents, 'APP_KEY=') === false || preg_match('/^APP_KEY=\s*$/m', $contents)) {
    $key = 'base64:' . base64_encode(random_bytes(32));
    if ($contents === '') {
        $contents = "APP_KEY={$key}\n";
    } else {
        if (strpos($contents, 'APP_KEY=') === false) {
            $contents = "APP_KEY={$key}\n" . $contents;
        } else {
            $contents = preg_replace('/^APP_KEY=.*$/m', "APP_KEY={$key}", $contents);
        }
    }
}

// Ensure SQLite settings when DB_CONNECTION not explicitly set to mysql
if (strpos($contents, 'DB_CONNECTION=') === false || preg_match('/DB_CONNECTION=mysql/', $contents)) {
    // prefer sqlite in container
    $contents = preg_replace('/^DB_CONNECTION=.*$/m', 'DB_CONNECTION=sqlite', $contents);
    if (strpos($contents, 'DB_DATABASE=') === false) {
        $contents .= "\nDB_DATABASE=/app/database/database.sqlite\n";
    } else {
        $contents = preg_replace('/^DB_DATABASE=.*$/m', 'DB_DATABASE=/app/database/database.sqlite', $contents);
    }
}

file_put_contents($envFile, $contents);
echo "Bootstrapped .env\n";

return 0;
