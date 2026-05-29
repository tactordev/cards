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
        <div className="absolute section shadow-sm left-4 top-104 w-72 h-72 shadow-lg rounded-md flex flex-col gap-2 justify-end p-4 overflow-y-auto">
            {this.messageList.map((message, index) => (
                <div className={`${message[1] === "warning" ? "bg-yellow-400/20" : message[1] === "error" ? "bg-red-400/20" : "bg-blue-400/20"} px-2 py-2 flex flex-row items-center gap-2 rounded-md`} key={index}>
                    <div className="w-6 h-6">
                        {message[1] === "warning" ? <TriangleAlert className="w-6 h-6 text-yellow-200" /> : message[1] === "error" ? <TriangleAlert className="w-6 h-6 text-red-200" /> : <Info className="w-6 h-6 text-blue-200" />}
                    </div>
                    <p key={index} className={`text-xs ${message[1] === "warning" ? "text-yellow-200" : message[1] === "error" ? "text-red-200" : "text-blue-200"}`}>{message[0]}</p>
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