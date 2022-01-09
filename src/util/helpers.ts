import colors from 'vuetify/lib/util/colors'
import Vuetify from 'vuetify'

export function normalizeRelations(data: any, fields: any) {
  return {
    ...data,
    ...fields.reduce(
      (prev: any, field: any) => ({
        ...prev,
        [field]: Array.isArray(data[field])
          ? data[field].map((x: any) => x.id)
          : data[field].id
      }),
      {}
    )
  };
}

export function resolveRelations(data: any, fields: any, rootGetters: any) {
  return {
    ...data,
    ...fields.reduce(
      (prev: any, field: any) => ({
        ...prev,
        [field]: Array.isArray(data[field])
          ? data[field].map((x: any) => rootGetters[`${field}/find`](x))
          : rootGetters[`${field}/find`](data[field])
      }),
      {}
    )
  };
}

const colorsToUse: any = {...colors}
delete colorsToUse.grey
delete colorsToUse.shades
delete colorsToUse.brown
delete colorsToUse.blueGrey

const colorList = Object.keys(colorsToUse)
const shades = ['base', /* 'accent1', */ 'accent2', 'accent3', 'accent4']

export function hashColor(input: number | string) {

  if (!input) return 'blue'

  let num = input
  if (typeof input === 'string') {
    // Add up ASCII codes of each character and multiply by random prime
    num = input.split('').reduce((prev, curr) => prev + curr.charCodeAt(0), 0) * 8641
  }
  else num = input

  const i = Math.floor(Math.PI * 3548 * num) % (colorList.length * shades.length)
  const color = colorList[i % colorList.length]
  const shade = shades[Math.floor(i / colorList.length)]

  return colorsToUse[color][shade]
}

export function darkenColor(color: string, amount: number) {
  if (!color) return color
  const c = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color)!
  return `#${c[1] +
    (~~Math.min(Math.max(parseInt(c[2], 16) + amount, 0), 255)).toString(
      16
    )}${c[3]}`
}

// Determine light or dark text color based on background color
export function textColor(color: string) {

  if (!color) return 'white'
  color = color.replace('#', '')

  // If non-alphanumeric, return white
  if (!/^[a-fA-F0-9]+$/.test(color)) return 'white'

  const c = /^([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color)!
  const brightness =
    (parseInt(c[1], 16) * 299 +
      parseInt(c[2], 16) * 587 +
      parseInt(c[3], 16) * 114) /
    1000
  return brightness > 126 ? 'black' : 'white'
}


// Find a nested object by dot-syntax string
// ex. lookup(obj, 'a.b.c') => obj.a.b.c
export function lookup(obj: any, path: string, defaultVal?: any): any {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : (defaultVal ?? undefined)
  }, obj)
}

// Map lookup on an array
export function mapProps(object: any, path: string, defaultVal?: any) {
  return object.map((o: any) => lookup(o, path, defaultVal))
}
