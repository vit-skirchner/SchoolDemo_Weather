import { ForecastWeather } from './../_models/forecastWeather';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { WeatherService } from '../_services/weather.service';
import { CurrentWeather } from '../_models/currentWeather';
import { ForecastWeatherFull } from '../_models/forecastWeatherFull';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  public currentWeather: CurrentWeather;
  public forecastWeatherFull: ForecastWeatherFull;
  public forecastWeather: ForecastWeather[] = [];
  public date = new Date();

  constructor(private weatherService: WeatherService) {}

  async ngOnInit() {
    const coordinates = await this.weatherService.getLocation();
    if (coordinates) {
      this.weatherService.getCurrentWeatherCoords(coordinates.lat, coordinates.lon).subscribe((data) => {
        this.currentWeather = data;
        if (data.dt < data.sys.sunrise || data.dt > data.sys.sunset) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
      this.weatherService.getForecastWeatherCoords(coordinates.lat, coordinates.lon).subscribe((data) => {
        this.forecastWeatherFull = data;
        this.getForecastDay();
      });
    } else {
      this.weatherService.getCurrentWeather('Weiden').subscribe((data) => {
        this.currentWeather = data;
        if (data.dt < data.sys.sunrise || data.dt > data.sys.sunset) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
      this.weatherService.getForecastWeather('Mountain View').subscribe((data) => {
        this.forecastWeatherFull = data;
        this.getForecastDay();
      });
    }
  }

  async getLocationWeather() {
    await Geolocation.requestPermissions();
    const coordinates = await Geolocation.getCurrentPosition();
    const lat = coordinates.coords.latitude.toString();
    const lon = coordinates.coords.longitude.toString();
    delete this.currentWeather;
    delete this.forecastWeather;
    this.weatherService.getCurrentWeatherCoords(lat, lon).subscribe((data) => {
      this.currentWeather = data;
    });
    this.weatherService.getForecastWeatherCoords(lat, lon).subscribe((data) => {
      this.forecastWeatherFull = data;
      this.getForecastDay();
    });
    this.weatherService.setLocation(coordinates);
  }

  getForecastDay() {
    let oldDate = new Date();
    oldDate.setHours(0, 0, 0, 0);
    let i = 0;
    let y = 1;
    this.forecastWeatherFull.list.forEach((element) => {
      const newDate = new Date(element.dt * 1000);
      newDate.setHours(0, 0, 0, 0);
      if (!this.forecastWeather) {
        this.forecastWeather = [];
      }
      if (!this.forecastWeather[i]) {
        this.forecastWeather[i] = {
          maxTemp: Math.floor(element.main.temp_max),
          minTemp: Math.floor(element.main.temp_min),
          date: newDate
        };
      }
      if (newDate.getTime() !== oldDate.getTime()) {
        i++;
        y = 1;
        this.forecastWeather[i] = {
          maxTemp: Math.floor(element.main.temp_max),
          minTemp: Math.floor(element.main.temp_min),
          date: newDate
        };
      } else {
        if (this.forecastWeather[i].maxTemp < element.main.temp_max) {
          this.forecastWeather[i].maxTemp = Math.floor(element.main.temp_max);
        }
        if (this.forecastWeather[i].minTemp > element.main.temp_min) {
          this.forecastWeather[i].minTemp = Math.floor(element.main.temp_min);
        }
        if (y === 4) {
          this.forecastWeather[i].image = element.weather[0].icon;
        }
        y++;
      }
      oldDate = newDate;
    });
    this.forecastWeather.shift();
  }
}

@Pipe({ name: 'round' })
export class RoundPipe implements PipeTransform {
  transform(input: number) {
    return Math.floor(input);
  }
}
