// Curated Unsplash photo IDs per business category.
// Format: https://images.unsplash.com/photo-{id}?w=1600&q=80
// No API key required — direct CDN access.

export const CATEGORIES = [
  // Food & Drink
  "Restaurant", "Cafe & Coffee", "Bakery", "Bar & Pub", "Fast Food",
  "Pizza", "Sushi & Japanese", "Seafood Restaurant", "Food Truck",
  "Catering", "Ice Cream & Desserts", "Juice Bar", "Wine & Spirits",
  "Brewery & Craft Beer", "Buffet & Brunch",
  // Accommodation
  "Hotel", "Motel", "Hostel", "Bed & Breakfast", "Resort",
  "Vacation Rental", "Serviced Apartments",
  // Health & Medical
  "Medical & Clinic", "Dental", "Pharmacy", "Optician",
  "Physiotherapy", "Chiropractic", "Mental Health & Therapy",
  "Pediatrics", "Nutritionist & Dietitian", "Hospital",
  // Veterinary & Pets
  "Veterinary", "Pet Store", "Pet Grooming", "Dog Training",
  // Beauty & Wellness
  "Salon & Beauty", "Spa & Wellness", "Barbershop",
  "Nail Studio", "Tattoo & Piercing", "Massage Therapy",
  "Eyebrow & Lash Studio", "Skin Care Clinic",
  // Fitness & Sports
  "Gym & Fitness", "Personal Training", "CrossFit", "Yoga Studio",
  "Pilates", "Martial Arts", "Dance Studio", "Swimming Pool",
  "Sports Club",
  // Professional Services
  "Law Firm", "Accounting & Finance", "Business Consulting",
  "HR & Recruitment", "Insurance Agency", "Financial Advisor",
  "Translation Services", "Notary",
  // Real Estate & Property
  "Real Estate", "Property Management", "Architecture",
  "Interior Design",
  // Technology & Digital
  "Technology", "Web Development", "IT Support & MSP",
  "Software Agency", "Digital Marketing", "SEO Agency",
  "Cybersecurity",
  // Education & Training
  "Education", "Tutoring", "Language School", "Driving School",
  "Music School", "Art School", "Coding Bootcamp",
  "Childcare & Nursery", "Preschool & Kindergarten",
  // Creative & Media
  "Photography", "Videography & Film", "Graphic Design",
  "Print & Copy", "Art Gallery", "Music Studio",
  "Podcast Studio", "Advertising Agency",
  // Construction & Trades
  "Construction", "Landscaping & Gardening", "Plumbing",
  "Electrical", "HVAC & Air Conditioning", "Painting & Decorating",
  "Roofing", "Flooring", "Carpentry & Joinery",
  "Security Systems",
  // Home & Furniture
  "Furniture & Home Decor", "Appliance Repair",
  "Pest Control", "Locksmith",
  // Cleaning
  "Cleaning Service", "Laundry & Dry Cleaning",
  // Auto & Transport
  "Auto & Car", "Car Dealership", "Auto Repair & Garage",
  "Car Wash & Detailing", "Tire Shop", "Towing Service",
  "Taxi & Rideshare", "Moving & Storage",
  "Courier & Delivery",
  // Retail & Shopping
  "Retail & Shop", "Clothing & Fashion", "Jewelry Store",
  "Electronics", "Bookstore", "Toy Store",
  "Sports & Outdoor", "Florist", "Gift Shop",
  "Supermarket & Grocery", "Hardware Store",
  // Events & Entertainment
  "Event Venue", "Wedding Services", "DJ & Entertainment",
  "Party & Event Planning", "Escape Room", "Cinema & Theatre",
  "Amusement & Recreation",
  // Logistics & Industry
  "Transport & Logistics", "Warehousing & Storage",
  "Manufacturing", "Printing & Signage",
  // Other
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

const PHOTO_MAP: Record<string, string[]> = {
  "Restaurant": [
    "1414235077428-338989a2e8c0",
    "1517248135467-4c7edcad34c4",
    "1466978913421-dad2ebd01d17",
    "1424847651672-bf20a4b0982b",
    "1550966871-3ed3cdb5ed0c",
  ],
  "Cafe & Coffee": [
    "1495474472287-4d71bcdd2085",
    "1442512595331-8f55af7b22a9",
    "1511920170033-f8396924c348",
    "1509042239860-f550ce710b93",
    "1572286258217-40f8f7b5f2e7",
  ],
  "Bakery": [
    "1509440159596-0249088772ff",
    "1555507036-ab1f4038808a",
    "1558961363-fa8fdf82db35",
    "1486427944299-d1955d23e34d",
    "1549931319-a545dcf3bc73",
  ],
  "Hotel": [
    "1566073771259-470dba7f0b03",
    "1582719508461-905c673771fd",
    "1520250497591-112f2f40a3f4",
    "1551882547-ff40c63fe294",
    "1445019980597-93fa8acb246c",
  ],
  "Gym & Fitness": [
    "1534438327276-14e5300c3a48",
    "1540497077202-7c8a3999166f",
    "1571019613454-1cb2f99b2d8b",
    "1517836357463-d25dfeac3438",
    "1593079831268-3381b0db4a77",
  ],
  "Salon & Beauty": [
    "1522337360788-8b13dee7a37e",
    "1560066984-138dadb4c035",
    "1562322140-8baeececf3df",
    "1595476108010-b4d1f102b1b1",
    "1487412912498-0447578fcca8",
  ],
  "Spa & Wellness": [
    "1544161515-4ab6ce6db874",
    "1540555700478-4be290a4dba7",
    "1600334129128-685c5582fd35",
    "1570172619644-dfd03ed5d881",
    "1519823551278-64ac92734fb1",
  ],
  "Medical & Clinic": [
    "1519494026892-80bbd2d6fd0d",
    "1579684385127-1ef15d508118",
    "1516549655169-df83a0774514",
    "1581595219315-a187dd40c322",
    "1551076805-e1869033e2a5",
  ],
  "Dental": [
    "1588776814546-1ffbb3cd01b5",
    "1606811971618-4486d14f3f99",
    "1609840114035-3c981b782dfe",
    "1598256989800-fe5f95da9787",
    "1629909613654-8b03d986f5b1",
  ],
  "Law Firm": [
    "1589829545856-d10d557cf95f",
    "1450101499163-c8848c66ca85",
    "1521791055366-0d553872b420",
    "1507679799987-c73779587ccf",
    "1479142506502-19a3a0552c2f",
  ],
  "Real Estate": [
    "1560518883-ce09059eeffa",
    "1568605114967-8130f3a36994",
    "1582268611958-ebfd161ef9cf",
    "1600596542815-ffad4c1539a9",
    "1512917774080-9991f1c4c750",
  ],
  "Retail & Shop": [
    "1441986300917-64674bd600d8",
    "1534452203293-494d7ddbf7e5",
    "1607082348824-0a96f2a4b9da",
    "1472851294608-ac4ea3b12b64",
    "1555529669-e69e7aa0ba9a",
  ],
  "Photography": [
    "1516035069371-29a1b244cc32",
    "1554048612-b6a482bc67e5",
    "1502982720700-bfff97f2ecac",
    "1493863641943-9b68992a8d07",
    "1452780212582-fd463a6ea638",
  ],
  "Construction": [
    "1504307651254-35680f356dfd",
    "1541976590-7133a73e9799",
    "1581094794329-c811af7e2e91",
    "1565008887536-634e4ef6e0a5",
    "1590644365607-9280e47ce04e",
  ],
  "Cleaning Service": [
    "1581578731548-c64695cc6952",
    "1527515637-1ab0dd77a28d",
    "1584820927498-cad076eae13c",
    "1563453392212-326f5e854473",
    "1556909114-44e3e70034e2",
  ],
  "Auto & Car": [
    "1492144534655-ae79c964c9d7",
    "1503376780353-7e6692767b70",
    "1542282088-72c9c27ed0cd",
    "1555215695-3004980ad54d",
    "1461023058943-8d3664bcbad3",
  ],
  "Technology": [
    "1518770660439-4636190af475",
    "1517694712202-14dd9538aa97",
    "1550751827-4bd374173b87",
    "1531297484001-80022131f5a1",
    "1504868584819-f8a8b707c87e",
  ],
  "Education": [
    "1503676260728-1c00da094a0b",
    "1523050854058-8df90110c9f1",
    "1509062522246-3755977927d7",
    "1522202176988-66273c2fd55f",
    "1427504494785-3a9ca7044f45",
  ],
  "Event Venue": [
    "1519167758481-83f550bb49b3",
    "1464366400600-7168b8af9bc3",
    "1478146059778-26b72b8c7b89",
    "1540575467063-178a50c2df87",
    "1511578314322-379afb476865",
  ],
  "Other": [
    "1497366216548-37526070297c",
    "1497366811353-6870744d04b2",
    "1486406146926-c627a92ad1ab",
    "1504384308090-c5d1a1fb4875",
    "1431540015396-2b89a00f4d93",
  ],
};

export function getImagesForCategory(category: string): string[] {
  const key = (Object.keys(PHOTO_MAP).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  ) ?? "Other") as keyof typeof PHOTO_MAP;

  return (PHOTO_MAP[key] ?? PHOTO_MAP["Other"]).map(
    (id) => `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`
  );
}

export function getHeroImage(category: string): string {
  return getImagesForCategory(category)[0];
}

export function unsplashUrl(id: string, w = 1600): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}
