export type CarCategory = 'Economy' | 'Compact' | 'SUV' | 'Luxury' | 'Electric' | 'Van';

export interface Car {
  readonly id: string;
  readonly name: string;
  readonly category: CarCategory;
  readonly plate: string;
  readonly dailyRateCents: number;
}
