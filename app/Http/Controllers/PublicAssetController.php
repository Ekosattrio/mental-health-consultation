<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Transactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class PublicAssetController extends Controller
{
    public function store(Request $request): mixed
    {
        Access::requireStaff($request->user());
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120']);
        $file = $request->file('file');
        $dimensions = @getimagesize($file->getRealPath());
        Access::check($dimensions && $dimensions[0] <= 8000 && $dimensions[1] <= 8000, 'Gambar tidak sah atau melebihi8.000piksel.');
        $extension = match ($dimensions[2]) {
            IMAGETYPE_JPEG => 'jpg',IMAGETYPE_PNG => 'png',IMAGETYPE_WEBP => 'webp',default => null
        };
        Access::check($extension !== null, 'Format gambar tidak didukung.');
        $id = (string) Str::uuid();
        $name = $id.'.'.$extension;
        Access::check((bool) Storage::disk('local')->putFileAs('public-cms', $file, $name), 'Gambar gagal disimpan.');
        Transactions::audit($request->user(), 'cms.asset', 'public_assets', $id);

        return response()->json(['data' => ['url' => '/media/'.$name]], 201);
    }

    public function show(string $asset): mixed
    {
        abort_unless(preg_match('/^[a-f0-9-]{36}\.(jpg|png|webp)$/D', $asset), 404);
        $disk = Storage::disk('local');
        abort_unless($disk->exists('public-cms/'.$asset), 404);

        return response()->file($disk->path('public-cms/'.$asset), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'public, max-age=86400']);
    }
}
