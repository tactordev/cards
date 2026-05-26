"use client";
import { useState } from "react";

class NotificationWindow {
    private messageList: string[];
    private setMessageList: (messages: string[]) => void;

    constructor(messageList: string[], setMessageList: (messages: string[]) => void) {
        this.messageList = messageList;
        this.setMessageList = setMessageList;
    }

    render() {
        return (
        <div className="fixed left-8 bottom-4 w-72 h-72 shadow-lg bg-gray-200 rounded-md flex flex-col justify-end p-4 overflow-y-auto">
            {this.messageList.map((message, index) => (
            <p key={index} className="text-sm">{message}</p>
            ))}
        </div>
        )
    }

    post(message: string) {
        this.messageList.push(message);
        this.setMessageList([...this.messageList]);
        return;
    } 
}

export { NotificationWindow };