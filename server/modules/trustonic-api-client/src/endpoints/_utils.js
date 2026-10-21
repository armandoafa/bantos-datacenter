/**
 * Normaliza la entrada de dispositivos a una lista de objetos { deviceUid, ...extra }.
 * Acepta: '3537…', ['3537…', …], { deviceUid, … } o [{ deviceUid, … }, …].
 * `extra` se mezcla en cada elemento (los campos propios del elemento tienen prioridad).
 */
export function toDeviceList(devices, extra = {}) {
  const arr = Array.isArray(devices) ? devices : [devices];
  if (!arr.length || arr.some((d) => d === undefined || d === null || d === '')) {
    throw new Error('Trustonic: se requiere al menos un deviceUid (IMEI o número de serie)');
  }
  return arr.map((d) => {
    const base = typeof d === 'object' ? { ...d } : { deviceUid: String(d) };
    if (!base.deviceUid) throw new Error('Trustonic: cada elemento debe tener deviceUid');
    return clean({ ...extra, ...base });
  });
}

/** Elimina llaves con valor undefined para no enviarlas en el payload. */
export function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/** Caracteres prohibidos por Trustonic en títulos, mensajes y propiedades personalizadas. */
const RESTRICTED = /[<>|~`^\\=]/;

export function assertNoRestricted(value, field) {
  if (typeof value === 'string' && RESTRICTED.test(value)) {
    throw new Error(`Trustonic: ${field} contiene caracteres restringidos (< > | ~ \` ^ \\ =)`);
  }
}
