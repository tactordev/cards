import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";


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
        
        if (event.currentTarget.classList[0] === "deck-card") {
            console.log(`${this.rank} of ${this.suit}`);
            console.log(this.game.deck.deck);
            console.log(this.game.deck.top());
            console.log(this.game.deck.bottom());
        }
        const curAction = this.game.getActionType();
        if (curAction === "start") {
            this.cw.show(`${this.rank} of ${this.suit}`);
            this.cw.timer(5);
        }


    }

    render(type: string, index?: number) {
        return (
            <div className={`${type} ${type === 'deck-card' ? 'absolute bg-red-800' : ''}`} onClick={(event) => this.handler(event)} key={index}>
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