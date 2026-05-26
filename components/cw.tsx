"use client";
import { useState } from "react";
import { NotificationWindow } from "@/components/nw";

class CardWindow {
    private card: string | null;
    private setCard: (card: string | null) => void;
    private time: number | null
    private setTimer: (timer: number | null) => void;
    private timerId: ReturnType<typeof setTimeout> | null;
    private nw: NotificationWindow;

    constructor(nw: NotificationWindow, card: string | null, setCard: (card: string | null) => void, time: number | null, setTimer: (timer: number | null) => void) {
        this.card = card;
        this.setCard = setCard;
        this.time = time;
        this.setTimer = (newTime) => {
            this.time = newTime;
            setTimer(newTime);
        };
        this.timerId = null;
        this.nw = nw;

    }

    render() {
        return (
            <div className="fixed right-24 shadow-lg w-72 h-72 rounded-md shadow-md flex flex-col bg-gray-200 items-center pt-4">
            {this.card ? (
                <p>{this.card}</p>
            ) : (
                <p>No card selected.</p>
            )}
            {
                this.time ? (
                <p className="text-xs text-gray-500 mt-2">This card will be hidden in {this.time.toFixed(1)} seconds.</p>
                ) : <p></p>
            }
            </div>
        )
    }

    show(card: string) {
        this.setCard(card);
    }

    hide() {
        this.setCard(null);
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    timer(seconds: number) {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.setTimer(seconds);
        this.timerId = setTimeout(() => {
            this.setTimer(null);
            this.hide();
            this.timerId = null;
        }, seconds * 1000); 
        setInterval(() => {
            if (this.time === null) return;
            const newTime = this.time ? this.time - 0.1 : 0;
            if (newTime <= 0) {
                this.setTimer(null);
                this.hide();
                if (this.timerId) {
                    clearTimeout(this.timerId);
                    this.timerId = null;
                }
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