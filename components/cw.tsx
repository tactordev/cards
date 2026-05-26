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
        this.setTimer = setTimer;
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
                <p className="text-xs text-gray-500 mt-2">This card will be hidden in {this.time} seconds.</p>
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
    }

    presence() {
        if (this.card) return true;
        return false;
    }
}

export { CardWindow };