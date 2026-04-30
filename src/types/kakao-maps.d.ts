declare global {
  interface Window {
    kakao: KakaoNamespace
  }
}

export interface KakaoNamespace {
  maps: KakaoMaps
}

export interface KakaoMaps {
  load(callback: () => void): void
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Marker: new (options: { map?: KakaoMap; position: KakaoLatLng; title?: string }) => KakaoMarker
  InfoWindow: new (options: { content: string }) => KakaoInfoWindow
  CustomOverlay: new (options: {
    map?: KakaoMap
    position: KakaoLatLng
    content: string | HTMLElement
    yAnchor?: number
    xAnchor?: number
  }) => KakaoCustomOverlay
  Polyline: new (options: {
    map?: KakaoMap
    path: KakaoLatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: string
  }) => KakaoPolyline
  event: {
    addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void
  }
}

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  setLevel(level: number): void
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void
}

export interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void
  close(): void
  setMap(map: KakaoMap | null): void
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void
}

export interface KakaoPolyline {
  setMap(map: KakaoMap | null): void
}

export type KakaoOverlay = KakaoMarker | KakaoInfoWindow | KakaoCustomOverlay | KakaoPolyline
