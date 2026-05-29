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
                        <motion.div key={game} initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5, transition: { duration: 0.25 }}} transition={{ duration: 0.5, delay: 0.25 }} className="section scrb flex flex-col mt-4 justify-start items-start shadow-sm rounded-md px-4 py-2 ml-12 max-w-198 overflow-y-scroll max-h-190 pb-8">
                            <h3 className="text-gray-700 font-semibold text-md mt-2">About</h3>
                            <p className="text-gray-500 text-sm">
                                Kiki is a game about memory. Each player is given a set of 4 playing cards and you check 2 of them. You can learn what the other cards are through the mechanics of the game. The objective is to run out of cards or to call endgame and have the lowest total card value on the table.
                            </p>


                            <h3 className="text-gray-700 font-semibold text-md mt-6">The start of the game</h3>
                            <p className="text-gray-500 text-sm">
                                At the start of the game, you can look at two of your own cards. You can do so by clicking on the card. It will then be shown in the card viewer at the top left of your screen. You can only view two unique cards at the start of the game. Try to remember these throughout the whole game.
                                The player who goes first will then pick up a new card from the deck and begin &apos;The Game Cycle&apos;.
                            </p>

                            <h3 className="text-gray-700 font-semibold text-md mt-6">The Game Cycle</h3>
                            <ol className="text-gray-500 text-sm list-decimal ml-6 flex flex-col gap-2">
                                <li>At the start of each turn, a player will pick up a card from the deck. They can also choose to pick up a card from the discard pile. If the latest card in the discard pile is a black king, they cannot pick it up.</li>
                                <li>They can then choose a card to discard. This can be one from their current hand or the one they just picked up.</li>
                                <li>Once a card is discarded, there will then be a 5 second timer where anyone else on the table can snap one of their cards.</li>
                                <li>If they snap successfuly, they have one less card in their hand. This brings them closer to one of the win conditions: run out of cards.</li>
                                <li>If they snap unsuccessfully, they have to draw a new card from the deck (without looking at it) and now have one more card in their hand.</li>
                                <li>Once the snap timer ends, the next player will have their turn and repeat this cycle.</li>
                            </ol>
                            <p className="text-gray-500 text-sm mt-4">
                                During their turn, a player has the option to call endgame. This means that each person (excluding them) will have one more turn and then all the cards will be flipped over. The person whose cards add to the lowest total value wins.    
                            </p>


                            <h3 className="text-gray-700 font-semibold text-md mt-6">Win Conditions</h3>
                            <p className="text-gray-500 text-sm">
                                There are two ways to win the game:
                            </p>
                            <ul className="text-gray-500 text-sm list-decimal ml-6 flex flex-col gap-2 mt-2">
                                <li>Run out of cards before the other players.</li>
                                <li>Have the lowest total card value when the game ends.</li>
                            </ul>

                            <h3 className="text-gray-700 font-semibold text-md mt-6">Card Values</h3>
                            <p className="text-gray-500 text-sm">
                                Each card has a value that contributes to your total card value. The values are as follows:
                            </p>
                            <ul className="text-gray-500 text-sm list-decimal ml-6 flex flex-col gap-2 mt-2">
                                <li>Cards 2-10 are worth their face value (2-10 points).</li>
                                <li>All face cards (Jack, Queen, King) are worth 10 points.</li>
                                <li>Aces are worth 1 point.</li>
                                <li>The red king (Diamond/Heart) is worth 0 points.</li>
                                <li>If you are playing in a deck with jokers, they are worth -1 points.</li>
                            </ul>


                            <h3 className="text-gray-700 font-semibold text-md mt-6">Special Cards</h3>
                            <p className="text-gray-500 text-sm">
                                Some of the cards have special abilities when they are discarded. See below:
                            </p>
                            <ul className="text-gray-500 text-sm list-decimal ml-6 flex flex-col gap-2 mt-2">
                                <li>Jack (J): When discarded, the user can look at one of their own cards.</li>
                                <li>Queen (Q): When discarded, the user can look at one of their opponent&apos;s cards.</li>
                                <li>Black King (K S/C): When discarded, the user can swap one of their own cards with one of their opponent&apos;s cards.</li>
                            </ul>

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
        <main className="flex flex-col w-screen h-screen items-start pt-8 overflow-x-hidden overflow-y-hidden">
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