import type { LucideIcon } from "lucide-react";
import {
  Truck, Utensils, Coffee, Scissors, Sparkles, Heart,
  Dumbbell, Wrench, Zap, Code, Camera, Briefcase, Scale,
  Stethoscope, Shield, Car, Cookie, GraduationCap, Music,
  Home, Hammer, Leaf, Plane, Printer, Calculator, Megaphone,
  Package, ShoppingBag, Star, Wine, Wifi, Palette, Baby,
  Bike, Watch, PawPrint, BookOpen, Building2, Shirt,
  ChefHat, SprayCan, Paintbrush,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  // Food & drink
  [/pizza|italian|burger|sandwich|fast.?food/i, ChefHat],
  [/coffee|cafe|espresso|latte|brew|tea|barista/i, Coffee],
  [/restaurant|food|meal|dine|dining|eat|cuisine|bistro/i, Utensils],
  [/bar|wine|cocktail|beer|drink|pub|spirits/i, Wine],
  [/bak|cake|bread|pastry|confect|dessert|sweet/i, Cookie],
  [/cater|chef|cook/i, ChefHat],

  // Beauty & wellness
  [/hair|salon|barber|cut|blow|style|colour|color/i, Scissors],
  [/nail|manicure|pedicure|facial|beauty|cosmetic|makeup/i, Sparkles],
  [/massage|spa|relax|wellness|therapy|holistic/i, Heart],

  // Health & fitness
  [/doctor|medic|health|clinic|hospital|physio|chiropract|pharmacy/i, Stethoscope],
  [/dental|teeth|dentist|orthodon/i, Stethoscope],
  [/gym|fitness|workout|training|exercise|weight|crossfit/i, Dumbbell],

  // Home & construction
  [/plumb|pipe|drain|water|boiler|leak/i, Wrench],
  [/electri|power|lighting|wiring|solar|panel/i, Zap],
  [/construct|build|renovate|remodel|contract/i, Hammer],
  [/paint|decor|colour|color|mural/i, Paintbrush],
  [/clean|wash|laundry|maid|janitor|hygiene/i, SprayCan],
  [/home|house|interior|furniture|room/i, Home],
  [/garden|landscap|plant|tree|lawn|outdoor|turf/i, Leaf],
  [/security|protect|guard|surveil|alarm|cctv/i, Shield],

  // Tech & business
  [/code|web|software|app|dev|digital|program/i, Code],
  [/consult|strateg|advisor|manag|business/i, Briefcase],
  [/market|social.media|seo|advert|promot/i, Megaphone],
  [/account|tax|financ|book|audit|payroll/i, Calculator],
  [/print|copy|scan|publish|banner/i, Printer],
  [/wifi|internet|network|broadband|it.support/i, Wifi],

  // Creative & media
  [/photo|camera|video|film|shoot|portrait|wedding/i, Camera],
  [/design|art|creative|graphic|brand|logo/i, Palette],
  [/music|sound|audio|dj|band|record|studio/i, Music],

  // Education
  [/school|teach|tutor|educat|learn|cours|train|class/i, GraduationCap],
  [/book|librar|read|publish|writ/i, BookOpen],

  // Transport & logistics
  [/deliver|ship|courier|dispatch|logistic/i, Truck],
  [/car|auto|vehicle|mechanic|tyre|service|repair/i, Car],
  [/bike|cycle|bicycle/i, Bike],
  [/travel|tour|hotel|accommodat|hostel|resort/i, Plane],
  [/package|storage|warehouse|parcel|movig/i, Package],

  // Retail & fashion
  [/cloth|fashion|apparel|shirt|wear|boutique|tailor/i, Shirt],
  [/shop|retail|store|commerc|market/i, ShoppingBag],
  [/jewel|watch|accessory|luxury|ring/i, Watch],

  // Legal & property
  [/legal|law|attorney|solicitor|court|notary/i, Scale],
  [/real.?estate|property|rent|estate.?agent|letting|mortgage/i, Building2],

  // Children & animals
  [/baby|child|kids|nursery|nanny|daycare/i, Baby],
  [/pet|dog|cat|animal|vet|groom/i, PawPrint],
];

export function matchServiceIcon(title: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(title)) return icon;
  }
  return Star;
}
