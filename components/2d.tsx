"use client";
import { useContext } from "react";
import { GameContext } from "@/app/page";
import { Card, FaceUpCard } from "./card";
import {
  CircleUser,
  Zap,
  Timer
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const suits: { [key: string]: string } = {
    "h": "Hearts",
    "d": "Diamonds",
    "c": "Clubs",
    "s": "Spades"
}

function Instruction() { // instruction widget at top left of screen
  const game = useContext(GameContext);
  if (!game) {
    return <div>Loading...</div>;
  }
  const action = game.action;

  return (
    <div className="absolute top-18 left-4 section w-72 rounded-md shadow-md flex items-center justify-center px-4 py-2 bg-gray-200">
      {game.action.agent === "player" || game.action.agent === "both" ? (
        <p className="text-center text-gray-700 truncate">{action.type === "start" ? "Look at two of your cards." : action.type === "pickup" ? "Pick up a card from the deck." : action.type === "discard" ? "Discard a card from your hand." : action.type === "snap" ? `Snap a card if you have one.` : `Use the ${action.type} card.`}</p>
      ) : (
        <p className="text-center text-gray-700 truncate">Waiting for opponent...</p>
      )}
    </div>
  )
}

export default function TwoD() { // 2d game component, 2d version of game
    const game = useContext(GameContext); // gets game context
    if (!game) {
        return <div>Loading...</div>;
    }
    
    // declarations
    const nw = game.nw;
    const cw = game.cw;
    const discarded = game.discarded;
    const lastDiscard = discarded.length > 0 ? discarded[discarded.length - 1] : undefined;


    // special buttons
    function endgame(e: React.MouseEvent<HTMLParagraphElement>) {
      if (!game) return;
      if (game.action.agent !== "player" && (game.action.type !== "snap" || game.action.config.next !== "opponent")) {
        nw.post("You can only call endgame during your turn.", "warning");
        return;
      }

      game.endGame = "player";
      nw.post("You have called endgame. Everyone will have one more turn then the game will end.", "info");
      return;
    }

    function snap(e: React.MouseEvent<HTMLParagraphElement>) {
      if (!game) {
        console.log("Game not found.")
        return;
      }
      if (game.snapTimer === 0) {
        console.log("Snap time ran out.")
        nw.post("The snap timer has run out. Try again next turn.", "warning");
        return;
      }

      for (const card of game.userCards) {
        console.log(card.snapSelected);
        if (!card.snapSelected) continue;
        if (card.rank !== discarded[discarded.length - 1].rank) {
          nw.post("You incorrectly snapped a card. You have now gained a penalty card.", "error");
          const newCard = game.deck.draw();
          if (!newCard) {
            nw.post("Failed to draw a new card.", "error");
            return;
          }
          game.deck.user.push(newCard);
          nw.post("You have gained a penalty card.", "info");
          continue;
        }

        console.log("Correctly snapped");
        const discardSlot = document.querySelector(".discard-pile-slot");
        let snapInitialPos: [number, number] | undefined;
        if (discardSlot && card.lastRect) {
          const discardRect = discardSlot.getBoundingClientRect();
          const sourceCenterX = card.lastRect.left + card.lastRect.width / 2;
          const sourceCenterY = card.lastRect.top + card.lastRect.height / 2;
          const targetCenterX = discardRect.left + discardRect.width / 2;
          const targetCenterY = discardRect.top + discardRect.height / 2;
          snapInitialPos = [sourceCenterX - targetCenterX, sourceCenterY - targetCenterY];
        }

        const newDiscarded = [...discarded, new FaceUpCard(card.rank, card.suit, game, nw, cw, snapInitialPos)];
        const cardPos = game.deck.user.findIndex(c => c[0] === card.rank && c[1] === card.suit);
        game.deck.user.splice(cardPos, 1);
        nw.post(`You correctly snapped a ${card.rank} of ${suits[card.suit].toLowerCase()}. It has been discarded.`, "info");
        game.setDiscarded(newDiscarded);
        continue;
      }
    }
    

    // screen
    return (
        <div className="flex flex-col gap-8 w-full h-screen items-center justify-center">

          {/* opponent information */}
          <div className="relative section flex flex-col opponent-cards gap-2 px-12 py-4 rounded-md shadow-md">
            <div className="flex flex-row items-center gap-2 justify-center items-center">
              <CircleUser className="w-8 h-8 text-gray-800" />
              <p className="text-lg font-bold text-gray-800">Automated Opponent</p>
            </div>
            <motion.div className="flex flex-row relative gap-2">
              { 
                game!.deck.opponent.map((card, index) => (
                  <div className="rotate-180" key={index}>{new Card(card[0], card[1], game, nw, cw).render("opponent-card", index)}</div>
                ))
              }
            </motion.div>
          </div>

          {/* table of play */}
          <div className="relative flex flex-row justify-center">
            {/* deck and discard pile */}
            <div className="card-deck relative section px-12 py-4 rounded-md shadow-md flex flex-row gap-2 justify-center gap-2">
              {/* deck */}
              <div className="relative">
                {
                  new Card(game.deck.deck[game.deck.deck.length - 1][0], game.deck.deck[game.deck.deck.length - 1][1], game, nw, cw).render("deck-card")
                }
                <p className="absolute bottom-4 text-xs text-white left-3">{game.deck.deck.length} cards left</p>
              </div>

              {/* discard pile */}
              <div className="discard-pile-slot h-38 w-24 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  { 
                    discarded.length > 0 ? (
                        <motion.div
                          key={`${lastDiscard?.rank ?? "x"}${lastDiscard?.suit ?? "x"}-${discarded.length}`}
                          initial={{ opacity: 0, scale: 0.5, x: lastDiscard?.initialPos ? lastDiscard.initialPos[0] : 0, y: lastDiscard?.initialPos ? lastDiscard.initialPos[1] : 0 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        {[discarded[discarded.length - 1].render("discarded-card", -2)]}
                      </motion.div>
                    ) : <div className="h-38 w-24 bg-gray-300 rounded-md flex items-center justify-center" />
                  }
                </AnimatePresence>
              </div>
            </div>


            {/* information */}
            <div className="absolute flex flex-col top-0 -right-62 gap-4">
              <div className="relative group flex flex-row justify-center items-center section px-3 py-2 shadow-sm rounded-md gap-2 w-60">
                <Timer />
                <p className="translate-y-0.5 font-semibold text-gray-800 tabular-nums">Snap time: <span className="px-3 py-1 bg-slate-400/20 rounded-md mr-2 font-mono text-sm tabular-nums">{game.snapTimer === 0 ? "expired" : game.snapTimer.toFixed(1)}</span>.</p>
              </div>
            </div>
          </div>

          
          {/* user's cards */}
          <div className="relative flex flex-row justify-center">

            {/* cards */}
            <div className="relative section px-12 py-4 rounded-md flex flex-col shadow-md player-cards gap-2">
              <div className="flex flex-row items-center gap-2 justify-center items-center">
                <CircleUser className="w-8 h-8 text-gray-800" />
                <p className="text-lg font-bold text-gray-800">Your Cards</p>
              </div>
              <motion.div
                className="flex flex-row relative items-center gap-2 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.35 }}
              >

                { game.deck.user.map((card, index) => (
                  new Card(card[0], card[1], game, nw, cw).render("player-card", index)
                ))}
              </motion.div>
            </div>

            {/* actions */}
            <div className="absolute flex flex-col bottom-0 -right-36 gap-4">
              <div className="relative group flex flex-row justify-center items-center hover:cursor-pointer hover:-translate-y-0.5 gap-2 section px-3 py-2 shadow-sm rounded-md transition-transform duration-200">
                <Timer />
                <p className="translate-y-0.5 font-semibold text-gray-800">ENDGAME</p>
                <div className="absolute w-full h-full bg-red-800 rounded-md tintedRed opacity-20 group-hover:opacity-25 transition-opacity duration-200" onClick={endgame} />
              </div>
              <div className="relative group flex flex-row justify-center items-center hover:cursor-pointer hover:-translate-y-0.5 gap-2 section px-3 py-2 shadow-sm rounded-md transition-transform duration-200">
                <Zap />
                <p className="translate-y-0.5 font-semibold text-gray-800">SNAP</p>
                <div className="absolute w-full h-full bg-blue-800 rounded-md tintedBlue opacity-20 group-hover:opacity-25 transition-opacity duration-200" onClick={snap} />
              </div>
            </div>
          </div>



          {/* widgets on left of screen */}
          <Instruction />
          { nw.render() }
          { cw.render() }


          {/* debug action info */}
          <p className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md">{JSON.stringify(game.action)}</p>
        </div>
    )
}