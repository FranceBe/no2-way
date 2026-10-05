// "Morden Underground Station" -> "Morden", as on the platform boards
const STATION_SUFFIX = /\s+(Underground |DLR |Rail )?Station$/

export const shortStationName = (name: string): string =>
    name.replace(STATION_SUFFIX, '')
