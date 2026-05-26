"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Actions } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { Card } from "@/components/card";
// <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" border="0">






export default function MainGame() {
  
  const [action, setAction] = useState<[number, string, string, number]>([0, "start", "both", 2]); // actionId, person, action, config
  const [opponentKnows, setOpponentKnows] = useState<{location: string, card: [string, string]}[]>([]);
  const [messageList, setMessageList] = useState<string[]>(["Welcome to Tactor cards! It is the start of the game. Look at two of your cards."]);
  const nw = new NotificationWindow(messageList, setMessageList);
  const [card, setCard] = useState<string | null>(null);
  const [time, setTimer] = useState<number | null>(null);
  const cw = new CardWindow(nw, card, setCard, time, setTimer);
  const [game, setGame] = useState(() => new Game(action, setAction, opponentKnows, setOpponentKnows, nw, cw));

  return (
    <main className="flex flex-col gap-8 w-full h-screen items-center justify-center">
      <div className="opponent-cards grid grid-cols-2 grid-rows-2 gap-2">
        { game.deck.opponent.map((card, index) => (
          new Card(card[0], card[1], game, nw, cw).render("opponent-card", index)
        ))}

      </div>
      <div className="card-deck relative h-36 w-48 flex flex-row gap-2">
        { structuredClone(game.deck.deck).reverse().map((card, index) => (
          new Card(card[0], card[1], game, nw, cw).render("deck-card", index)
        ))}
      </div>
      <div className="player-cards grid grid-cols-2 grid-rows-2 gap-2">
        { game.deck.user.map((card, index) => (
          new Card(card[0], card[1], game, nw, cw).render("player-card", index)
        ))}
      </div>
      { nw.render() }
      { cw.render() }
    </main>
  );
}
