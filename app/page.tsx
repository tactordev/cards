"use client";
import { useState, createContext, useReducer  } from "react";
import { Action } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { Card, FaceUpCard } from "@/components/card";
import TwoD from "@/components/2d";
import ThreeD from "@/components/3d";
import {
  Info,
  Coffee,
  CircleStar,
  TriangleAlert
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
// <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" border="0">


function GameTypeSelector({ type, setType }: { type: 2 | 3, setType: (type: 2 | 3) => void }) { // switcher for 2d and 3d
  const [warning, showWarning] = useState<boolean>(false);

  return (
    <div className="absolute section top-4 left-4 z-10 flex flex-row bg-gray-200 p-2 rounded-md gap-2 shadow-sm items-center justify-center w-24 h-12">
      <div className={`flex flex-row px-2 py-1 rounded-md hover:cursor-pointer transition-colors duration-200 hover:bg-gray-300 ${type === 2 ? "bg-slate-400/40" : ""}`} onClick={() => setType(2)}>
        <p>2D</p>
      </div>
      <div className={`flex flex-row px-2 py-1 rounded-md hover:cursor-pointer transition-colors duration-200 hover:bg-gray-300 ${type === 3 ? "bg-slate-400/40" : ""}`} onClick={() => { showWarning(true); }}  >
        <p>3D</p>
      </div>
      <AnimatePresence>{ warning && <ThreeDGameWarning setType={setType} setWarning={showWarning} /> }</AnimatePresence>
    </div>
  )
}

function ThreeDGameWarning({ setType, setWarning }: { setType: (type: 2 | 3) => void, setWarning: (warning: boolean) => void }) {

  return (
    <motion.div className="fixed w-screen h-screen bg-gray-800/20 top-0 left-0 flex flex-col items-center justify-center z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="section px-6 py-4 rounded-md shadow-sm flex flex-col gap-4 justify-center items-center">
        <TriangleAlert className="w-8 h-8 text-yellow-500" />
        <p className="text-sm">The 3D mode is not finished and is not ready to be reviewed.<br/>You can still go experiment anyway. I&apos;d love some feedback!</p>
        <div className="flex flex-row gap-2 justify-center items-center">
          <p className="px-4 text-gray-500 text-base hover:underline transition-all duration-200 hover:cursor-pointer translate-y-0.25" onClick={() => { setType(2); setWarning(false); }}>
            Back
          </p>
          <p className="px-4 py-1 hover:cursor-pointer opacity-80 transition-all duration-200 hover:opacity-100 rounded-md shadow-sm bg-gray-400/40" onClick={() => { setType(3); setWarning(false); }}>
            Continue
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Helps() { // helping buttons below the widgets on left of screen
  return (
    <div className="absolute top-178 left-4 flex flex-row gap-2">
      <div className="section px-3 group py-2 shadow-sm rounded-md hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200" title="Rules" onClick={() => window.open(`${window.location.origin}/rules`, "_blank")}>
        <Info className="w-6 h-6 text-gray-500 inline-block group-hover:text-blue-500 transition-colors duration-200" />
      </div>
      <div className="section px-3 group py-2 shadow-sm rounded-md hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200" title="Buy me a coffee" onClick={() => window.open("https://www.ko-fi.com/tactor", "_blank")}>
        <Coffee className="w-6 h-6 text-gray-500 inline-block group-hover:text-yellow-500 transition-colors duration-200" />
      </div>
      <div className="section px-3 group py-2 shadow-sm rounded-md hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200" title="Credits" onClick={() => window.open(`${window.location.origin}/credits`, "_blank")}>
        <CircleStar className="w-6 h-6 text-gray-500 inline-block group-hover:text-purple-500 transition-colors duration-200" />
      </div>
    </div>
  )
}

const GameContext = createContext<Game | null>(null); // context for other components
export { GameContext };

export default function MainGame() {
  // game state
  const [gameType, setGameType] = useState<2 | 3>(2);

  const [, forceRender] = useReducer(x => x + 1, 0); 

  const [action, setAction] = useState<Action>({ agent: "both", type: "start", config: { amount: 2, next: "player" } }); // actionId, person, action, config
  const [opponentKnows, setOpponentKnows] = useState<{location: string, card: [string, string]}[]>([]); // cards opponent knows (from what they've seen)
  const [messageList, setMessageList] = useState<string[][]>([["Welcome to Tactor cards! It is the start of the game. Look at two of your cards.", "info"]]); // messages in the notification window
  const nw = new NotificationWindow(messageList, setMessageList); // notification window
  const [card, setCard] = useState<FaceUpCard | null>(null); // card in card window
  const [time, setTimer] = useState<number | null>(null); // timer for card window
  const cw = new CardWindow(nw, card, setCard, time, setTimer); // card window
  const [discarded, setDiscarded] = useState<FaceUpCard[]>([]); // discarded card pile
  const [snapTimer, setSnapTimer] = useState<number>(0); // timer for snap action
  const [specialCardTimer, setSpecialCardTimer] = useState<number | "executing">(0); // timer for special card actions
  const [game, setGame] = useState(() => new Game(action, setAction, opponentKnows, setOpponentKnows, nw, cw, discarded, setDiscarded, snapTimer, setSnapTimer, specialCardTimer, setSpecialCardTimer, forceRender)); // game

  function finalScores() { // final score calculator
    const userTotal = game.deck.user.map(card => card[0]).reduce((sum, rank) => {
        if (rank === "A") return sum + 1;
        else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
        else return sum + parseInt(rank);
    }, 0);

    const opponentTotal = game.deck.opponent.map(card => card[0]).reduce((sum, rank) => {
        if (rank === "A") return sum + 1;
        else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
        else return sum + parseInt(rank);
    }, 0);
    return (
      <div className="flex flex-col gap-4 items-center">
        <p>Your score: {userTotal}</p>
        <p>Opponent score: {opponentTotal}</p>
      </div>
    )
  }

  const content = (game.deck.deck.length > 0 && game.deck.user.length > 0 && game.deck.opponent.length > 0 && game.deck.user.length <= 6 && game.endGame !== "ended") // changes content depending on game state
    ? gameType === 2
      ? <TwoD />
      : <ThreeD /> // 2d / 3d switch
    : (
      <div className="flex flex-col gap-8 w-full h-screen items-center justify-center">
        <h1 className="text-2xl text-center">
          {
            game.deck.deck.length === 0 ? "The deck is empty. Auto-reshuffling will be implemented in the future." :
            game.deck.user.length === 0 ? "You snapped all your cards and therefore won by default!" :
            game.deck.opponent.length === 0 ? "Your opponent snapped all their cards and won by default!" :
            game.deck.user.length > 6 ? "You have more than 6 cards in your hand and therefore lost by default. Try not to missnap." :
            "The game has ended."
          }
          <br />Game over.</h1>
        { finalScores() }
        <a href="/" className="text-blue-500 hover:underline">Play again</a>
      </div> // endgame screen
    );


  return ( // returned components
    <main className="relative w-screen h-screen flex flex-col items-start justify-start">
      <GameTypeSelector type={gameType} setType={setGameType} />
      <Helps />
      <GameContext.Provider value={game}>
        {content}
      </GameContext.Provider>
    </main>
  )
}
