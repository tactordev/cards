"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import {
    CircleSlash
} from "lucide-react";
import { Card, FaceUpCard } from "./card";
import { GameContext } from "@/app/page";
import { AnimatePresence, motion } from "framer-motion";

class CardWindow {

    // attributes
    private card: FaceUpCard | null;
    private setCard: (card: FaceUpCard | null) => void;
    private time: number | null
    private setTimer: (timer: number | null) => void;
    private timerId: ReturnType<typeof setTimeout> | null;
    private intervalId: ReturnType<typeof setInterval> | null;
    private nw: NotificationWindow;

    constructor(nw: NotificationWindow, card: FaceUpCard | null, setCard: (card: FaceUpCard | null) => void, time: number | null, setTimer: (timer: number | null) => void) {
        // more attributes
        this.card = card;
        this.setCard = ((card: FaceUpCard | null) => {
            this.card = card;
            setCard(card);
        });
        this.time = time;
        this.setTimer = (newTime) => {
            this.time = newTime;
            setTimer(newTime);
        };
        this.timerId = null;
        this.intervalId = null;
        this.nw = nw;

    }

    render() { // render card window widget onto screen (top left)
        return (
            <div className="absolute section shadow-sm left-4 w-72 h-72 top-30 rounded-md shadow-md flex flex-col bg-gray-200 items-center pt-4">
                <div className="relative flex flex-col w-full h-full items-center justify-center">
                    <p className="absolute left-4 top-0 small-caps text-lg font-semibold text-gray-700">View Cards</p>
                        <div className="cw-card-slot h-38 w-24 flex items-center justify-center" key="cw-slot">
                        
                        {this.card ? (
                            <AnimatePresence>
                                <GameContext.Provider value={this.card.game} key={this.card.rank + this.card.suit}>
                                        {/* faceupcard has optional attribute for initial position */}
                                        <motion.div
                                            initial={this.card.initialPos ? { x: this.card.initialPos[0], y: this.card.initialPos[1], scale: 0.5, opacity: 0 } : {}}
                                            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        exit={{ x: this.card.initialPos && this.card.game.discarded[this.card.game.discarded.length - 1] !== this.card ? [0, this.card.initialPos[0]] : 0, y: this.card.initialPos && this.card.game.discarded[this.card.game.discarded.length - 1] !== this.card ? [0, this.card.initialPos[1]] : 0, scale: 0.5, opacity: 0 }}
                                        key="faceup-card"
                                    >
                                        { new FaceUpCard(this.card.rank, this.card.suit, this.card.game, this.nw, this).render("card-window") }
                                    </motion.div>
                                </GameContext.Provider>
                            </AnimatePresence>
                        ) : (
                            <AnimatePresence>
                                <motion.div 
                                    className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut", delay: -1 } }}
                                    key="empty-cw"
                                >
                                    <CircleSlash className="w-16 h-16 text-gray-400" />
                                    <p className="text-gray-500 mt-2">No card selected.</p>
                                </motion.div>
                            </AnimatePresence>
                        )}
                        </div>
                        {
                            this.time ? (
                            <AnimatePresence>
                                <motion.p
                                    className="text-xs text-gray-500 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut", delay: 0.35 }}
                                    key="timer"
                                >
                                    This card will be hidden in {this.time.toFixed(1)} seconds.</motion.p>
                            </AnimatePresence>
                            ) : <p></p>
                        }
                </div>
            </div>
        )
    }

    show(card: FaceUpCard) { // show a card in the viewer
        if (this.card) {
            this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
            return false;
        }
        this.setCard(card);
        return true;
    }

    hide() { // remove the current card from the viewer + clear timers
        this.setCard(null);
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    timer(seconds: number) { // set a timer (they can only see a card for a set amount of time)
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.setTimer(seconds);
        this.timerId = setTimeout(() => {
            this.setTimer(null);
            this.hide();
            this.timerId = null;
        }, seconds * 1000); 
        this.intervalId = setInterval(() => {
            if (this.time === null) return;
            const newTime = this.time ? this.time - 0.1 : 0;
            if (newTime <= 0) {
                this.setTimer(null);
                this.hide();
                return;
            } else {
                this.setTimer(newTime);
            }
        }, 100);
        
        return;
    }

    presence() { // checks if there is currently a card in the cw 
        if (this.card) return true;
        return false;
    }

    content() { // gets the content from the cw. This kinda makes presence redundant
        return this.card;
    }
}

export { CardWindow };