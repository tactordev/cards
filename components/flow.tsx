"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import { Deck } from "@/components/deck";
import { CardWindow } from "@/components/cw";

type Actions = {
    id: number;

}



class Game {
    public deck: Deck; 
    public nw: NotificationWindow;
    public cw: CardWindow;
    private action: [number, string, string, number]; // actionId, person, action, config
    private setAction: (action: [number, string, string, number]) => void;

    constructor(action: [number, string, string, number], setAction: (action: [number, string, string, number]) => void, opponentKnows: {location: string, card: [string, string]}[], setOpponentKnows: (opponentKnows: {location: string, card: [string, string]}[]) => void, nw: NotificationWindow, cw: CardWindow) {
        this.nw = nw;
        this.cw = cw;
        this.deck = new Deck(this.nw, this.cw, this);
        this.action = action;
        this.setAction = setAction;
    }

    isPlayerTurn() {
        if (this.action[2] === "both" || this.action[1] === "player") return true;
        return false;
    }

    isOpponentTurn() {
        if (this.action[2] === "both" || this.action[1] === "opponent") return true;
        return false;
    }

    simulateOpponentTurn() {
        // unfinished
        return null;
    }

    getActionType() {
        return this.action[1];
    }
}




export type { Actions };
export { Game };