"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import { Deck } from "@/components/deck";
import { CardWindow } from "@/components/cw";
import { FaceUpCard } from "./card";

type Action = {
    agent: "player" | "opponent" | "both";
    type: "start" | "pickup" | "discard" | "snap" | "jack" | "jack-snapped" | "queen" | "queen-snapped" | "black_king" | "black_king-snapped";
    config: {
        amount: number;
        next: "player" | "opponent";
    };
} // action type



class Game {

    // attributes
    public deck: Deck; 
    public nw: NotificationWindow;
    public cw: CardWindow;
    public action: Action;
    public setAction: (action: Action) => void;
    public discarded: FaceUpCard[];
    public setDiscarded: (discarded: FaceUpCard[]) => void;
    public snapTimer: number;
    public setSnapTimer: (timer: number) => void;
    private snapTimeoutId: ReturnType<typeof setTimeout> | null;
    private snapIntervalId: ReturnType<typeof setInterval> | null;

    constructor(action: Action, setAction: (action: Action) => void, opponentKnows: {location: string, card: [string, string]}[], setOpponentKnows: (opponentKnows: {location: string, card: [string, string]}[]) => void, nw: NotificationWindow, cw: CardWindow, discarded: FaceUpCard[], setDiscarded: (discarded: FaceUpCard[]) => void, snapTimer: number, setSnapTimer: (timer: number) => void) {
        // attributes
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
        this.snapTimer = snapTimer;
        this.setSnapTimer = (timer: number) => {
            this.snapTimer = timer;
            setSnapTimer(timer);
        };
        this.snapTimeoutId = null;
        this.snapIntervalId = null;
    }

    isPlayerTurn() { // checks if it is the player's turn (obv)
        if (this.action.agent === "both" || this.action.agent === "player") return true;
        return false;
    }

    isOpponentTurn() { // take a wild guess
        if (this.action.agent === "both" || this.action.agent === "opponent") return true;
        return false;
    }

    simulateOpponentTurn() { // simulates opponent's turn. no real strategy involved, all random. maybe I'll add strategy in the future but idk how to make something that's balanced.
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

    getActionType() { // get the type of action
        return this.action.type;
    }

    getActionConfig() { // get the config for the current action
        return this.action.config;
    }

    triggerNextAction() { // increment to the next action
        if (this.action.type === "start") {
            this.setAction({
                agent: "player",
                type: "pickup",
                config: {
                    amount: 1,
                    next: "player",
                }
            }); // always sets it to 1. there is a check in card.tsx which will change from start to pickup when the start is finished
            this.nw.post("It is now your turn. Pick up a card from the deck.", "info");


        } else if (this.action.type === "pickup") { // pick up card --> discard a card
            this.setAction({
                agent: this.action.config.next,
                type: "discard",
                config: {
                    amount: 1,
                    next: this.action.config.next,
                },
            });
            this.nw.post("Discard a card from your hand.", "info");



        } else if (this.action.type === "discard") { // discard a card --> switch turns (in future: special card action, snap, then switch turns)
            this.setAction({
                agent: "both",
                type: "snap",
                config: {
                    amount: -1,
                    next: this.action.agent === "player" ? "opponent" : "player",
                },
            });

            this.nw.post("A card has been discarded. If you have a card of the same rank, you can snap it to also discard it. You only have 5 seconds to snap!", "info");
            this.setSnapTimer(5);
            this.snapTimeoutId = setTimeout(() => {
                this.setSnapTimer(0);
            }, 5000);
            this.snapIntervalId = setInterval(() => {
                if (this.snapTimer > 0) {
                    this.setSnapTimer(this.snapTimer - 1);
                }

                if (this.snapTimer === 0) {
                    this.setSnapTimer(0);
                    if (this.snapTimeoutId) {
                        clearTimeout(this.snapTimeoutId);
                        this.snapTimeoutId = null;
                    }
                    if (this.snapIntervalId) {
                        clearInterval(this.snapIntervalId);
                        this.snapIntervalId = null;
                    }

                    this.nw.post(`You can no longer snap.`, "info");
                    this.triggerNextAction();
                }
            }, 1000);
        } else if (this.action.type === "snap") { // snap timer finished
            this.setAction({
                agent: this.action.config.next,
                type: "pickup",
                config: {
                    amount: 1,
                    next: this.action.config.next,
                },
            });
            this.nw.post(`It is now your ${this.isPlayerTurn() ? "" : "opponent's"} turn. ${this.isPlayerTurn() ? "Pick up a card from the deck." : "Opponent is picking up a card..."}`, "info");

            // simulates the opponent's turn
            if (this.action.agent === "opponent") {
                setTimeout(() => {
                    this.simulateOpponentTurn();
                }, 500);
            }

        

        // ----#### THESE FEATURES HAVE NOT BEEN MADE YET ####----
        } else if (this.action.type === "jack" || this.action.type === "queen" || this.action.type === "black_king") { // special cards
            this.setAction({
                agent: this.action.agent === "player" ? "opponent" : "player",
                type: "pickup",
                config: {
                    amount: 1,
                    next: this.action.agent === "player" ? "opponent" : "player",
                },
            });


        } else if (this.action.type === "jack-snapped" || this.action.type === "queen-snapped" || this.action.type === "black_king-snapped") { // special cards but if they were snapped and not discarded
            this.setAction({
                agent: this.action.agent === "player" ? "opponent" : "player",
                type: "pickup",
                config: {
                    amount: 1,
                    next: this.action.agent === "player" ? "opponent" : "player",
                },
            });
        }

    }

}




export type { Action };
export { Game };