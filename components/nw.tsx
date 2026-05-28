"use client";
import {
    Info,
    TriangleAlert
} from "lucide-react";

class NotificationWindow {
    private messageList: string[][];
    private setMessageList: (messages: string[][]) => void;

    constructor(messageList: string[][] , setMessageList: (messages: string[][] ) => void) {
        this.messageList = messageList;
        this.setMessageList = setMessageList;
    } // notification widget (top left)

    render() { //renders it
        return (
        <div className="absolute section shadow-sm left-4 top-104 w-72 h-72 shadow-lg bg-gray-200 rounded-md flex flex-col gap-2 justify-end p-4 overflow-y-auto">
            {this.messageList.map((message, index) => (
                <div className={`${message[1] === "warning" ? "bg-yellow-400/20" : message[1] === "error" ? "bg-red-400/20" : "bg-blue-100" } px-2 py-2 flex flex-row items-center gap-2`} key={index}>
                    {message[1] === "warning" ? <TriangleAlert className="w-8 h-8 text-yellow-500" /> : message[1] === "error" ? <TriangleAlert className="w-8 h-8 text-red-500" /> : <Info className="w-8 h-8 text-blue-500" />}
                    <p key={index} className={`text-xs ${message[1] === "warning" ? "text-yellow-500" : message[1] === "error" ? "text-red-500" : "text-blue-500"}`}>{message[0]}</p>
                </div>
            ))}
        </div>
        )
    }

    post(message: string, type: "info" | "warning" | "error") { // new message in widget window
        this.messageList.push([message, type]);
        this.setMessageList([...this.messageList]);
        return;
    } 
}

export { NotificationWindow };