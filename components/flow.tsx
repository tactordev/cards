"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import { Deck } from "@/components/deck";
import { CardWindow } from "@/components/cw";
import { FaceUpCard } from "./card";

type Action = {
    agent: "player" | "opponent" | "both";
    type: "start" | "pickup" | "discard" | "jack" | "jack-snapped" | "queen" | "queen-snapped" | "king" | "king-snapped";
    config: number;
}



class Game {
    public deck: Deck; 
    public nw: NotificationWindow;
    public cw: CardWindow;
    public action: Action;
    public setAction: (action: Action) => void;
    public discarded: FaceUpCard[];
    public setDiscarded: (discarded: FaceUpCard[]) => void;

    constructor(action: Action, setAction: (action: Action) => void, opponentKnows: {location: string, card: [string, string]}[], setOpponentKnows: (opponentKnows: {location: string, card: [string, string]}[]) => void, nw: NotificationWindow, cw: CardWindow, discarded: FaceUpCard[], setDiscarded: (discarded: FaceUpCard[]) => void) {
        this.nw = nw;
        this.cw = cw;
        this.deck = new Deck(this.nw, this.cw, this);
        this.action = action;
        this.setAction = (nextAction: Action) => {
            this.action = nextAction;
            setAction(nextAction);
        };
        this.discarded = discarded;
        this.setDiscarded = (newDiscarded: FaceUpCard[]) => {
            this.discarded = newDiscarded;
            setDiscarded(newDiscarded);
        };
    }

    isPlayerTurn() {
        if (this.action.agent === "both" || this.action.agent === "player") return true;
        return false;
    }

    isOpponentTurn() {
        if (this.action.agent === "both" || this.action.agent === "opponent") return true;
        return false;
    }

    simulateOpponentTurn() {
        // pickup card
        // randomly discard a card


        // pickup
        const newCard = this.deck.draw();
        if (!newCard) {
            this.nw.post("The deck is empty. Opponent cannot draw a card. Automatic deck reshuffling is not implemented yet.", "warning");
            this.nw.post("Your total: " + this.deck.user.map(card => card[0]).reduce((sum, rank) => {
                if (rank === "A") return sum + 1;
                else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                else return sum + parseInt(rank);
            }, 0), "info");
            this.nw.post("Opponent's total: " + this.deck.opponent.map(card => card[0]).reduce((sum, rank) => {
                if (rank === "A") return sum + 1;
                else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                else return sum + parseInt(rank);
            }, 0), "info");
            return;
        }

        // discarding
        const randomNum = Math.floor(Math.random() * 4);
        const cardToDiscard = this.deck.opponent[randomNum];
        const newDiscarded = [...this.discarded, new FaceUpCard(cardToDiscard[0], cardToDiscard[1], this, this.nw, this.cw)];
        this.setDiscarded(newDiscarded);
        const cardPos = this.deck.opponent.indexOf(cardToDiscard);
        this.deck.opponent.splice(cardPos, 1, newCard);
        this.triggerNextAction();
        this.triggerNextAction();
    }

    getActionType() {
        return this.action.type;
    }

    getActionConfig() {
        return this.action.config;
    }

    triggerNextAction() {
        if (this.action.type === "start") {
            this.setAction({
                agent: "player",
                type: "pickup",
                config: 1,
            });
            this.nw.post("It is now your turn. Pick up a card from the deck.", "info");
        } else if (this.action.type === "pickup") {
            this.setAction({
                agent: this.action.agent,
                type: "discard",
                config: 1,
            });
            this.nw.post("Discard a card from your hand.", "info");
        } else if (this.action.type === "discard") {
            this.setAction({
                agent: this.action.agent === "player" ? "opponent" : "player",
                type: "pickup",
                config: 1,
            });
            this.nw.post(`It is now ${this.isPlayerTurn() ? "your" : "opponent's"} turn. ${this.isPlayerTurn() ? "Pick up a card from the deck." : "Opponent is picking up a card..."}`, "info");
            if (this.isOpponentTurn()) {
                setTimeout(() => {
                    this.simulateOpponentTurn();
                }, 500);
            }
        } else if (this.action.type === "jack" || this.action.type === "queen" || this.action.type === "king") {
            this.setAction({
                agent: this.action.agent === "player" ? "opponent" : "player",
                type: "pickup",
                config: 1,
            });
        } else if (this.action.type === "jack-snapped" || this.action.type === "queen-snapped" || this.action.type === "king-snapped") {
            this.setAction({
                agent: this.action.agent === "player" ? "opponent" : "player",
                type: "pickup",
                config: 1,
            });
        }

    }

}




export type { Action };
export { Game };