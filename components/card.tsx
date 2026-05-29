import { Game } from "@/components/flow";
import { NotificationWindow } from "@/components/nw";
import { CardWindow } from "@/components/cw";
import { motion } from "framer-motion";

const suits: { [key: string]: string } = {
    h: "Hearts",
    d: "Diamonds",
    c: "Clubs",
    s: "Spades",
} // used for getting full names of suits

function getElementCenter(el: Element) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

function motionFromElementToSelector(source: Element, targetSelector: string | Element): [number, number] | undefined {
    const target = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;
    if (!target) return undefined;

    const sourceCenter = getElementCenter(source);
    const targetCenter = getElementCenter(target);

    return [sourceCenter.x - targetCenter.x, sourceCenter.y - targetCenter.y];
}


class Card {

    // attribute declarations
    public suit: string;
    public rank: string;
    public game: Game; 
    public viewing: boolean = false;
    public snapSelected: boolean = false;
    public swapSelected: boolean = false;
    public initialPos?: [number, number];
    public lastRect?: DOMRect;
    private nw: NotificationWindow;
    private cw: CardWindow;
    



    constructor(rank: string, suit: string, game: Game, nw: NotificationWindow, cw: CardWindow, initialPos?: [number, number]) {
        // attributes
        this.suit = suit;
        this.rank = rank;
        this.game = game;
        this.nw = nw;
        this.cw = cw;
        this.snapSelected = false;
        this.initialPos = initialPos;
        this.lastRect = undefined;
        this.swapSelected = false;
    }

    handler(event: React.MouseEvent<HTMLDivElement>) { // handles clicking of cards (in hand, deck and cw)
        this.lastRect = event.currentTarget.getBoundingClientRect();

        if (!this.game.isPlayerTurn()) { // if it isn't the player's turn, they shouldn't be clicking anything
            // NOTE: add check for snap later on when snap functionality is added
            this.nw.post("You cannot use this card when it's not your turn.", "warning");
        }
        
        const curAction = this.game.getActionType();

        if (event.currentTarget.classList[0] === "discarded-card") { // picking up a card from the discard pile
            if (curAction !== "pickup") {
                this.nw.post("You cannot pick up a card when it is not your turn.", "warning");
                return;
            }
            if (this.game.discarded[this.game.discarded.length - 1].rank === "K" && (this.game.discarded[this.game.discarded.length - 1].suit === "s" || this.game.discarded[this.game.discarded.length - 1].suit === "c")) {
                this.nw.post("You cannot pick up a black king.", "warning");
                return;
            }

            if (this.cw.presence()) {
                this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
            }

            const newCardObj = this.game.discarded.pop()!;
            const pickupInitialPos = motionFromElementToSelector(event.currentTarget, ".cw-card-slot");
            const res = this.cw.show(new FaceUpCard(newCardObj.rank, newCardObj.suit, this.game, this.nw, this.cw, pickupInitialPos));
            this.nw.post("You picked up the top card from the discard pile. View it in the card viewer. Select a card to discard.", "info");
            this.game.triggerNextAction();
        } else if (event.currentTarget.classList[0] === "deck-card") { // this is the deck in the middle of the screen
            if (curAction !== "pickup") {
                this.nw.post("You cannot pick up a card when it is not your turn.", "warning");
                return;
            }
            if (this.cw.presence()) { // checks if they already have a card in the card viewer
                this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
                return;
            }


            const newCard = this.game.deck.draw(); // takes top card from the deck

            if (!newCard) { // if deck is empty. later on I'll add automatic reshuffling of the discarded cards back into the deck. currently, the game just ends here.
                this.nw.post("The deck is empty. You cannot draw a card. Automatic deck reshuffling is not implemented yet.", "warning"); 
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

            const drawInitialPos = motionFromElementToSelector(event.currentTarget, ".cw-card-slot");
            const res = this.cw.show(new FaceUpCard(newCard[0], newCard[1], this.game, this.nw, this.cw, drawInitialPos));
            this.nw.post("You picked up a new card. View it in the card viewer. Select a card to discard.", "info");
            this.game.triggerNextAction(); // increments to next action (probably discarding a card in this instance)



        } else if (event.currentTarget.classList[0] === "player-card") { // player or opponent's cards
            if (curAction === "discard") { // person needs to discard a card

                // gets card, updates discard pile, updates react state, replaces card in player's hand, notifies user, triggers next action
                const cardToDiscard = `${this.rank}${this.suit}`;
                const discardInitialPos = motionFromElementToSelector(event.currentTarget, ".discard-pile-slot");
                const newDiscarded = [...this.game.discarded, new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw, discardInitialPos)];
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

                // #### //


            } else if (curAction === "jack") {
                if (this.cw.presence()) {
                    this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before using your Jack ability.", "warning");
                    return;
                }

                const initialPos = motionFromElementToSelector(event.currentTarget, ".cw-card-slot");
                const imel = event.currentTarget.children[0] as HTMLImageElement;
                imel.classList.add("invisible");
                const res = this.cw.show(new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw, initialPos));
                this.cw.timer(5);
                this.nw.post("You played a Jack! View one of your cards for 5 seconds.", "info");
                this.game.setSpecialCardTimer("executing");
                setTimeout(() => {
                    this.game.setSpecialCardTimer(0);
                    imel.classList.remove("invisible");
                }, 5000);

            } else if (curAction === "black_king") {
                if (this.cw.presence()) {
                    this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before using your King ability.", "warning");
                    return;
                }

                for (const card of this.game.userCards) {
                    if (card.swapSelected) {
                        card.swapSelected = false;
                    }
                }

                let opponentCardSelected: Card | null = null;
                for (const card of this.game.opponentCards) {
                    if (card.swapSelected) {
                        opponentCardSelected = card;
                    }
                }

                this.swapSelected = true;
                const imel = event.currentTarget.children[0] as HTMLImageElement;
                event.currentTarget.classList.add("border-purple-500");
                event.currentTarget.classList.remove("border-transparent");

                if (!opponentCardSelected) {
                    this.nw.post("You have selected this card for swapping. Please select one of your opponent's cards to swap it with. If you wish to deselect this card, simply click on another card from your hand.", "info");
                } else {
                    const ownCardPos = this.game.deck.user.indexOf(`${this.rank}${this.suit}`);
                    const opponentCardPos = this.game.deck.opponent.indexOf(`${opponentCardSelected.rank}${opponentCardSelected.suit}`);
                    const initialPos = motionFromElementToSelector(event.currentTarget, opponentCardSelected.lastRect ? `.opponent-card:nth-child(${this.game.opponentCards.indexOf(opponentCardSelected) + 1})` : ".deck-card");
                    const ownInitialPos = motionFromElementToSelector(event.currentTarget, `.player-card:nth-child(${this.game.userCards.indexOf(this) + 1})`);
                    const temp = this.game.deck.user[ownCardPos];
                    this.game.deck.user[ownCardPos] = this.game.deck.opponent[opponentCardPos];
                    this.game.deck.opponent[opponentCardPos] = temp;
                    this.nw.post(`You swapped your card at position ${ownCardPos} from the left with your opponent's card at position ${opponentCardPos} from the left.`, "info");
                    event.currentTarget.classList.remove("border-purple-500");
                    event.currentTarget.classList.add("border-transparent");

                    const opponentCardElement = document.querySelector(`.opponent-card:nth-child(${this.game.opponentCards.indexOf(opponentCardSelected) + 1})`) as HTMLElement;
                    opponentCardElement.classList.remove("border-purple-500");
                    opponentCardElement.classList.add("border-transparent");
                }


            
            }   else if (curAction === "start") {
                if (event.currentTarget.classList.contains("start-checked")) { // if they already checked this card for the start. makes sure they look at 2 unique cards
                    this.nw.post("You have already checked this card. Check a different card.", "warning");
                    return;
                }


                if (this.cw.presence()) { // if they're still looking at a card.
                    this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before selecting a new one.", "warning");
                    return;
                }

                // adds the card to the cw and starts timer. allows them to view the card
                this.nw.post("Go look at your card and make sure not to forget it. You can only look at this once.", "info");
                const curTarget = event.currentTarget;
                const imel = event.currentTarget.children[0] as HTMLImageElement;
                curTarget.classList.add("start-checked");
                const startInitialPos = motionFromElementToSelector(event.currentTarget, ".cw-card-slot");
                const res = this.cw.show(new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw, startInitialPos));
                imel.classList.add("invisible");
                this.cw.timer(5);

                setTimeout(() => {
                    this.game.setAction({
                        agent: this.game.action.agent,
                        type: this.game.action.type,
                        config: {
                            amount: this.game.action.config.amount - 1,
                            next: this.game.action.config.next
                        },
                    });
                    imel.classList.remove("invisible");
                    if (this.game.getActionConfig().amount === 0) {
                        this.game.triggerNextAction();
                    }

                    return;
                }, 5000);
                // #### //

            } else if (curAction === "snap") {
                this.snapSelected = true;
                event.currentTarget.classList.add("border-green-500");
                event.currentTarget.classList.remove("border-transparent");
                this.nw.post("You have selected this card for snapping. If you wish to snap it, remember to click the SNAP button!", "info");
            } else { // notifies user of error
                this.nw.post("You can only check your own cards at the start of the game or when playing Jack.", "warning");
            }


        } else if (event.currentTarget.classList[0] === "card-window") { // card in cw


            if (!this.cw.content()) { // if there was a timing issue and card is no longer in the cw
                return;
            }


            if (curAction === "discard") { // if it's their turn to discard, then they can discard the card they just picked up (which would therefore be in the cw)
                const cardToDiscard = `${this.cw.content()!.rank}${this.cw.content()!.suit}`;
                const discardInitialPos = motionFromElementToSelector(event.currentTarget, ".discard-pile-slot");
                const newDiscarded = [...this.game.discarded, new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw, discardInitialPos)];
                this.game.setDiscarded(newDiscarded);
                this.cw.hide();
                this.nw.post(`You discarded a ${this.rank} of ${suits[this.suit].toLowerCase()}.`, "info");
                this.game.userCards = this.game.userCards.filter(card => card.rank !== cardToDiscard[0] || card.suit !== cardToDiscard[1]);
                this.game.triggerNextAction();
            }


        } else { // opponent cards
            if (curAction === "queen") {
                if (this.cw.presence()) {
                    this.nw.post("You are already viewing a card. Please discard this card or wait for the timer to elapse before using your Queen ability.", "warning");
                    return;
                }

                const initialPos = motionFromElementToSelector(event.currentTarget, ".cw-card-slot");
                const imel = event.currentTarget.children[0] as HTMLImageElement;
                imel.classList.add("invisible");
                const res = this.cw.show(new FaceUpCard(this.rank, this.suit, this.game, this.nw, this.cw, initialPos));
                this.cw.timer(5);
                this.nw.post("You played a Queen! View one of your opponent's cards for 5 seconds.", "info");
                this.game.setSpecialCardTimer("executing");
                setTimeout(() => {
                    this.game.setSpecialCardTimer(0);
                    imel.classList.remove("invisible");
                }, 5000);



            } else if (curAction === "black_king") {
                for (const card of this.game.opponentCards) {
                    if (card.swapSelected) {
                        card.swapSelected = false;
                    }
                }

                let ownCardSelected: Card | null = null;
                for (const card of this.game.userCards) {
                    if (card.swapSelected) {
                        ownCardSelected = card;
                    }
                }

                this.swapSelected = true;
                event.currentTarget.classList.add("border-purple-500");
                event.currentTarget.classList.remove("border-transparent");
                if (!ownCardSelected) {
                    this.nw.post("You have selected this opponent card for swapping. Please select one of your own cards to swap it with. If you wish to deselect this card, simply click on another card from your opponent's hand.", "info");
                } else {
                    const ownCardPos = this.game.deck.user.indexOf(`${ownCardSelected.rank}${ownCardSelected.suit}`);
                    const opponentCardPos = this.game.deck.opponent.indexOf(`${this.rank}${this.suit}`);
                    const temp = this.game.deck.user[ownCardPos];
                    this.game.deck.user[ownCardPos] = this.game.deck.opponent[opponentCardPos];
                    this.game.deck.opponent[opponentCardPos] = temp;
                    this.nw.post(`You swapped your card at position ${ownCardPos} from the left with your opponent's card at position ${opponentCardPos} from the left.`, "info");
                    event.currentTarget.classList.remove("border-purple-500");
                    event.currentTarget.classList.add("border-transparent");

                    const allUserCards = document.querySelectorAll(`.player-card`)
                    const ownCardElement = allUserCards[this.game.userCards.indexOf(ownCardSelected)] as HTMLElement;
                    const toOpponent = motionFromElementToSelector(ownCardElement, event.currentTarget);
                    const toUser = motionFromElementToSelector(event.currentTarget, ownCardElement);
                    ownCardElement.classList.remove("border-purple-500");
                    ownCardElement.classList.add("border-transparent");
                }





            } else { // if invalid action
                this.nw.post("You can only interact with an opponent's card when playing a queen or black king.", "warning");
            }
        }
        


    }


    render(type: string, index?: number, className: string = "") { // render card onto screen
        return (
            <motion.div
                layout
                layoutId={`${this.rank}${this.suit}`} 
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`${type} ${className} hover:cursor-pointer border-3 border-transparent hover:border-yellow-500 border-inset transition-colors duration-200 h-38 w-24 bg-white/40 rounded-md flex items-center justify-center`}
                onClick={(event) => this.handler(event)}
                key={`${this.rank}${this.suit}`}
            >
                <img src="/models/cards/back.png" alt="card mockup" className={`h-36 w-24`} />
            </motion.div>
        )
    }
}


class FaceUpCard extends Card { // card but instead of seeing my marvelous card back design, you can see the horrible card (you should definitely only look at my design)
    
    constructor(rank: string, suit: string, game: Game, nw: NotificationWindow, cw: CardWindow, initialPos?: [number, number]) { // uh not much to say
        super(rank, suit, game, nw, cw);
        this.initialPos = initialPos;
    }


    render(type: string, index?: number) { // render face up onto screen from /public/models/cards
        return (
            <motion.div
                layout
                layoutId={`${this.rank}${this.suit}`}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`${type} face-up-card`}
                onClick={(event) => this.handler(event)}
                key={`${this.rank}${this.suit}`}
            >
                <img src={`/models/cards/${this.rank}_of_${suits[this.suit].toLowerCase()}.png`} alt="card mockup" className="h-36 w-24 shadow-sm opacity-80" />
            </motion.div>
        )
    }

}


export { Card, FaceUpCard, motionFromElementToSelector };