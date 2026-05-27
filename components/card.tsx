import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { useContext } from "react";
import { GameContext } from "@/app/page";

const suits: { [key: string]: string } = {
    h: "Hearts",
    d: "Diamonds",
    c: "Clubs",
    s: "Spades",
}

class Card {
    public suit: string;
    public rank: string;
    public game: Game; 
    private nw: NotificationWindow;
    private cw: CardWindow;
    

    constructor(rank: string, suit: string, game: Game, nw: NotificationWindow, cw: CardWindow) {
        this.suit = suit;
        this.rank = rank;
        this.game = game;
        this.nw = nw;
        this.cw = cw;
    }

    handler(event: React.MouseEvent<HTMLDivElement>) {
        if (!this.game.isPlayerTurn()) {
            this.nw.post("You cannot use this card when it's not your turn.", "warning");
        }
        
        const curAction = this.game.getActionType();

        if (event.currentTarget.classList[0] === "discarded-card") {
            return;
        } else if (event.currentTarget.classList[0] === "deck-card") {
            if (curAction !== "pickup") {
                this.nw.post("You cannot pick up a card when it is not your turn.", "warning");
                return;
            }
            if (this.cw.presence()) {
                this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
                return;
            }
            const newCard = this.game.deck.draw();
            if (!newCard) {
                this.nw.post("The deck is empty. You cannot draw a card. Automatic deck reshuffling is not implemented yet.", "warning"); // add automatic deck reshuffling later
                this.nw.post("Your total: " + this.game.deck.user.map(card => card[0]).reduce((sum, rank) => {
                    if (rank === "A") return sum + 1;
                    else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                    else return sum + parseInt(rank);
                }, 0), "info");
                this.nw.post("Opponent's total: " + this.game.deck.opponent.map(card => card[0]).reduce((sum, rank) => {
                    if (rank === "A") return sum + 1;
                    else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                    else return sum + parseInt(rank);
                }, 0), "info");
                return;
            }

            const res = this.cw.show(new FaceUpCard(newCard[0], newCard[1], this.game, this.nw, this.cw));
            this.nw.post("You picked up a new card. View it in the card viewer. Select a card to discard.", "info");
            this.game.triggerNextAction();
        } else if (event.currentTarget.classList[0] === "player-card") {
            if (curAction === "discard") {
                const cardToDiscard = `${this.rank}${this.suit}`;
                const newDiscarded = [...this.game.discarded, new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw)];
                this.game.setDiscarded(newDiscarded);
                const cardPos = this.game.deck.user.indexOf(cardToDiscard);
                const newUserCards = this.game.deck.user.filter(card => card !== cardToDiscard);
                this.game.deck.user = newUserCards;
                const newCard = this.cw.content();
                if (newCard) {
                    this.game.deck.user.splice(cardPos, 0, `${newCard.rank}${newCard.suit}`);
                    this.cw.hide();
                }
                this.nw.post(`You discarded a ${this.rank} of ${suits[this.suit].toLowerCase()}.`, "info");
                this.game.triggerNextAction();
            } else if (curAction === "jack") {
                // jack logic
            } else if (curAction === "start") {
                if (event.currentTarget.classList.contains("start-checked")) {
                    this.nw.post("You have already checked this card. Check a different card.", "warning");
                    return;
                }
                if (this.cw.presence()) {
                    this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
                    return;
                }
                this.nw.post("Go look at your card and make sure not to forget it. You can only look at this once.", "info");
                event.currentTarget.classList.add("start-checked");
                const res = this.cw.show(new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw));
                console.log("")
                this.cw.timer(5);
                this.game.setAction({
                    agent: this.game.action.agent,
                    type: this.game.action.type,
                    config: this.game.getActionConfig() - 1,
                });
                if (this.game.getActionConfig() === 0) {
                    this.game.triggerNextAction();
                }
                return;
            } else {
                this.nw.post("You can only check your own cards at the start of the game or when playing Jack.", "warning");
            }
        } else if (event.currentTarget.classList[0] === "card-window") {
            if (!this.cw.content()) {
                return;
            }
            if (curAction === "discard") {
                const cardToDiscard = `${this.cw.content()!.rank}${this.cw.content()!.suit}`;
                const newDiscarded = [...this.game.discarded, new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw)];
                this.game.setDiscarded(newDiscarded);
                this.cw.hide();
                this.nw.post(`You discarded a ${this.rank} of ${suits[this.suit].toLowerCase()}.`, "info");
                this.game.triggerNextAction();
            }
        } else { // opponent cards
            if (curAction === "queen") {
                // queen logic
            } else {
                this.nw.post("You can only check opponent cards when playing Queen.", "warning");
            }
        }
        


    }

    render(type: string, index?: number) {
        return (
            <div className={`${type}`} onClick={(event) => this.handler(event)} key={index}>
                <img src="https://i.ibb.co/xKdhCXTY/card-mockup.png" alt="card mockup" className="h-36 w-24" />
            </div>
        )
    }
}


class FaceUpCard extends Card {
    

    constructor(rank: string, suit: string, game: Game, nw: NotificationWindow, cw: CardWindow) {
        super(rank, suit, game, nw, cw);
    }


    render(type: string, index?: number) {
        return (
            <div className={`${type} face-up-card`} onClick={(event) => this.handler(event)} key={index}>
                <img src={`/models/cards/${this.rank}_of_${suits[this.suit].toLowerCase()}.png`} alt="card mockup" className="h-36 w-24 shadow-sm opacity-80 mb-2" />
            </div>
        )
    }

}


export { Card, FaceUpCard };