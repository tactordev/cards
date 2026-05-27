import { useContext } from "react";
import { GameContext } from "@/app/page";
import { Card } from "./card";



export default function TwoD() {
    const game = useContext(GameContext);
    if (!game) {
        return <div>Loading...</div>;
    }
    
    const nw = game.nw;
    const cw = game.cw;
    const discarded = game.discarded;
    
    return (
        <div className="flex flex-col gap-8 w-full h-screen items-center justify-center">
          <div className="relative opponent-cards grid grid-cols-2 grid-rows-2 gap-2">
            <p className="text-lg font-bold absolute -left-64 text-black">Opponent cards:</p>
              { game!.deck.opponent.map((card, index) => (
                new Card(card[0], card[1], game, nw, cw).render("opponent-card", index)
            ))}

          </div>
          <div className="card-deck relative h-36 w-48 flex flex-row gap-2 justify-center gap-2">
            <p className="text-lg font-bold absolute -left-64 text-black">Deck and discard pile:</p>
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
          <div className="relative player-cards grid grid-cols-2 grid-rows-2 gap-2">
            <p className="text-lg font-bold absolute -left-64 text-black">Your cards:</p>
            { game.deck.user.map((card, index) => (
              new Card(card[0], card[1], game, nw, cw).render("player-card", index)
            ))}
          </div>
          { nw.render() }
          { cw.render() }
          <p className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md">{JSON.stringify(game.action)}</p>
        </div>
    )
}