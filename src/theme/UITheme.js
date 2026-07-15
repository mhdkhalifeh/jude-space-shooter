export const UITheme = {
    fonts: {
        title: '"Oxanium", "Segoe UI", sans-serif',
        body: '"Rajdhani", "Segoe UI", sans-serif',
        mono: '"Orbitron", "Oxanium", sans-serif'
    },
    colors: {
        bg: 0x020617,
        panel: 0x07111f,
        panelAlt: 0x0b1728,
        cyan: 0x38bdf8,
        cyanSoft: 0x7dd3fc,
        purple: 0xa78bfa,
        green: 0x22c55e,
        red: 0xef4444,
        gold: 0xfacc15,
        white: 0xf8fafc,
        muted: 0x94a3b8
    },
    text: {
        title: {
            fontFamily: '"Oxanium", "Segoe UI", sans-serif',
            fontStyle: "700",
            color: "#F8FAFC",
            stroke: "#020617",
            strokeThickness: 6
        },
        body: {
            fontFamily: '"Rajdhani", "Segoe UI", sans-serif',
            fontStyle: "600",
            color: "#CBD5E1"
        },
        mono: {
            fontFamily: '"Orbitron", "Oxanium", sans-serif',
            fontStyle: "600",
            color: "#FFFFFF"
        }
    }
};

export function addSciFiPanel(scene, x, y, width, height, options = {}) {
    const color = options.color ?? UITheme.colors.cyan;
    const alpha = options.alpha ?? 0.9;
    const depth = options.depth ?? 20;

    const container = scene.add.container(x, y)
        .setDepth(depth)
        .setSize(width, height);

    const shadow = scene.add.rectangle(8, 10, width, height, 0x000000, 0.38);
    const outer = scene.add.rectangle(0, 0, width + 10, height + 10, 0x000000, 0)
        .setStrokeStyle(1, color, 0.2);
    const panel = scene.add.rectangle(0, 0, width, height, UITheme.colors.panel, alpha)
        .setStrokeStyle(2, color, 0.72);

    const corner = 16;
    const lines = [
        scene.add.rectangle(-width / 2 + corner / 2, -height / 2, corner, 3, color, 0.95),
        scene.add.rectangle(width / 2 - corner / 2, -height / 2, corner, 3, color, 0.95),
        scene.add.rectangle(-width / 2 + corner / 2, height / 2, corner, 3, color, 0.95),
        scene.add.rectangle(width / 2 - corner / 2, height / 2, corner, 3, color, 0.95)
    ];

    container.add([shadow, outer, panel, ...lines]);
    container.panel = panel;
    return container;
}
