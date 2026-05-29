"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import { Deck } from "@/components/deck";
import { CardWindow } from "@/components/cw";
import { Card, FaceUpCard } from "./card";

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
    public specialCardTimer: number | "executing";
    public setSpecialCardTimer: (timer: number | "executing") => void;
    public opponentCards: Card[];
    public userCards: Card[];
    public forceRerender: () => void;
    public endGame: string | null = null;
    public specialCardTimeoutId: ReturnType<typeof setTimeout> | null;
    public specialCardIntervalId: ReturnType<typeof setInterval> | null;
    private snapTimeoutId: ReturnType<typeof setTimeout> | null;
    private snapIntervalId: ReturnType<typeof setInterval> | null;

    constructor(
        action: Action,
        setAction: (action: Action) => void,
        opponentKnows: {location: string, card: [string, string]}[],
        setOpponentKnows: (opponentKnows: {location: string, card: [string, string]}[]) => void,
        nw: NotificationWindow,
        cw: CardWindow,
        discarded: FaceUpCard[],
        setDiscarded: (discarded: FaceUpCard[]) => void,
        snapTimer: number,
        setSnapTimer: (timer: number) => void,
        specialCardTimer: number | "executing",
        setSpecialCardTimer: (timer: number | "executing") => void,
        forceRerender: () => void
    ) {
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
        this.specialCardTimer = specialCardTimer;
        this.setSpecialCardTimer = (timer: number | "executing") => {
            this.specialCardTimer = timer;
            setSpecialCardTimer(timer);
        };
        this.specialCardTimeoutId = null;
        this.specialCardIntervalId = null;
        this.forceRerender = forceRerender;
        this.snapTimeoutId = null;
        this.snapIntervalId = null;
        this.userCards = [];
        this.opponentCards = [];
        this.endGame = null;
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
        this.forceRerender();
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
        const discardSlot = document.querySelector(".discard-pile-slot");
        const opponentZone = document.querySelector(".opponent-cards");
        let discardInitialPos: [number, number] | undefined;
        if (discardSlot && opponentZone) {
            const sourceRect = opponentZone.getBoundingClientRect();
            const targetRect = discardSlot.getBoundingClientRect();
            const sourceCenterX = sourceRect.left + sourceRect.width / 2;
            const sourceCenterY = sourceRect.top + sourceRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;
            discardInitialPos = [sourceCenterX - targetCenterX, sourceCenterY - targetCenterY];
        }

        const newDiscarded = [...this.discarded, new FaceUpCard(cardToDiscard[0], cardToDiscard[1], this, this.nw, this.cw, discardInitialPos)];
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

    triggerNextAction(): any { // increment to the next action
        this.forceRerender();
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
            const latestDiscard = this.discarded[this.discarded.length - 1];
            if (["J", "Q", "K"].includes(latestDiscard.rank) && !(latestDiscard.rank === "K" && (latestDiscard.suit === "D" || latestDiscard.suit === "H")) && this.action.agent === "player") { 
                this.setAction({
                    agent: "player",
                    type: latestDiscard.rank === "J" ? "jack" : latestDiscard.rank === "Q" ? "queen" : "black_king",
                    config: {
                        amount: 0,
                        next: "player",
                    },
                });
                this.nw.post(`You played a ${latestDiscard.rank}. ${latestDiscard.rank === "J" ? "View one of your cards for 5 seconds." : latestDiscard.rank === "Q" ? "View one of your opponent's cards for 5 seconds." : "Swap two cards blindly."}`, "info");
                return this.triggerNextAction();
            }

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
                    this.setSnapTimer(this.snapTimer - 0.1);
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
                    
                    for (const card of this.userCards) {
                        card.snapSelected = false;
                    }

                    const cardEls = document.querySelectorAll(".border-green-500");
                    cardEls.forEach(el => {
                        el.classList.remove("border-green-500");
                        el.classList.add("border-transparent");
                    });
                    this.triggerNextAction();
                }
            }, 100);
        } else if (this.action.type === "snap") { // snap timer finished

            // switch turns
            this.setAction({
                agent: this.action.config.next,
                type: "pickup",
                config: {
                    amount: 1,
                    next: this.action.config.next,
                },
            });
            this.nw.post(`It is now your ${this.isPlayerTurn() ? "" : "opponent's"} turn. ${this.isPlayerTurn() ? "Pick up a card from the deck." : "Opponent is picking up a card..."}`, "info");

            // simulates the opponent's turn (if it is their turn)
            if (this.action.agent === "opponent") {
                setTimeout(() => {
                    this.simulateOpponentTurn();
                }, 500);
            }

        

        // ----#### THESE FEATURES HAVE NOT BEEN MADE YET ####---- \\
        } else if (this.action.type === "jack" || this.action.type === "queen" || this.action.type === "black_king") { // special cards
            this.setSpecialCardTimer(10);
            this.specialCardTimeoutId = setTimeout(() => {
                this.setSpecialCardTimer(0);
            }, 10000);
            this.specialCardIntervalId = setInterval(() => {
                if (this.specialCardTimer === "executing") return;
                if (this.specialCardTimer > 0) {
                    this.setSpecialCardTimer(this.specialCardTimer - 0.1);
                }

                if (this.specialCardTimer === 0) {
                    this.setSpecialCardTimer(0);
                    if (this.specialCardTimeoutId) {
                        clearTimeout(this.specialCardTimeoutId);
                        this.specialCardTimeoutId = null;
                    }

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
                            this.setSnapTimer(this.snapTimer - 0.1);
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
                            
                            for (const card of this.userCards) {
                                card.snapSelected = false;
                            }

                            const cardEls = document.querySelectorAll(".border-green-500");
                            cardEls.forEach(el => {
                                el.classList.remove("border-green-500");
                                el.classList.add("border-transparent");
                            });
                            this.triggerNextAction();
                        }
                    }, 100);

                    if (this.specialCardIntervalId) {
                        clearInterval(this.specialCardIntervalId);
                        this.specialCardIntervalId = null;
                    }
                }
            }, 100);

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

        if (this.endGame === this.action.agent && this.action.type === "pickup") {
            this.endGame = "ended";
            return;
        }

    }

}




export type { Action };
export { Game };