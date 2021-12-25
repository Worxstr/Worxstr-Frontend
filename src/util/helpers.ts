import colors from 'vuetify/lib/util/colors'

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
delete colorsToUse['blueGrey']

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

  const i = Math.floor(Math.PI * 1.8 * num) % (colorList.length * shades.length)
  const color = colorList[i % colorList.length]
  const shade = shades[Math.floor(i / colorList.length)]

  return colorsToUse[color][shade]
}