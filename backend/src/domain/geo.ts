export type LatLng = [number, number];

/** Ray-casting point-in-polygon test; polygon is an array of [lat, lng]. */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  const [y, x] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Great-circle distance in metres. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Square polygon of `halfSizeMeters` around a centre, used to seed farm boundaries. */
export function squareAround(center: LatLng, halfSizeMeters: number): LatLng[] {
  const dLat = halfSizeMeters / 111_320;
  const dLng = halfSizeMeters / (111_320 * Math.cos((center[0] * Math.PI) / 180));
  const [lat, lng] = center;
  return [
    [lat + dLat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng],
  ];
}

export function isValidPolygon(value: unknown): value is LatLng[] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every(
      (pair) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number' &&
        Math.abs(pair[0]) <= 90 &&
        Math.abs(pair[1]) <= 180,
    )
  );
}
