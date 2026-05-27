import { useContext } from "react";
import { GameContext } from "@/app/page";
import { Card } from "./card";
import {
  CircleUser
} from "lucide-react";

function Instruction() {
  const game = useContext(GameContext);
  if (!game) {
    return <div>Loading...</div>;
  }
  const action = game.action;

  return (
    <div className="absolute top-18 left-4 section w-72 rounded-md shadow-md flex items-center justify-center px-4 py-2 bg-gray-200">
      {game.action.agent === "player" || game.action.agent === "both" ? (
        <p className="text-center text-gray-700 truncate">{action.type === "start" ? "Look at two of your cards." : action.type === "pickup" ? "Pick up a card from the deck." : action.type === "discard" ? "Discard a card from your hand." : `Use the ${action.type} card.`}</p>
      ) : (
        <p className="text-center text-gray-700 truncate">Waiting for opponent...</p>
      )}
    </div>
  )
}
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
          <div className="relative section flex flex-col opponent-cards gap-2 px-12 py-4 rounded-md shadow-md">
            <div className="flex flex-row items-center gap-2 justify-center items-center">
              <CircleUser className="w-8 h-8 text-gray-800" />
              <p className="text-lg font-bold text-gray-800">Automated Opponent</p>
            </div>
            <div className="flex flex-row relative gap-2">
              { 
                game!.deck.opponent.map((card, index) => (
                  new Card(card[0], card[1], game, nw, cw).render("opponent-card", index)
                ))
              }
            </div>

          </div>
          <div className="card-deck relative section px-12 py-4 rounded-md shadow-md flex flex-row gap-2 justify-center gap-2">
            <div className="relative">
              {
                new Card(game.deck.deck[game.deck.deck.length - 1][0], game.deck.deck[game.deck.deck.length - 1][1], game, nw, cw).render("deck-card")
              }
              <p className="absolute bottom-4 text-xs text-white left-3">{game.deck.deck.length} cards left</p>
            </div>
            { 
              discarded.length > 0 ? (
                <div>
                  {[discarded[discarded.length - 1].render("discarded-card", -2)]}
                </div>
              ) : <div className="h-36 w-24 bg-gray-300 rounded-md flex items-center justify-center" />
            }
          </div>
          <div className="relative section px-12 py-4 rounded-md flex flex-col shadow-md player-cards gap-2">
            <div className="flex flex-row items-center gap-2 justify-center items-center">
              <CircleUser className="w-8 h-8 text-gray-800" />
              <p className="text-lg font-bold text-gray-800">Your Cards</p>
            </div>
            <div className="flex flex-row relative items-center gap-2 justify-center">

              { game.deck.user.map((card, index) => (
                new Card(card[0], card[1], game, nw, cw).render("player-card", index)
              ))}
            </div>
          </div>
          <Instruction />
          { nw.render() }
          { cw.render() }
          <p className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md">{JSON.stringify(game.action)}</p>
        </div>
    )
}