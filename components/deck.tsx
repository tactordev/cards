import { Actions } from "@/components/flow";
import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";



function randomiseCards() {
    const allCards = {
        ranks: "2 3 4 5 6 7 8 9 T J Q K A".split(" "),
        suits: "hearts diamonds clubs spades".split(" "),
    }

    const newDeck = allCards.ranks.flatMap(rank => allCards.suits.map(suit => `${rank}${suit.slice(0, 1)}`));
    const shuffledDeck = newDeck.sort(() => Math.random() - 0.5);

    return {
        user: shuffledDeck.slice(0, 4),
        opponent: shuffledDeck.slice(4, 8),
        deck: shuffledDeck.slice(8),
    };
}


class Deck {
    public deck: string[];
    public user: string[];
    public opponent: string[];

    constructor(
        nw: NotificationWindow,
        cw: CardWindow,
        game: Game
    ) {
        const { deck, user, opponent } = randomiseCards();
        this.deck = deck;
        this.user = user;
        this.opponent = opponent;
    }

    draw() {
        
    }

    top() {
        return this.deck[0];
    }

    bottom() {
        return this.deck[this.deck.length - 1];
    }
}


export { Deck };