var _ = require('underscore');
var chalk = require('chalk');
var prompt = require('prompt');
var Shuffle = require('shuffle');

var oneDeck = Shuffle.shuffle();
var tenDecks = oneDeck.cards.concat(oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards, oneDeck.cards);

var blackjackDeck = Shuffle.shuffle({deck: tenDecks});
var player, dealer;
var saveThe = Shuffle.shuffle({deck: ['the farm',
                              'Great Britain',
                              'your house',
                              'your family',
                              'your dog',
                              'your cat',
                              'your gerbil',
                              'the world',
                              'Mars',
                              'the community theater',
                              'the internet',
                              'your school\'s glee club',
                              'Miguel de Cervantes']}).draw();
var wins = 0;

function unicard(card) {
    return card.toShortDisplayString()
        .replace('C', chalk.bold.black('♣︎'))
        .replace('S', chalk.bold.black('♠︎'))
        .replace('H', chalk.red('♥︎'))
        .replace('D', chalk.red('♦︎'));
}

function deal() {
    player = [];
    dealer = [];
    blackjackDeck.deal(2, [player, dealer]);
}

function handTotal(hand, total) {
    if(hand.length === 0) return total;
    if(!total) total = 0;

    card = hand[0];

    if(card.sort === 14) { // Ace
        var fullValue = handTotal(_.rest(hand), total + 11);
        if(fullValue <= 21) {
            return fullValue;
        } else {
            return handTotal(_.rest(hand), total + 1);
        }
    } else {
        return handTotal(_.rest(hand), total + Math.min(card.sort, 10));
    }
}

function dealerHandDescription(dealer) {
    return unicard(dealer[0]) + " and some other card\n";
}

function playerHandDescription(player) {
    return player.reduce(function(prev, card) {
        return prev + unicard(card) + " ";
    }, "") +
    "totalling " +
    handTotal(player) +
    "\n";
}

function printStatus() {
    process.stdout.write("\nYou have: ");
    process.stdout.write(playerHandDescription(player));
    process.stdout.write("The dealer has: ");
    process.stdout.write(dealerHandDescription(dealer));
}

function printFullStatus() {
    process.stdout.write("\nYou have: ");
    process.stdout.write(playerHandDescription(player));
    process.stdout.write("The dealer has: ");
    process.stdout.write(playerHandDescription(dealer));
}

// Interaction

function awDangItsDecisionTime() {
    process.stdout.write("\nA DECISION LIES BEFORE YOU:\n\n");
    var opts = {
        properties: {
            decision: {
                description: "(H)IT OR (S)TAND?",
                pattern: /^(h|s|hit|stand)$/i,
                message: "THAT'S NOT HOW YOU PLAY BLACKJACK"
            }
        }
    };

    prompt.get(opts, function(err, result) {
        if(err) {
            console.log("OH NO " + err);
            process.exit(handTotal(player));
        } else {
            if (result.decision[0] == 'h') {
                if (handTotal(player) === 21) {
                    process.stdout.write("\nWow, really?\n");
                }
                blackjackDeck.deal(1, [player]);
                printStatus();

                if(checkBust(player)) {
                    process.stdout.write(chalk.red("\nBUST!\n"));
                    gameOver(player);
                }

                awDangItsDecisionTime();
            } else {
                dealerTurn();
            }
        }
    });
}

function checkBust(player) {
    return handTotal(player) > 21;
}

function compareHands() {
    printFullStatus();

    var playerScore = handTotal(player);
    var dealerScore = handTotal(dealer);
    if (playerScore > dealerScore) {
        gameOverWin(player);
    } else if (playerScore < dealerScore) {
        gameOver(player);
    } else {
        process.stdout.write(chalk.yellow("\nPush.") + "  How dull.  New hand!\n\n");
        deal();
        process.stdout.write("It's all riding on this!\n");
        printStatus();
        awDangItsDecisionTime();
    }
}

function dealerTurn() {
process.stdout.write("The dealer has: ");
    process.stdout.write(playerHandDescription(dealer));

    setTimeout(function dealerTimeout() {
        if(checkBust(dealer)) {
            process.stdout.write(chalk.blue("\nBUST!\n"));
            gameOverWin(player);
        } else if(handTotal(dealer) >= 17) {
            process.stdout.write("\nThe dealer stands.\n\n");
            compareHands();
        } else {
            process.stdout.write("\nThe dealer hits!\n\n");
            blackjackDeck.deal(1, [dealer]);
            dealerTurn();
        }
    }, 1000);
}

function gameOver(player) {
    var score = handTotal(player);
    process.stdout.write(chalk.red("\nYou lose!\n"));
    process.stdout.write("\nYou are now broke, and have been kicked out of the casino.\n");
    process.stdout.write("You have utterly failed " + saveThe + ".\n\n");
    process.stdout.write("Also, you died.\n\n");
    process.stdout.write(chalk.bold.red("***GAME OVER***\n\n"));
    process.stdout.write("Your win streak was " + chalk.yellow(wins) + "\n");
    process.stdout.write("Your score was " + chalk.yellow(score) + " out of 21\n");
    process.exit(score);
}

function gameOverWin(player) {
    process.stdout.write(chalk.green("\nYou win!") +"  But it's not enough money to save " + saveThe + "!\n\nYou bet it all on another game...\n\n");
    wins++;
    if (wins === 3) {
        process.stdout.write(chalk.red("A couple of bodyguards have congregated around your table...\n\n"));
    }
    deal();
    printStatus();
    awDangItsDecisionTime();
}

// IT'S GAME TIME

deal();

process.stdout.write("\nIt's all riding on this!\n");
prompt.start();
printStatus();
awDangItsDecisionTime();
