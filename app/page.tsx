"use client";
import { useEffect, useState, createContext  } from "react";
import { Action } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { Card, FaceUpCard } from "@/components/card";
import TwoD from "@/components/2d";
import ThreeD from "@/components/3d";
import {
  Info
} from "lucide-react";
// <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" border="0">


function GameTypeSelector({ type, setType }: { type: 2 | 3, setType: (type: 2 | 3) => void }) {
  return (
    <div className="absolute section top-4 left-4 z-10 flex flex-row bg-gray-200 p-2 rounded-md gap-2 shadow-sm items-center justify-center w-24 h-12">
      <div className={`flex flex-row px-2 py-1 rounded-md hover:cursor-pointer transition-colors duration-200 hover:bg-gray-300 ${type === 2 ? "bg-slate-400/40" : ""}`} onClick={() => setType(2)}>
        <p>2D</p>
      </div>
      <div className={`flex flex-row px-2 py-1 rounded-md hover:cursor-pointer transition-colors duration-200 hover:bg-gray-300 ${type === 3 ? "bg-slate-400/40" : ""}`} onClick={() => setType(3)}  >
        <p>3D</p>
      </div>
    </div>
  )
}

function Helps() {
  return (
    <div className="absolute top-178 left-4 flex flex-row">
      <div className="section px-3 group py-2 shadow-sm rounded-md hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200">
        <Info className="w-6 h-6 text-gray-500 inline-block group-hover:text-blue-500 transition-colors duration-200" />
      </div>
    </div>
  )
}

const GameContext = createContext<Game | null>(null);
export { GameContext };

export default function MainGame() {
  const [gameType, setGameType] = useState<2 | 3>(3);

  const [action, setAction] = useState<Action>({ agent: "both", type: "start", config: 2 }); // actionId, person, action, config
  const [opponentKnows, setOpponentKnows] = useState<{location: string, card: [string, string]}[]>([]);
  const [messageList, setMessageList] = useState<string[][]>([["Welcome to Tactor cards! It is the start of the game. Look at two of your cards.", "info"]]);
  const nw = new NotificationWindow(messageList, setMessageList);
  const [card, setCard] = useState<FaceUpCard | null>(null);
  const [time, setTimer] = useState<number | null>(null);
  const cw = new CardWindow(nw, card, setCard, time, setTimer);
  const [discarded, setDiscarded] = useState<FaceUpCard[]>([]);
  const [game, setGame] = useState(() => new Game(action, setAction, opponentKnows, setOpponentKnows, nw, cw, discarded, setDiscarded));

  function finalScores() {
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

  const content = game.deck.deck.length > 0
    ? gameType === 2
      ? <TwoD />
      : <ThreeD />
    : (
      <div className="flex flex-col gap-8 w-full h-screen items-center justify-center">
        <h1 className="text-2xl text-center">The deck is empty.<br />Game over.</h1>
        { finalScores() }
        <a href="/" className="text-blue-500 hover:underline">Play again</a>
      </div>
    );


  return (
    <main className="relative w-screen h-screen flex flex-col items-start justify-start">
      <GameTypeSelector type={gameType} setType={setGameType} />
      <Helps />
      <GameContext.Provider value={game}>
        {content}
      </GameContext.Provider>
    </main>
  )
}