export const SHIP_CATALOG = [
    {
        id: "vanguard",
        name: "JUDE VANGUARD",
        className: "BALANCED INTERCEPTOR",
        rarity: "COMMON",
        price: 0,
        unlockLevel: 1,
        texture: "player",
        tint: 0xffffff,
        description: "Reliable, responsive and battle-tested. The standard JUDE fleet interceptor.",
        ability: "Balanced Frame",
        stats: { damage: 1.0, fireRate: 1.0, speed: 1.0, shield: 1.0 }
    },
    {
        id: "phantom",
        name: "PHANTOM-X",
        className: "STEALTH STRIKER",
        rarity: "RARE",
        price: 12000,
        unlockLevel: 3,
        texture: "ship_phantom",
        tint: 0xffffff,
        description: "A needle-fast stealth frame tuned for evasive pilots and sustained fire.",
        ability: "Phase Thrusters",
        stats: { damage: 0.9, fireRate: 1.2, speed: 1.28, shield: 0.82 }
    },
    {
        id: "eclipse",
        name: "ECLIPSE MK-II",
        className: "PLASMA ASSAULT",
        rarity: "EPIC",
        price: 35000,
        unlockLevel: 8,
        texture: "ship_eclipse",
        tint: 0xffffff,
        description: "A high-output assault craft with amplified plasma systems and reinforced plating.",
        ability: "Plasma Surge",
        stats: { damage: 1.3, fireRate: 1.06, speed: 0.96, shield: 1.18 }
    },
    {
        id: "spectre",
        name: "SPECTRE-7",
        className: "VOID RECON",
        rarity: "EPIC",
        price: 52000,
        unlockLevel: 11,
        texture: "ship_spectre",
        tint: 0xffffff,
        description: "A compact recon fighter with precise handling and exceptional burst mobility.",
        ability: "Ghost Vector",
        stats: { damage: 1.12, fireRate: 1.16, speed: 1.36, shield: 0.9 }
    },
    {
        id: "guardian",
        name: "GUARDIAN AEGIS",
        className: "DEFENSE CORVETTE",
        rarity: "EPIC",
        price: 68000,
        unlockLevel: 13,
        texture: "ship_guardian",
        tint: 0xffffff,
        description: "A reinforced defense craft built to survive dense projectile fields and long sorties.",
        ability: "Aegis Matrix",
        stats: { damage: 1.08, fireRate: 0.98, speed: 0.9, shield: 1.48 }
    },
    {
        id: "nova",
        name: "NOVA REAPER",
        className: "HIGH-RISK ASSAULT",
        rarity: "LEGENDARY",
        price: 84000,
        unlockLevel: 16,
        texture: "ship_nova",
        tint: 0xffffff,
        description: "An unstable attack platform that trades protection for devastating weapon output.",
        ability: "Nova Overload",
        stats: { damage: 1.62, fireRate: 1.12, speed: 1.04, shield: 0.72 }
    },
    {
        id: "titan",
        name: "TITAN PRIME",
        className: "HEAVY DREADWING",
        rarity: "MYTHIC",
        price: 120000,
        unlockLevel: 20,
        texture: "ship_titan",
        tint: 0xffffff,
        description: "A mythic heavy fighter engineered to survive impossible sectors and crush bosses.",
        ability: "Dreadnought Core",
        stats: { damage: 1.58, fireRate: 0.94, speed: 0.8, shield: 1.72 }
    }
];

export function getShipById(id) {
    return SHIP_CATALOG.find((ship) => ship.id === id) || SHIP_CATALOG[0];
}
