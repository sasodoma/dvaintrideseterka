import cn from "classnames";
import { useMemo, useState } from "react";
import {
  Challenge,
  GameMode,
  getAllWordsGuessed,
  NUM_BOARDS,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, range } from "../../util";
import { Button } from "../common/Button/Button";
import { LinkButton } from "../common/LinkButton/LinkButton";
import styles from "./Results.module.css";

export function Results() {
  const dispatch = useAppDispatch();
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const challenge = useAppSelector((s) => s.game.challenge);
  const id = useAppSelector((s) => s.game.id);
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const showTimer = useAppSelector((s) => s.settings.showTimer);
  const timeElapsed = useAppSelector(
    (s) => (s.game.endTime ?? 0) - (s.game.startTime ?? 0)
  );
  const wideMode = useAppSelector((s) => s.settings.wideMode);
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);

  const shareableText = useMemo(() => {
    return getShareableText(
      gameMode,
      challenge,
      id,
      targets,
      guesses,
      showTimer,
      timeElapsed
    );
  }, [gameMode, challenge, id, targets, guesses, showTimer, timeElapsed]);

  // 0 - Normal
  // 1 - Copied!
  // 2 - Error copying
  const [copied, setCopied] = useState(0);

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(shareableText)
      .then(() => {
        setCopied(1);
      })
      .catch(() => {
        setCopied(2);
      })
      .finally(() => {
        setTimeout(() => setCopied(0), 3000);
      });
  };

  const handleWordClick = (idx: number) => {
    dispatch(
      uiAction.createSideEffect({
        type: "scroll-board-into-view",
        board: idx,
      })
    );
  };

  const handleViewStatsClick = () => {
    if (gameMode === "historic") return;
    dispatch(
      uiAction.navigate({
        to: { view: "stats", gameMode, challenge },
        timestamp: Date.now(),
      })
    );
  };

  const win = getAllWordsGuessed(targets, guesses);
  const guessCount = getAllWordsGuessed(targets, guesses)
    ? guesses.length
    : "X";
  const maxGuesses = NUM_GUESSES[challenge];
  const timeText = formatTimeElapsed(timeElapsed);

  return (
    <div
      className={cn(
        styles.results,
        colorBlind ? null : win ? styles.green : styles.red,
        wideMode && styles.wide
      )}
    >
      <p className={styles.title}>
        {win ? "🎉 Zmaga! 🎉" : "Več sreče prihodnjič 😓"}
      </p>
      <p className={styles.info}>
        Poskusi: {guessCount}/{maxGuesses} · Čas: {timeText}
        {gameMode !== "historic" && (
          <>
            {" "}
            · <LinkButton onClick={handleViewStatsClick}>Ogled statistike</LinkButton>
          </>
        )}
      </p>
      <div className={styles.row}>
        <div className={styles.share}>
          <pre className={styles.text}>{shareableText}</pre>
          <Button onClick={handleCopyClick}>
            {copied ? "Kopirano!" : "Kopiraj na odložišče"}
          </Button>
        </div>
        <div className={styles.words}>
          {range(NUM_BOARDS).map((i) => (
            <button
              key={i}
              className={cn(styles.word)}
              onClick={() => handleWordClick(i)}
            >
              {targets[i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getShareableText(
  gameMode: GameMode,
  challenge: Challenge,
  id: number,
  targets: string[],
  guesses: string[],
  showTimer: boolean,
  timeElapsed: number
) {
  let text = "";

  // Title
  if (challenge === "perfect") {
    text += "Popolna Dvaintrideseterka";
  } else {
    if (gameMode === "daily") {
      text += "Dnevn";
    } else if (gameMode === "practice") {
      text += "Poskusn";
    } else if (gameMode === "historic") {
      text += "Pretekl";
    }
    if (challenge === "normal") {
      text += "a Dvaintrideseterka";
    } else if (challenge === "sequence") {
      text += "o Zaporedje";
    } else if (challenge === "jumble") {
      text += "a Zmešanka";
    }
    if (gameMode === "daily" || gameMode === "historic") {
      text += ` #${id}`;
    }
  }
  text += "\n";

  // Guesses
  const guessCount = getAllWordsGuessed(targets, guesses)
    ? guesses.length
    : "X";
  const maxGuesses = NUM_GUESSES[challenge];
  text += `Poskusi: ${guessCount}/${maxGuesses}\n`;

  // Timer
  if (showTimer) {
    text += `Čas: ${formatTimeElapsed(timeElapsed)}\n`;
  }

  // Emojis
  const cols = 4;
  const rows = Math.ceil(NUM_BOARDS / cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      if (idx > NUM_BOARDS) continue;
      if (j !== 0) {
        text += " ";
      }
      const guessIndex = guesses.indexOf(targets[idx]);
      if (guessIndex === -1) {
        text += "🟥🟥";
      } else {
        text += numToEmoji(guessIndex + 1);
      }
    }
    text += "\n";
  }

  // Link
  text += "https://dvaintrideseterka.si/";

  return text;
}

// Converts a 2 digit number to its emoji text form
function numToEmoji(num: number): string {
  if (!Number.isInteger(num) || num < 0 || num > 99) {
    throw new Error("Expected integer from 0-99");
  }
  const EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  const ones = EMOJIS[num % 10];
  const tens = EMOJIS[Math.floor(num / 10)];
  return tens + ones;
}
