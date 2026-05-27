"use client";
import { useEffect, useState, createContext  } from "react";
import { Action } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { Card, FaceUpCard } from "@/components/card";
import TwoD from "@/components/2d";
import ThreeD from "@/components/3d";
// <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" border="0">


function GameTypeSelector({ type, setType }: { type: 2 | 3, setType: (type: 2 | 3) => void }) {
  return (
    <div className="fixed top-4 left-4 z-10">
      <label htmlFor="game-type" className="mr-2 font-bold">Select game type:</label>
      <select id="game-type" value={type} onChange={(e) => setType(parseInt(e.target.value) as 2 | 3)} className="p-2 border rounded-md">
        <option value={2}>2D</option>
        <option value={3}>3D</option>
      </select>
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
  const [card, setCard] = useState<string | null>(null);
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
    <main>
      <GameTypeSelector type={gameType} setType={setGameType} />
      <GameContext.Provider value={game}>
        {content}
      </GameContext.Provider>
    </main>
  )
}