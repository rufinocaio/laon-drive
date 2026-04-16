<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Token da API do UploadThing
    |--------------------------------------------------------------------------
    |
    | Seu token para autenticar requisições na API do UploadThing.
    | Você pode encontrar este token no painel do UploadThing.
    |
    */

    'token' => env('UPLOADTHING_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | URL da API do UploadThing
    |--------------------------------------------------------------------------
    |
    | A URL base para as requisições na API do UploadThing.
    |
    */

    'api_url' => env('UPLOADTHING_API_URL', 'https://api.uploadthing.com'),

];
