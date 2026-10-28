<?php

namespace App\Exceptions;

use RuntimeException;

class StaleDomainRecord extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Data sudah berubah. Muat ulang sebelum menyimpan kembali.');
    }
}
