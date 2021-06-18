import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentWeather } from '../_models/currentWeather';
import { ForecastWeatherFull } from '../_models/forecastWeatherFull';
import { Storage } from '@capacitor/storage';
import { Position } from '@capacitor/geolocation';

const API_KEY = 'XXX';
const LANG = 'de';
const UNIT = 'metric';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const CURRENT_URL = BASE_URL + 'weather?appid=' + API_KEY + '&lang=' + LANG + '&units=' + UNIT;
const FORECAST_URL = BASE_URL + 'forecast?appid=' + API_KEY + '&lang=' + LANG + '&units=' + UNIT;

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  public async setLocation(coordinates: Position) {
    const coords = { lat: coordinates.coords.latitude, lon: coordinates.coords.longitude };
    await Storage.set({ key: 'coords', value: JSON.stringify(coords) });
  }

  public async getLocation(): Promise<{ lat: string; lon: string }> {
    const ret = await Storage.get({ key: 'coords' });
    console.log(ret);
    return JSON.parse(ret.value) as Promise<{ lat: string; lon: string }>;
  }

  /****** current weather for location ******/
  public getCurrentWeather(city: string): Observable<CurrentWeather> {
    return this.http.get(CURRENT_URL + '&q=' + city) as Observable<CurrentWeather>;
  }

  /****** weather forecast for location ******/
  public getForecastWeather(city: string): Observable<ForecastWeatherFull> {
    return this.http.get(FORECAST_URL + '&q=' + city) as Observable<ForecastWeatherFull>;
  }

  /****** current weather for coordinates ******/
  public getCurrentWeatherCoords(lat: string, lon: string): Observable<CurrentWeather> {
    return this.http.get(CURRENT_URL + '&lat=' + lat + '&lon=' + lon) as Observable<CurrentWeather>;
  }

  /****** weather forecast for coordinates ******/
  public getForecastWeatherCoords(lat: string, lon: string): Observable<ForecastWeatherFull> {
    return this.http.get(FORECAST_URL + '&lat=' + lat + '&lon=' + lon) as Observable<ForecastWeatherFull>;
  }
}
