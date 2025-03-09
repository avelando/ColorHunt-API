declare module "colorthief" {
  export default class ColorThief {
    getColor(image: HTMLImageElement | string): Promise<[number, number, number]>;
    getPalette(image: HTMLImageElement | string, colorCount?: number): Promise<[number, number, number][]>;
  }
}
