import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Country } from '../interfaces/country.interface';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Regions } from '../interfaces/region.type';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private apiURL: string = 'https://restcountries.com/v3.1';

  public cacheStore: CacheStore = {
    byCapital: {term: '', countries: []},
    byCountry: {term: '', countries: []},
    byRegion: {region: '', countries: []},
  }

  constructor(private http: HttpClient) {
    this.loadLocalStorage();
  }

  private saveLocalStorage() {
    localStorage.setItem( 'cacheStore', JSON.stringify( this.cacheStore ));
  }
  private loadLocalStorage() {
    if( !localStorage.getItem('cacheStore') ) return;
    this.cacheStore = JSON.parse(localStorage.getItem('cacheStore')!);
  }


  private getCountriesRequest(url: string): Observable<Country[]>{
    return this.http.get<Country[]>(url)
    .pipe(
      catchError( error => of([]) )
    );;
  }

  searchCountryByAlphaCode(code: string): Observable<Country | null>{
    return this.http.get<Country[]>(`${this.apiURL}/alpha/${code}`)
      .pipe(
        map(countries => countries.length > 0 ? countries[0] : null),
        catchError( error => of(null) )
      );
  }

  searchCapital(query: string): Observable<Country[]>{
    const url = `${this.apiURL}/capital/${query}`;
    return this.getCountriesRequest(url)
    .pipe( 
      tap( countries => this.cacheStore.byCapital = {term: query, countries}
      ),
      tap( () => this.saveLocalStorage() ),
      );
  }
  searchCountry(query: string): Observable<Country[]>{
    const url = `${this.apiURL}/name/${query}`;
    return this.getCountriesRequest(url)
    .pipe( 
      tap( countries => this.cacheStore.byCountry = {term: query, countries}
      ),
      tap( () => this.saveLocalStorage() ),
      );
  }
  searchRegion(region: Regions): Observable<Country[]>{
    const url = `${this.apiURL}/region/${region}`;
    return this.getCountriesRequest(url)
    .pipe( 
    tap( countries => this.cacheStore.byRegion = {region, countries}
    ),
    tap( () => this.saveLocalStorage() ),
    );
  }
}
