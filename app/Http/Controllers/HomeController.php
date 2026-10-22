<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $practice = config('jiwasehat.public_practice');

        return Inertia::render('Home', [
            'public_landing' => [
                'practice' => $practice,
                'packages' => array_map(static fn (array $package): array => [
                    'service_code' => $package[0],
                    'name' => $package[1],
                    'category' => $package[2],
                    'duration_minutes' => $package[3],
                    'description' => match (true) {
                        $package[0] === 'ASSESSMENT_FULL' => 'Layanan tes dan asesmen lengkap, durasi 2–4 jam; jadwal dasar 4 jam.',
                        $package[2] === 'ASSESSMENT' => 'Layanan tes dan asesmen sesuai kebutuhan pemeriksaan.',
                        default => 'Layanan terjadwal sesuai kebutuhan dan ketersediaan praktisi.',
                    },
                    'benefits' => $package[2] === 'ASSESSMENT' ? ['Hasil laporan asesmen termasuk paket'] : [],
                    'is_bookable' => false,
                ], config('jiwasehat.public_packages')),
                'reviews' => [],
            ],
        ]);
    }
}
