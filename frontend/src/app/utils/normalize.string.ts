export function normalizeString(str): string {
    return str ? str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() : str;
}
