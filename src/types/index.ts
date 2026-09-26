export type MealPeriod = "lunch" | "dinner";
export type AppRole = "customer" | "admin" | "kitchen" | "delivery" | "partner" | "finance";

export type Meal = {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients?: string;
  allergens: string[];
  calories?: number;
  protein?: number;
  accent: string;
  imagePath?: string;
  imageUrl?: string;
  active?: boolean;
};

export type MenuSlot = {
  id: string;
  date: string;
  period: MealPeriod;
  meal: Meal;
  price: number;
  creditCost: number;
  remaining: number;
  cutoffLabel: string;
};

export type Hub = {
  id: string;
  name: string;
  type: "hostel" | "office" | "community";
  area: string;
  address: string;
  pickup: string;
  active: boolean;
  capacity?: number;
};
