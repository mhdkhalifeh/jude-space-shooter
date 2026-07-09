import Phaser from "phaser";
import config from "./config";

import BootScene from "../scenes/BootScene";
import PreloadScene from "../scenes/PreloadScene";
import SplashScene from "../scenes/SplashScene";
import MenuScene from "../scenes/MenuScene";
import InfoScene from "../scenes/InfoScene";
import GameScene from "../scenes/GameScene";
import GameOverScene from "../scenes/GameOverScene";

const game = new Phaser.Game({
    ...config,
    scene: [
    BootScene,
    PreloadScene,
    SplashScene,
    MenuScene,
    InfoScene,
    GameScene,
    GameOverScene
]
});

export default game;