export default class Album {
  id: string;
  image: string;
  title: string;
  price: Price;
  year: number;

  constructor(
    id: string,
    image: string,
    title: string,
    price: Price,
    year: number
  ) {
    this.id = id;
    this.image = image;
    this.title = title;
    this.price = price;
    this.year = year;
  }
}

export interface Price {
  label: string,
  amount: number,
  currency: string,
}
