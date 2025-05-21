use thiserror::Error;

use super::Card;

#[derive(Error, Debug, Hash)]
pub enum RSPokerError {
    #[error("Unable to parse value")]
    UnexpectedValueChar,
    #[error("Unable to parse suit")]
    UnexpectedSuitChar,
    #[error("Error reading characters while parsing")]
    TooFewChars,
    #[error("Holdem hands should never have more than 7 cards in them.")]
    HoldemHandSize,
    #[error("Card already added to hand {0}")]
    DuplicateCardInHand(Card),
    #[error("Extra un-used characters found after parsing")]
    UnparsedCharsRemaining,
    #[error("Hand range can't be offsuit while cards are suiterd")]
    OffSuitWithMatchingSuit,
    #[error("Hand range is suited while cards are not.")]
    SuitedWithNoMatchingSuit,
    #[error("Invalid use of the plus modifier")]
    InvalidPlusModifier,
    #[error("The gap between cards must be constant when defining a hand range.")]
    InvalidGap,
    #[error("Pairs can't be suited.")]
    InvalidSuitedPairs,
    #[error("Error getting random value: {0}")]
    RandomValueError(String),
    #[error("Error: {0}")]
    Other(String),
}
