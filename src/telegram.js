import WebApp from "@twa-dev/sdk";


export function initTelegram(){

    WebApp.ready();

    WebApp.expand();

    return WebApp;

}