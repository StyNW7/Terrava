import { Controller, Get, Injectable, Logger, Module, NotFoundException, Query } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthContext } from '../../common/auth-context';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AlertsModule } from '../alerts/alerts.module';
import { AlertsService } from '../alerts/alerts.service';
import { ACTIONS } from '../../domain/alert-rules';
import { temperatureHumidityIndex, thiBand } from '../../domain/environment';

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    precipitation: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    relative_humidity_2m_mean?: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

/** WMO weather codes -> short bilingual description. */
function describe(code: number) {
  if (code === 0) return { id: 'Cerah', en: 'Clear' };
  if (code <= 3) return { id: 'Berawan', en: 'Cloudy' };
  if (code <= 48) return { id: 'Berkabut', en: 'Fog' };
  if (code <= 67) return { id: 'Hujan', en: 'Rain' };
  if (code <= 82) return { id: 'Hujan lebat', en: 'Heavy showers' };
  return { id: 'Badai petir', en: 'Thunderstorm' };
}

/**
 * Farm weather from Open-Meteo (free, no API key) with a heat-stress outlook
 * derived from the forecast Temperature-Humidity Index. Powers the overview
 * weather panel and pre-emptive "heat wave tomorrow" alerts.
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, { at: number; data: unknown }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly alerts: AlertsService,
  ) {}

  async forFarm(ctx: AuthContext, farmId?: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        organizationId: ctx.organizationId,
        ...(farmId && farmId !== 'all' ? { id: farmId } : {}),
        latitude: { not: null },
        longitude: { not: null },
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!farm) throw new NotFoundException('No farm with coordinates found');
    return { farmId: farm.id, farmName: farm.name, ...(await this.fetch(farm.latitude!, farm.longitude!)) };
  }

  async fetch(lat: number, lng: number) {
    if (!this.config.get('WEATHER_ENABLED'))
      return { available: false as const, reason: 'Weather integration is disabled (WEATHER_ENABLED=false)' };
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.at < 30 * 60_000)
      return cached.data as Awaited<ReturnType<WeatherService['load']>>;
    try {
      const data = await this.load(lat, lng);
      this.cache.set(key, { at: Date.now(), data });
      return data;
    } catch (error) {
      this.logger.warn(`Weather fetch failed: ${(error as Error).message}`);
      return { available: false as const, reason: 'Weather provider unavailable' };
    }
  }

  private async load(lat: number, lng: number) {
    const url = new URL(this.config.get('WEATHER_API_URL'));
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation');
    url.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_probability_max,weather_code',
    );
    url.searchParams.set('timezone', 'Asia/Jakarta');
    url.searchParams.set('forecast_days', '4');
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as OpenMeteoResponse;
    const current = body.current!;
    const daily = body.daily!;
    const currentThi = temperatureHumidityIndex(current.temperature_2m, current.relative_humidity_2m);
    return {
      available: true as const,
      current: {
        time: current.time,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        condition: describe(current.weather_code),
        thi: currentThi,
        heatStress: thiBand(currentThi),
      },
      forecast: daily.time.map((date, i) => {
        const humidity = daily.relative_humidity_2m_mean?.[i] ?? current.relative_humidity_2m;
        const thi = temperatureHumidityIndex(daily.temperature_2m_max[i], humidity);
        return {
          date,
          max: daily.temperature_2m_max[i],
          min: daily.temperature_2m_min[i],
          humidity,
          rainChance: daily.precipitation_probability_max[i],
          condition: describe(daily.weather_code[i]),
          peakThi: thi,
          heatStress: thiBand(thi),
        };
      }),
    };
  }

  /** Every 3 hours: warn farms whose forecast for tomorrow reaches moderate heat stress. */
  @Cron(CronExpression.EVERY_3_HOURS, { name: 'heat-wave-forecast' })
  async forecastAlerts() {
    if (!this.config.get('JOBS_ENABLED') || !this.config.get('WEATHER_ENABLED')) return;
    const farms = await this.prisma.farm.findMany({
      where: { status: 'ACTIVE', latitude: { not: null }, longitude: { not: null } },
    });
    for (const farm of farms) {
      const weather = await this.fetch(farm.latitude!, farm.longitude!);
      if (!weather.available) continue;
      const tomorrow = weather.forecast[1];
      if (!tomorrow || (tomorrow.heatStress !== 'moderate' && tomorrow.heatStress !== 'severe')) continue;
      await this.alerts.raise(
        {
          ruleKey: 'heatWaveForecast',
          category: 'WEATHER',
          severity: tomorrow.heatStress === 'severe' ? 'CRITICAL' : 'HIGH',
          title: { id: 'Prediksi gelombang panas besok', en: 'Heat wave forecast for tomorrow' },
          description: {
            id: `Suhu maksimum ${tomorrow.max}°C dengan THI puncak ${tomorrow.peakThi} diperkirakan besok.`,
            en: `A maximum of ${tomorrow.max}°C with a peak THI of ${tomorrow.peakThi} is forecast for tomorrow.`,
          },
          cause: {
            id: 'Kondisi atmosfer regional menunjukkan tren suhu ekstrem.',
            en: 'Regional atmospheric conditions point to an extreme temperature trend.',
          },
          recommendations: [ACTIONS.monitor, ACTIONS.task],
          confidence: 82,
        },
        {
          organizationId: farm.organizationId,
          farmId: farm.id,
          source: 'WEATHER',
          dataAtDetection: { temperature: tomorrow.max, heartRate: 0, activity: 0, oxygen: 0 },
        },
      );
    }
  }
}

@ApiTags('Weather')
@ApiBearerAuth()
@Controller('weather')
class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Current weather, 4-day forecast and heat-stress outlook for a farm' })
  @ApiQuery({ name: 'farmId', required: false })
  get(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.weather.forFarm(user, farmId);
  }
}

@Module({
  imports: [AlertsModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
