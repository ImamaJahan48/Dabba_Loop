import type { Hub, MenuSlot } from "@/types";

const iso = (addDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return d.toISOString().slice(0, 10);
};

/*
  Demo photos are remote Unsplash placeholders so the site looks like a real food
  service immediately. In production, upload your own meal photos from Admin > Meals.
*/
const demoPhotos = {
  karahi: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=86",
  daal: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=86",
  qeema: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=86",
  pulao: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=86"
};

export const demoHubs: Hub[] = [
  { id: "hub-uol", name: "UOL Hostel Hub", type: "hostel", area: "Defence Road", address: "Main hostel reception", pickup: "12:45 PM / 7:15 PM", active: true, capacity: 60 },
  { id: "hub-jt", name: "Johar Town Work Hub", type: "office", area: "Johar Town", address: "Office reception cluster", pickup: "1:10 PM", active: true, capacity: 45 },
  { id: "hub-val", name: "Valencia Community Hub", type: "community", area: "Valencia", address: "Central pickup desk", pickup: "1:00 PM / 7:30 PM", active: true, capacity: 35 }
];

export const demoMeals = {
  karahi: {
    id: "m1",
    name: "Home-style Chicken Karahi",
    description: "Slow-cooked tomato masala, two rotis, raita and crisp salad.",
    category: "Daily",
    ingredients: "Chicken, tomato, ginger, green chilli, coriander",
    allergens: ["dairy"],
    calories: 620,
    protein: 38,
    accent: "green",
    imageUrl: demoPhotos.karahi,
    active: true
  },
  daal: {
    id: "m2",
    name: "Daal Chana Bowl",
    description: "Comforting chana daal, steamed rice, achar and cucumber raita.",
    category: "Light",
    ingredients: "Chana daal, rice, spices, cucumber, yoghurt",
    allergens: ["dairy"],
    calories: 510,
    protein: 21,
    accent: "mint",
    imageUrl: demoPhotos.daal,
    active: true
  },
  qeema: {
    id: "m3",
    name: "Aloo Qeema",
    description: "Beef mince with potatoes, two rotis, mint raita and salad.",
    category: "Daily",
    ingredients: "Beef mince, potato, tomato, herbs, spices",
    allergens: ["dairy"],
    calories: 670,
    protein: 34,
    accent: "leaf",
    imageUrl: demoPhotos.qeema,
    active: true
  },
  pulao: {
    id: "m4",
    name: "Chicken Yakhni Pulao",
    description: "Fragrant basmati rice, chicken, raita and house chutney.",
    category: "Daily",
    ingredients: "Basmati rice, chicken, yakhni stock, whole spices",
    allergens: ["dairy"],
    calories: 640,
    protein: 31,
    accent: "sage",
    imageUrl: demoPhotos.pulao,
    active: true
  }
};

export const demoMenu: MenuSlot[] = [
  { id: "s1", date: iso(0), period: "lunch", meal: demoMeals.karahi, price: 369, creditCost: 1, remaining: 23, cutoffLabel: "Order by 9:30 AM" },
  { id: "s2", date: iso(0), period: "lunch", meal: demoMeals.daal, price: 299, creditCost: 1, remaining: 18, cutoffLabel: "Order by 9:30 AM" },
  { id: "s3", date: iso(0), period: "dinner", meal: demoMeals.qeema, price: 379, creditCost: 1, remaining: 28, cutoffLabel: "Order by 3:30 PM" },
  { id: "s4", date: iso(1), period: "lunch", meal: demoMeals.pulao, price: 369, creditCost: 1, remaining: 35, cutoffLabel: "Order by 9:30 AM" },
  { id: "s5", date: iso(1), period: "dinner", meal: demoMeals.daal, price: 299, creditCost: 1, remaining: 31, cutoffLabel: "Order by 3:30 PM" }
];

export const demoPlans = [
  { id: "p1", name: "Starter 5", credits: 5, price: 1745, note: "Try the system without a monthly commitment.", validityDays: 30, bonusCredits: 0, active: true, featured: false },
  { id: "p2", name: "Flex 10", credits: 10, price: 3390, note: "Best for students with shifting schedules.", validityDays: 45, bonusCredits: 0, active: true, featured: true },
  { id: "p3", name: "Monthly 20", credits: 20, price: 6580, note: "For regular hostel and office routines.", validityDays: 60, bonusCredits: 0, active: true, featured: false }
];

export const demoOrders = [
  { id: "DL-1048", rawId: "demo-1048", date: iso(0), period: "Lunch", meal: "Home-style Chicken Karahi", hub: "UOL Hostel Hub", customer: "Awais Anjum", phone: "0300 0000000", status: "confirmed", credits: 1, cashTotal: 0 },
  { id: "DL-1031", rawId: "demo-1031", date: iso(-1), period: "Dinner", meal: "Aloo Qeema", hub: "UOL Hostel Hub", customer: "Hira Khan", phone: "0301 0000000", status: "delivered", credits: 1, cashTotal: 0 },
  { id: "DL-1017", rawId: "demo-1017", date: iso(-2), period: "Lunch", meal: "Daal Chana Bowl", hub: "Johar Town Work Hub", customer: "Saad Ali", phone: "0302 0000000", status: "packed", credits: 1, cashTotal: 0 }
];

export const demoCustomers = [
  { id: "c1", name: "Awais Anjum", phone: "0300 0000000", email: "awais@example.com", balance: 13, hub: "UOL Hostel Hub", blocked: false },
  { id: "c2", name: "Hira Khan", phone: "0301 0000000", email: "hira@example.com", balance: 4, hub: "Johar Town Work Hub", blocked: false },
  { id: "c3", name: "Saad Ali", phone: "0302 0000000", email: "saad@example.com", balance: 0, hub: "Valencia Community Hub", blocked: false },
  { id: "c4", name: "Maham Raza", phone: "0303 0000000", email: "maham@example.com", balance: 18, hub: "UOL Hostel Hub", blocked: false }
];

export const demoPayments = [
  { id: "pay_demo_001", customer: "Awais Anjum", method: "JazzCash", amount: 3390, reference: "TX884301", status: "pending", pack: "Flex 10" },
  { id: "pay_demo_002", customer: "Hira Khan", method: "Easypaisa", amount: 1745, reference: "EP110238", status: "pending", pack: "Starter 5" },
  { id: "pay_demo_003", customer: "Saad Ali", method: "Bank", amount: 6580, reference: "IBFT-4089", status: "pending", pack: "Monthly 20" }
];

export const demoAdmin = {
  revenue: 126450,
  ordersToday: 87,
  pendingPayments: 9,
  activeHubs: 6,
  lowRatings: 3,
  production: [
    { meal: "Chicken Karahi", regular: 42, protein: 8 },
    { meal: "Daal Chana", regular: 19, protein: 0 },
    { meal: "Aloo Qeema", regular: 18, protein: 4 }
  ]
};
