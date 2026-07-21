export const SHIP_RARITIES = {
    COMMON: {
        id: "common",
        label: "COMMON",
        color: 0x94a3b8,
        hex: "#94A3B8"
    },

    RARE: {
        id: "rare",
        label: "RARE",
        color: 0x38bdf8,
        hex: "#38BDF8"
    },

    EPIC: {
        id: "epic",
        label: "EPIC",
        color: 0xa78bfa,
        hex: "#A78BFA"
    },

    LEGENDARY: {
        id: "legendary",
        label: "LEGENDARY",
        color: 0xfacc15,
        hex: "#FACC15"
    },

    MYTHIC: {
        id: "mythic",
        label: "MYTHIC",
        color: 0xf97316,
        hex: "#F97316"
    },

    ULTIMATE: {
        id: "ultimate",
        label: "ULTIMATE",
        color: 0xef4444,
        hex: "#EF4444"
    }
};

export const SHIP_CATALOG = [
    {
        id: "vanguard",
        name: "JUDE VANGUARD",
        className: "BALANCED STRIKE FIGHTER",
        rarity: SHIP_RARITIES.COMMON.label,

        texture: "player",
        tint: 0x38bdf8,

        price: 0,
        unlockLevel: 1,

        description:
            "The standard JUDE fleet fighter. Reliable, responsive, and balanced for every combat sector.",

        ability:
            "TACTICAL BALANCE",

        stats: {
            damage: 1.0,
            fireRate: 1.0,
            speed: 1.0,
            shield: 1.0
        }
    },

    {
        id: "phantom",
        name: "PHANTOM-X",
        className: "STEALTH INTERCEPTOR",
        rarity: SHIP_RARITIES.RARE.label,

        texture: "ship_phantom",
        tint: 0x22d3ee,

        price: 12000,
        unlockLevel: 4,

        description:
            "A lightweight stealth interceptor built for aggressive movement and rapid target acquisition.",

        ability:
            "PHASE ACCELERATION",

        stats: {
            damage: 1.12,
            fireRate: 1.18,
            speed: 1.42,
            shield: 0.82
        }
    },

    {
        id: "eclipse",
        name: "ECLIPSE MK-II",
        className: "HEAVY ASSAULT FIGHTER",
        rarity: SHIP_RARITIES.EPIC.label,

        texture: "ship_eclipse",
        tint: 0xef4444,

        price: 28000,
        unlockLevel: 8,

        description:
            "A heavily armed assault craft designed to overwhelm enemy formations with sustained plasma fire.",

        ability:
            "CRIMSON OVERDRIVE",

        stats: {
            damage: 1.42,
            fireRate: 1.12,
            speed: 0.92,
            shield: 1.2
        }
    },

    {
        id: "spectre",
        name: "SPECTRE-7",
        className: "QUANTUM INTERCEPTOR",
        rarity: SHIP_RARITIES.EPIC.label,

        texture: "ship_spectre",
        tint: 0x60a5fa,

        price: 42000,
        unlockLevel: 12,

        description:
            "An ultra-fast interceptor using experimental quantum thrusters to evade dense projectile patterns.",

        ability:
            "QUANTUM DASH",

        stats: {
            damage: 1.18,
            fireRate: 1.38,
            speed: 1.58,
            shield: 0.88
        }
    },

    {
        id: "guardian",
        name: "GUARDIAN AEGIS",
        className: "DEFENSIVE CRUISER",
        rarity: SHIP_RARITIES.LEGENDARY.label,

        texture: "ship_guardian",
        tint: 0x22c55e,

        price: 65000,
        unlockLevel: 16,

        description:
            "A royal defensive cruiser reinforced with an advanced Aegis energy field and heavy armor plating.",

        ability:
            "AEGIS SHIELD MATRIX",

        stats: {
            damage: 1.24,
            fireRate: 0.98,
            speed: 0.86,
            shield: 1.65
        }
    },

    {
        id: "nova",
        name: "NOVA REAPER",
        className: "HEAVY DESTROYER",
        rarity: SHIP_RARITIES.MYTHIC.label,

        texture: "ship_nova",
        tint: 0xf97316,

        price: 95000,
        unlockLevel: 22,

        description:
            "A brutal destroyer powered by a volatile nova reactor. Built to eliminate bosses and armored targets.",

        ability:
            "NOVA BARRAGE",

        stats: {
            damage: 1.72,
            fireRate: 1.08,
            speed: 0.84,
            shield: 1.38
        }
    },

    {
        id: "titan",
        name: "TITAN PRIME",
        className: "LEGENDARY FLAGSHIP",
        rarity: SHIP_RARITIES.ULTIMATE.label,

        texture: "ship_titan",
        tint: 0xfacc15,

        price: 150000,
        unlockLevel: 30,

        description:
            "The supreme JUDE flagship. Massive firepower, reinforced shielding, and elite command technology.",

        ability:
            "QUANTUM ANNIHILATION",

        stats: {
            damage: 1.8,
            fireRate: 1.28,
            speed: 1.02,
            shield: 1.72
        }
    }
];

export function getShipById(shipId = "vanguard") {
    return (
        SHIP_CATALOG.find(
            (ship) => ship.id === shipId
        ) ||
        SHIP_CATALOG[0]
    );
}

export function getShipIndex(shipId = "vanguard") {
    const index = SHIP_CATALOG.findIndex(
        (ship) => ship.id === shipId
    );

    return index >= 0 ? index : 0;
}

export function getShipsByRarity(rarity) {
    if (!rarity) {
        return [...SHIP_CATALOG];
    }

    const normalized =
        String(rarity).toUpperCase();

    return SHIP_CATALOG.filter(
        (ship) =>
            String(ship.rarity).toUpperCase() ===
            normalized
    );
}

export function getUnlockedShipsForLevel(level = 1) {
    const safeLevel = Math.max(
        1,
        Number(level) || 1
    );

    return SHIP_CATALOG.filter(
        (ship) =>
            safeLevel >= ship.unlockLevel
    );
}

export function isValidShipId(shipId) {
    return SHIP_CATALOG.some(
        (ship) => ship.id === shipId
    );
}