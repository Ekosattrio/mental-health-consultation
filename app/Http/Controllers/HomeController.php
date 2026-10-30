<?php

namespace App\Http\Controllers;

use App\Domain\Calendar;
use App\Models\CmsContent;
use App\Models\ConsultationPackage;
use App\Models\OwnerSetting;
use App\Models\Review;
use App\Models\TutorialContent;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return $this->render();
    }

    public function preview(CmsContent $content): Response
    {
        return $this->render($content);
    }

    private function render(?CmsContent $preview = null): Response
    {
        $practice = config('jiwasehat.public_practice');
        $settings = OwnerSetting::first();
        $identity = $settings?->practice_identity ?? [];
        foreach (['name' => 'name', 'title' => 'title', 'clinic_name' => 'clinic_name', 'clinic_address' => 'address', 'clinic_phone' => 'phone', 'clinic_whatsapp' => 'whatsapp', 'clinic_email' => 'email', 'bio' => 'bio', 'str_number' => 'str_number', 'sip_number' => 'sip_number'] as $key => $source) {
            if (filled($identity[$source] ?? null)) {
                $practice[$key] = $identity[$source];
            }
        }
        if ($settings) {
            $version = app(Calendar::class)->version();
            $days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            $hours = [];
            $weekly = DB::table('weekly_schedules')->where('calendar_version_id', $version->id)->orderBy('day_of_week')->orderBy('start_time')->get()->groupBy('day_of_week');
            foreach (range(1, 7) as $day) {
                $intervals = $weekly->get($day, collect());
                if ($intervals->isNotEmpty()) {
                    $hours[] = $days[$day - 1].' '.$intervals->map(fn ($i) => substr($i->start_time, 0, 5).'–'.substr($i->end_time, 0, 5))->implode(', ');
                }
            }$practice['clinic_hours'] = $hours ? implode('; ', $hours).' WIB' : 'Praktik sedang libur';
        }
        $user = request()->user();
        $prices = ! $preview && $user && $user->status->value === 'ACTIVE' && (int) request()->session()->get('auth_version', -1) === (int) $user->auth_version;
        $packages = [];
        foreach (ConsultationPackage::with('currentVersion')->where('is_active', true)->orderBy('service_code')->get() as $master) {
            $version = $master->currentVersion;
            if (! $version) {
                continue;
            }
            $row = ['service_code' => $master->service_code, 'name' => $version->name, 'category' => $master->category->value, 'duration_minutes' => $version->duration_minutes, 'description' => $version->description, 'benefits' => $version->benefits, 'is_bookable' => $version->is_bookable, 'notes' => $version->presentation['notes'] ?? '', 'badge' => $version->presentation['badge'] ?? '', 'delivery_mode' => $version->delivery_mode->value];
            if ($prices) {
                $promo = $version->promo_price && (! $version->promo_starts_at || $version->promo_starts_at->isPast()) && (! $version->promo_ends_at || $version->promo_ends_at->isFuture());
                $row['normal_price'] = $version->normal_price;
                $row['final_price'] = $promo ? $version->promo_price : $version->normal_price;
            }
            $packages[] = $row;
        }
        $landing = $preview ?? CmsContent::where('section_key', 'landing')->where('status', 'PUBLISHED')->first();
        $cms = array_intersect_key($landing?->payload ?? [], array_flip(['heroTitle', 'heroSubtitle', 'heroBadge', 'heroImageUrl', 'aboutImageUrl', 'logoUrl', 'ctaTitle', 'ctaSubtitle', 'footerText', 'faqs', 'sliderTitle', 'sliderSubtitle', 'sliderIntervalSeconds', 'sliderAutoPlay', 'instagramUrl']));
        if ($preview) {
            $cms = array_replace($cms, array_intersect_key($preview->payload, array_flip(['clinicName', 'clinicAddress', 'clinicPhone', 'clinicWhatsapp', 'clinicEmail'])));
            foreach (['clinicName' => 'clinic_name', 'clinicAddress' => 'clinic_address', 'clinicPhone' => 'clinic_phone', 'clinicWhatsapp' => 'clinic_whatsapp', 'clinicEmail' => 'clinic_email'] as $key => $field) {
                if (array_key_exists($key, $cms)) $practice[$field] = $cms[$key];
            }
        }
        if (filled($landing?->payload['clinicHours'] ?? null)) $practice['clinic_hours'] = $landing->payload['clinicHours'];
        $reviews = Review::where('status', 'APPROVED')->latest('moderated_at')->limit(20)->get()->map(fn ($r) => ['display_name' => $r->is_anonymous ? 'Pasien anonim' : 'Pasien terverifikasi', 'rating' => $r->rating, 'comment' => $r->comment ?? '', 'published_on' => $r->moderated_at->toDateString()])->all();

        return Inertia::render('Home', ['public_landing' => ['practice' => $practice, 'packages' => $packages, 'reviews' => $reviews, 'cms' => $cms, 'tutorials' => TutorialContent::where('role', 'GUEST')->where('is_active', true)->get()->map(fn ($t) => $t->only(['id', 'version', 'title', 'steps', 'video_url']))->all(), 'booking_enabled' => $settings !== null, 'preview' => $preview ? ['version' => $preview->version, 'status' => $preview->status] : null]]);
    }
}
