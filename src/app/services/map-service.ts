import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import mapboxgl, { LngLatLike, Map, Marker, MapMouseEvent } from 'mapbox-gl';
import { MarkerDTO } from '../models/marker-dto';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnDestroy {

  private map?: Map;
  private markers: Marker[] = [];
  private currentLocation: LngLatLike = [-75.6727, 4.53252];
  private readonly MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FtdWVsZ29kIiwiYSI6ImNtaHRhdmFxejF1c3gybG85OHBueGo2NHUifQ.NneWp4unMPuvdxw2ao-q2Q';
  private destroy$ = new Subject<void>();

  constructor() {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;
  }

  /** Inicializa el mapa dentro del contenedor especificado */
  public create(containerId: string = 'map'): void {
    if (this.map) {
      this.map.remove(); // Evita fugas si se recrea el mapa
    }

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/standard',
      center: this.currentLocation,
      zoom: 17,
      pitch: 45,
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      })
    );

    // Cambiar cursor a pointer cuando esté sobre el mapa
    this.map.on('mouseenter', () => {
      this.map!.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', () => {
      this.map!.getCanvas().style.cursor = '';
    });
  }

  /** Dibuja varios marcadores con popup */
  public drawMarkers(places: MarkerDTO[]): void {
    if (!this.map) return;

    places.forEach(({ id, title, photoUrl, latitude, longitude, price, average_rating, city }) => {
      const popupHtml = `
        <strong>${title}</strong>
        <p>Ciudad: ${city}</p>
        <p>Precio: $${price}</p>
        <p>Rating: ${average_rating}/5</p>
        <div>
          <img src="${photoUrl}" alt="Imagen" style="width: 100px; height: 100px;">
        </div>
        <a href="/place/${id}">Ver más</a>
      `;

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
        .addTo(this.map!);
    });
  }

  /** Devuelve el mapa actual (si existe) */
  public get mapInstance(): Map | undefined {
    return this.map;
  }

  /** Limpia todos los marcadores del mapa */
  public clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  /** Centra el mapa en una ubicación específica y coloca un marcador */
  public setMarkerAtLocation(latitude: number, longitude: number): void {
    if (!this.map) return;

    // Centrar el mapa en las coordenadas
    this.map.setCenter([longitude, latitude]);
    this.map.setZoom(17);

    // Limpiar marcadores existentes
    this.clearMarkers();

    // Agregar marcador en la ubicación
    const marker = new mapboxgl.Marker({
      color: 'red',
      scale: 1.2,
      pitchAlignment: 'map',
      rotationAlignment: 'map'
    })
      .setLngLat([longitude, latitude])
      .addTo(this.map);

    this.markers.push(marker);
  }

  /** Limpieza al destruir el servicio */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  public addMarker(): Observable<mapboxgl.LngLat> {
    return new Observable((observer) => {
      if (!this.map) {
        observer.error('Mapa no inicializado');
        return;
      }

      // Limpia los marcadores existentes y agrega uno nuevo en la posición del click
      const onClick = (e: MapMouseEvent) => {
        this.clearMarkers();
        const marker = new mapboxgl.Marker({
          color: 'red',
          scale: 1.2,
          pitchAlignment: 'map',
          rotationAlignment: 'map'
        })
          .setLngLat(e.lngLat)
          .addTo(this.map!);

        this.markers.push(marker);
        // Emite las coordenadas del marcador al observador
        observer.next(marker.getLngLat());
      };

      const registerClick = () => {
        this.map!.on('click', onClick);
      };

      if (this.map.loaded()) {
        registerClick();
      } else {
        this.map.once('load', registerClick);
      }

      // Limpieza al desuscribirse
      return () => {
        this.map?.off('click', onClick);
      };
    });
  }
}