<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $t) {
            $t->string('reminder_recipient_phone', 25)->nullable();
            $t->dateTime('reminder_wa_accepted_at', 6)->nullable();
        });
        Schema::table('notifications', fn (Blueprint $t) => $t->text('delivery_payload')->nullable());
        DB::statement('UPDATE appointments SET reminder_recipient_phone=tele_service_recipient_phone, reminder_wa_accepted_at=tele_service_wa_accepted_at WHERE tele_service_wa_accepted_at IS NOT NULL');
        DB::statement('UPDATE users u JOIN owner_settings o ON o.owner_user_id=u.id SET u.phone=o.wa_owner_phone WHERE u.phone IS NULL AND o.wa_owner_phone IS NOT NULL');
    }

    public function down(): void
    {
        Schema::table('notifications', fn (Blueprint $t) => $t->dropColumn('delivery_payload'));
        Schema::table('appointments', fn (Blueprint $t) => $t->dropColumn(['reminder_recipient_phone', 'reminder_wa_accepted_at']));
    }
};
