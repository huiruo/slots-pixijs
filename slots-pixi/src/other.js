import {
    Assets,
    BlurFilter,
    Color,
    Container,
    FillGradient,
    Graphics,
    Sprite, Text,
    TextStyle,
    Texture
} from "pixi.js";

import { app } from "./scenes/app.js";

export const initOther = async () => {

    let balance = 1000;
// Load the textures
    await Assets.load([
        'https://pixijs.com/assets/eggHead.png',
        'https://pixijs.com/assets/flowerTop.png',
        'https://pixijs.com/assets/helmlok.png',
        'https://pixijs.com/assets/skully.png',
    ]);

    const REEL_WIDTH = 160;
    const SYMBOL_SIZE = 150;

// Create different slot symbols
    const slotTextures = [
        Texture.from('https://pixijs.com/assets/eggHead.png'),
        Texture.from('https://pixijs.com/assets/flowerTop.png'),
        Texture.from('https://pixijs.com/assets/helmlok.png'),
        Texture.from('https://pixijs.com/assets/skully.png'),
    ];

// Build the reels
    const reels = [];
    const reelContainer = new Container();

    for (let i = 0; i < 5; i++) {
        const rc = new Container();

        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new BlurFilter(),
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        // Build the symbols
        for (let j = 0; j < 4; j++) {

            const square = new Graphics();
            square.rect(0, 0, SYMBOL_SIZE, SYMBOL_SIZE);
            square.fill('rgba(255,255,255,0.1)');

            const randomType = Math.floor(Math.random() * slotTextures.length);
            const symbol = new Sprite(slotTextures[randomType]);
            square.randomType = randomType;
            // Scale the symbol to fit symbol area.

            square.y = j * SYMBOL_SIZE + 20;

            square.width = square.height = SYMBOL_SIZE;
            square.x = Math.round((SYMBOL_SIZE - square.width) / 2);

            symbol.height = symbol.width = SYMBOL_SIZE - 10;
            symbol.x = 5;
            symbol.y = 5;

            square.addChild(symbol);

            reel.symbols.push(square);
            rc.addChild(square);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

// Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5) / 2;
    const top = new Graphics().rect(0, 0, app.screen.width, margin).fill({color: 0x0});
    const bottom = new Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({color: 0x0});

// Create gradient fill
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) => {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

// Add play text
    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: {fill},
        stroke: {color: 0x4a1850, width: 5},
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new Text('Spin the wheels!', style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

// Add header text
    const headerText = new Text('PIXI SLOTS', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    const balanceStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: {fill: 0x180c96},
        stroke: {color: 0x180c96, width: 5},
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const balanceText = new Text(String(balance) + '$', balanceStyle);
    balanceText.x = app.screen.width - 220;
    balanceText.y = app.screen.height - margin + Math.round((margin - balanceText.height) / 1.8);
    bottom.addChild(balanceText);

    const spinBtn = new Graphics().circle(
        app.screen.width - 80,
        app.screen.height - margin + 68,
        25).fill({color: 0xd61539})
// Set the interactivity.
    spinBtn.eventMode = 'static';
    spinBtn.cursor = 'pointer';
    spinBtn.addListener('pointerdown', () => {
        startPlay();
    });

    bottom.addChild(spinBtn);

    app.stage.addChild(top);
    app.stage.addChild(bottom);


    let running = false;

// Function to start playing.
    function startPlay() {
        showHeaderMessage('PIXI SLOTS')
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 40;
            const time = 1000 + i * 1000;

            tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

// Reels done handler.
    function reelsComplete() {
        running = false;

        checkReelsWin();
    }

    function hasMoreThanTwoDuplicates(arr) {
        const frequency = arr.reduce((acc, element) => {
            acc[element] = (acc[element] || 0) + 1;
            return acc;
        }, {});
        return Object.values(frequency).some(count => count > 2);
    }

    function checkReelsWin() {
        const values = reels.map(reel => reel.symbols[2].randomType);
        if (values.every((val, i, arr) => val === arr[0])) {
            showBigWin();
        }
        if (hasMoreThanTwoDuplicates(values)) {
            showBigWin();
        } else {
            showHeaderMessage('TRY AGAIN !');
            decreaseBalance()
        }
    }

    function decreaseBalance() {
        balance = balance - 20;
        balanceText.text = String(balance) + '$';
    }

    function increaseBalanceBy(win) {
        balance = balance + win;
        balanceText.text = String(balance) + '$';
    }

    function showBigWin() {
        shouldBlinkAndChangeColor = true;
        showHeaderMessage('BIG WIN !!!');
        increaseBalanceBy(100);
        setTimeout(() => {
            shouldBlinkAndChangeColor = false;
            reels.forEach(reel => {
                reel.symbols[2].getChildAt(0).tint = 0xffffff;
            })
        }, 2000);
    }

    function showSmallWin() {
        shouldBlink = true;
        showHeaderMessage('WIN !!!');
        setTimeout(() => {
            shouldBlink = false;
            reels.forEach(reel => {
                reel.symbols[2].visible = true;
                reel.symbols[2].fill('rgba(255,255,255,0.5)');
            })
        }, 800);
    }

    function showHeaderMessage(message) {
        headerText.text = message;
        headerText.x = Math.round((top.width - headerText.width) / 2);
        headerText.y = Math.round((margin - headerText.height) / 2);
    }

// Listen for animate update.
    app.ticker.add(() => {
        // Update the slots.
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            // Update blur filter y amount based on speed.
            // This would be better if calculated with time in mind also. Now blur depends on frame rate.

            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            // Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;

                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    // Detect going over and swap a texture.
                    // This should in proper product be determined from some logical reel.
                    const randomType = Math.floor(Math.random() * slotTextures.length);
                    s.getChildAt(0).texture = slotTextures[randomType];
                    s.randomType = randomType;

                    s.width = s.height = SYMBOL_SIZE;
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });

// Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening = [];

    function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        tweening.push(tween);

        return tween;
    }

// Listen for animate update.
    app.ticker.add(() => {
        const now = Date.now();
        const remove = [];

        for (let i = 0; i < tweening.length; i++) {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });

// Basic lerp funtion.
    function lerp(a1, a2, t) {
        return a1 * (1 - t) + a2 * t;
    }

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount) {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
    }

    let blinkSpeed = 0.1;  // How fast it blinks (lower = faster)
    let visibilityCounter = 0;  // Counter for controlling visibility
    let shouldBlink = false; // Condition to start blinking
    let shouldBlinkAndChangeColor = false;

    app.ticker.add(() => {
        if (shouldBlink) { // Only blink when the condition is true
            // Increment the counter
            visibilityCounter += blinkSpeed;

            // Toggle visibility based on the counter
            if (visibilityCounter >= 1) {
                reels.forEach(reel => {
                    reel.symbols[2].visible = !reel.symbols[2].visible;  // Toggle visibility
                    visibilityCounter = 0;
                })
            }
        }
    });

    let tinted = false;

    app.ticker.add(() => {
        if (shouldBlinkAndChangeColor) { // Only blink when the condition is true
            // Increment the counter
            visibilityCounter += blinkSpeed;
            console.log(blinkSpeed);
            tinted = !tinted;

            // Toggle visibility based on the counter
            if (visibilityCounter >= 1) {
                reels.forEach(reel => {
                    const random = Math.floor(Math.random() * 256);
                    reel.symbols[2].getChildAt(0).tint = tinted ? 0xcf1919 : 0xffffff;
                    visibilityCounter = 0;
                })
            }
        }
    });

}
