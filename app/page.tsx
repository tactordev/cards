"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Action } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { Card, FaceUpCard } from "@/components/card";
// <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" border="0">






export default function MainGame() {
  
  const [action, setAction] = useState<Action>({ agent: "both", type: "start", config: 2 }); // actionId, person, action, config
  const [opponentKnows, setOpponentKnows] = useState<{location: string, card: [string, string]}[]>([]);
  const [messageList, setMessageList] = useState<string[]>(["Welcome to Tactor cards! It is the start of the game. Look at two of your cards."]);
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
  if (game.deck.deck.length > 0) {
    return (
      <main className="flex flex-col gap-8 w-full h-screen items-center justify-center">
        <div className="opponent-cards grid grid-cols-2 grid-rows-2 gap-2">
          { game.deck.opponent.map((card, index) => (
            new Card(card[0], card[1], game, nw, cw).render("opponent-card", index)
          ))}

        </div>
        <div className="card-deck relative h-36 w-48 flex flex-row gap-2 justify-center gap-2">
          {
            new Card(game.deck.deck[game.deck.deck.length - 1][0], game.deck.deck[game.deck.deck.length - 1][1], game, nw, cw).render("deck-card")
          }
          <p className="absolute bottom-4 text-xs text-white left-3">{game.deck.deck.length} cards left</p>
          { 
            discarded.length > 0 ? (
              <div>
                {[discarded[discarded.length - 1].render("discarded-card", -2)]}
                <p className="absolute bottom-8 text-xs text-white right-1/4">{discarded[discarded.length -1].rank}{discarded[discarded.length -1].suit.slice(0, 1)}</p>
                <p className="absolute bottom-4 text-xs text-white right-3.5">Discard pile</p>
              </div>
            ) : null
          }
        </div>
        <div className="player-cards grid grid-cols-2 grid-rows-2 gap-2">
          { game.deck.user.map((card, index) => (
            new Card(card[0], card[1], game, nw, cw).render("player-card", index)
          ))}
        </div>
        { nw.render() }
        { cw.render() }
        <p className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md">{JSON.stringify(game.action)}</p>
      </main>
    );
  } else {
    return (
      <main className="flex flex-col gap-8 w-full h-screen items-center justify-center">
        <h1 className="text-2xl text-center">The deck is empty.<br />Game over.</h1>
        { finalScores() }
        <a href="/" className="text-blue-500 hover:underline">Play again</a>
      </main>
    );
  }
}
