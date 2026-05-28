"use client";


import { useState } from "react"
import {
    CircleSlash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Rules() {

    const [game, setGame] = useState<string>("null");

    function render() {
        switch (game) {
            case "Kiki":
                return (
                    <AnimatePresence>
                        <motion.div key={game} initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5, transition: { duration: 0.25 }}} transition={{ duration: 0.5, delay: 0.25 }} className="section flex flex-col mt-4 justify-start items-start shadow-sm rounded-md px-4 py-2 ml-12">
                            <h2 className="text-gray-800 font-bold text-lg mb-2">Kiki/Cabo</h2>

                            <h3 className="text-gray-800 font-semibold text-md mt-2">About</h3>
                            <p className="text-gray-500 text-sm">
                                About description
                            </p>
                        </motion.div>
                    </AnimatePresence>
                );

            case "TNP":
                return (
                    <AnimatePresence>
                        <motion.div key={game} initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5, transition: { duration: 0.25 }}} transition={{ duration: 0.5, delay: 0.25 }} className="section flex flex-row mt-4 justify-start items-start shadow-sm rounded-md px-4 py-2 ml-12">
                            <CircleSlash className="w-6 h-6 text-gray-500 mr-2" />
                            <p className="text-gray-500">This game is not finished yet. Check back for the rules at a later date.</p>
                        </motion.div>
                    </AnimatePresence>
                );

            default:
                return (
                    <AnimatePresence>
                        <motion.div key="default" initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5}} transition={{ duration: 0.25 }} className="section flex flex-row mt-4 justify-start items-start shadow-sm rounded-md px-4 py-2 ml-12">
                            <CircleSlash className="w-6 h-6 text-gray-500 mr-2" />
                            <p className="text-gray-500 translate-y-0.25">Select a game to view its rules.</p>
                        </motion.div>
                    </AnimatePresence>
                );
        }
    }

    return (
        <main className="flex flex-col w-screen h-screen items-start pt-8">
            <h1 className="section text-2xl font-bold text-gray-800 mb-2 ml-12 px-4 py-2 rounded-md shadow-sm">Rules</h1>
            <div className="flex flex-row gap-2">
                <div className={`section relative flex flex-row items-center justify-center shadow-sm rounded-md px-3 py-1 ml-12 group transition-colors duration-200`} onClick={() => setGame("Kiki")}>
                    <p>Kiki/Cabo</p>
                    <div className={`absolute w-full h-full rounded-md ${game === "Kiki" ? "tintedBlue" : ""} opacity-20 group-hover:tintedBlue group-hover:cursor-pointer transition-opacity duration-200`} />
                </div>
                <div className={`section relative flex flex-row items-center justify-center shadow-sm rounded-md px-3 py-1 hover:cursor-pointer group transition-colors duration-200`} onClick={() => setGame("TNP")}>
                    <p>Tactor's Nifty Pets</p>
                    <div className={`absolute w-full h-full rounded-md ${game === "TNP" ? "tintedBlue" : ""} opacity-20 group-hover:tintedBlue group-hover:cursor-pointer transition-opacity duration-200`} />
                </div>
            </div>
            <AnimatePresence>
                { render() }
            </AnimatePresence>
        </main>
    )
}