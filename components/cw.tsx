"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";
import {
    CircleSlash
} from "lucide-react";
import { Card, FaceUpCard } from "./card";
import { GameContext } from "@/app/page";

class CardWindow {
    private card: FaceUpCard | null;
    private setCard: (card: FaceUpCard | null) => void;
    private time: number | null
    private setTimer: (timer: number | null) => void;
    private timerId: ReturnType<typeof setTimeout> | null;
    private intervalId: ReturnType<typeof setInterval> | null;
    private nw: NotificationWindow;

    constructor(nw: NotificationWindow, card: FaceUpCard | null, setCard: (card: FaceUpCard | null) => void, time: number | null, setTimer: (timer: number | null) => void) {
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

    render() {
        return (
            <div className="absolute section shadow-sm left-4 w-72 h-72 top-30 rounded-md shadow-md flex flex-col bg-gray-200 items-center pt-4">
                <div className="relative flex flex-col w-full h-full items-center justify-center">
                    <p className="absolute left-4 top-0 small-caps text-lg font-semibold text-gray-700">View Cards</p>
                    {this.card ? (
                        <GameContext.Provider value={this.card.game}>
                            { new FaceUpCard(this.card.rank, this.card.suit, this.card.game, this.nw, this).render("card-window") }
                        </GameContext.Provider>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <CircleSlash className="w-16 h-16 text-gray-400" />
                            <p className="text-gray-500 mt-2">No card selected.</p>
                        </div>
                    )}
                    {
                        this.time ? (
                        <p className="text-xs text-gray-500 mt-2">This card will be hidden in {this.time.toFixed(1)} seconds.</p>
                        ) : <p></p>
                    }
                </div>
            </div>
        )
    }

    show(card: FaceUpCard) {
        if (this.card) {
            this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
            return false;
        }
        this.setCard(card);
        return true;
    }

    hide() {
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

    timer(seconds: number) {
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

    presence() {
        if (this.card) return true;
        return false;
    }

    content() {
        return this.card;
    }
}

export { CardWindow };