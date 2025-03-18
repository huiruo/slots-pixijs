import {
    Application
} from "pixi.js";

// Create a new application
export const app = new Application();

export const initApp = async () => {
    globalThis.__PIXI_APP__ = app;

    // Initialize the application
    await app.init({ background: '#1099bb', width: 920, height: 720 });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);
}

