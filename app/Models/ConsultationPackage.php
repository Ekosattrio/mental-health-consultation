<?php

namespace App\Models;

use App\Enums\ServiceCategory;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** consultation_packages: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ConsultationPackage extends DomainModel
{
    protected $attributes = ['is_active' => true, 'row_version' => 1];

    protected $table = 'consultation_packages';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'category' => ServiceCategory::class,
            'is_active' => 'boolean',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function packageVersions(): HasMany
    {
        return $this->hasMany(PackageVersion::class, 'package_id');
    }

    public function currentVersion(): HasOne
    {
        return $this->hasOne(PackageVersion::class, 'package_id')->ofMany(['version' => 'max'], function ($query) {
            $query->where('effective_at', '<=', now());
        });
    }

    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(TreatmentPlan::class, 'package_id');
    }
}
