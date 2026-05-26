import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";

const suits: { [key: string]: string } = {
    h: "Hearts",
    d: "Diamonds",
    c: "Clubs",
    s: "Spades",
}

class Card {
    public suit: string;
    public rank: string;
    private game: Game; 
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
            this.nw.post("You cannot use this card when it's not your turn.")
        }
        
        const curAction = this.game.getActionType();

        if (event.currentTarget.classList[0] === "discarded-card") {
            return;
        } else if (event.currentTarget.classList[0] === "deck-card") {
            if (curAction !== "pickup") {
                this.nw.post("You cannot pick up a card when it is not your turn.")
                return;
            }
            const newCard = this.game.deck.draw();
            if (!newCard) {
                this.nw.post("The deck is empty. You cannot draw a card. Automatic deck reshuffling is not implemented yet."); // add automatic deck reshuffling later
                this.nw.post("Your total: " + this.game.deck.user.map(card => card[0]).reduce((sum, rank) => {
                    if (rank === "A") return sum + 1;
                    else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                    else return sum + parseInt(rank);
                }, 0));
                this.nw.post("Opponent's total: " + this.game.deck.opponent.map(card => card[0]).reduce((sum, rank) => {
                    if (rank === "A") return sum + 1;
                    else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return sum + 10;
                    else return sum + parseInt(rank);
                }, 0));
                return;
            }

            this.cw.show(newCard);
            this.nw.post("You picked up a new card. View it in the card viewer. Select a card to discard.");
            this.game.triggerNextAction();
        } else if (event.currentTarget.classList[0] === "player-card") {
            if (curAction === "discard") {
                const cardToDiscard = `${this.rank}${this.suit.slice(0, 1)}`;
                const newDiscarded = [...this.game.discarded, new FaceUpCard(this.suit, this.rank, this.game, this.nw, this.cw)];
                this.game.setDiscarded(newDiscarded);
                const cardPos = this.game.deck.user.indexOf(cardToDiscard);
                const newUserCards = this.game.deck.user.filter(card => card !== cardToDiscard);
                this.game.deck.user = newUserCards;
                const newCard = this.cw.content();
                if (newCard) {
                    this.game.deck.user.splice(cardPos, 0, `${newCard[0]}${newCard[1]}`);
                    this.cw.hide();
                }
                this.nw.post(`You discarded ${cardToDiscard}.`);
                this.game.triggerNextAction();
            } else if (curAction === "jack") {
                // jack logic
            } else if (curAction === "start") {
                if (this.cw.presence()) {
                    this.cw.hide();
                }
                if (event.currentTarget.classList.contains("start-checked")) {
                    this.nw.post("You have already checked this card. Check a different card.")
                    return;
                }
                this.nw.post("Go look at your card and make sure not to forget it. You can only look at this once.")
                event.currentTarget.classList.add("start-checked");
                this.cw.show(`${this.rank} of ${suits[this.suit.slice(0, 1)]}`);
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
                this.nw.post("You can only check your own cards at the start of the game or when playing Jack.");
            }
        } else { // opponent cards
            if (curAction === "queen") {
                // queen logic
            } else {
                this.nw.post("You can only check opponent cards when playing Queen.");
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
    

    constructor(suit: string, rank: string, game: Game, nw: NotificationWindow, cw: CardWindow) {
        super(suit, rank, game, nw, cw);
    }


}


export { Card, FaceUpCard };