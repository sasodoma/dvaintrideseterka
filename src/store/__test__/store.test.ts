import { configureStore } from "@reduxjs/toolkit";
import { getGuessColors, getJumbleWords, getTargetWords } from "../funcs";
import {
  addHistoryEntry,
  gameAction,
  SyncedStatsEntry,
  normalizeHistory,
  reducer,
  uiAction,
  AppState,
  statsAction,
} from "../index";

describe("funcs", () => {
  test("getJumbleWords", () => {
    const targets = getTargetWords(12, "normal");
    const jumble = getJumbleWords(targets, 1);
    expect(jumble).toEqual(["CAPUT", "DILLY", "FROST"]);

    for (let i = 0; i < 100; i++) {
      const jumble = getJumbleWords(targets, i);
      const letters = new Set(jumble.flatMap((x) => x.split("")));
      expect(letters.size).toBeGreaterThanOrEqual(10);
      for (const word of jumble) {
        expect(targets).not.toContain(word);
      }
    }
  });
  test("guessColors", () => {
    expect(getGuessColors("AAABC", "CXAAA")).toEqual("YBGYY");
  });
});

describe("stats", () => {
  test("normalizeHistory", () => {
    // Test deduplication
    const test1: SyncedStatsEntry[] = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 33,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 33,
        time: null,
        synced: false,
      },
    ];
    const expect1 = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 32,
        time: null,
        synced: false,
      },
    ];
    normalizeHistory(test1);
    expect(test1).toEqual(expect1);

    // Test sorting
    const test2: SyncedStatsEntry[] = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "sequence",
        id: 1,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "jumble",
        id: 1,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "normal",
        id: 2,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "sequence",
        id: 2,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        challenge: "jumble",
        id: 2,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "normal",
        id: 12345,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "normal",
        id: 67890,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "sequence",
        id: 33333,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "jumble",
        id: 22222,
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 11111,
        guesses: null,
        time: null,
        synced: false,
      },
    ];
    const expect2 = [...test2];
    // Shuffle the list
    for (let i = 0; i < 1000; i++) {
      const a = Math.floor(Math.random() * test2.length);
      const b = Math.floor(Math.random() * test2.length);
      const tmp = test2[a];
      test2[a] = test2[b];
      test2[b] = tmp;
    }
    normalizeHistory(test2);
    expect(test2).toEqual(expect2);
  });
  test("addHistoryEntry", () => {
    const store = configureStore({ reducer });
    store.dispatch(
      statsAction.load({
        history: [
          {
            gameMode: "daily",
            id: 1,
            challenge: "normal",
            guesses: null,
            time: null,
            synced: false,
          },
        ],
      })
    );
    store.dispatch(
      statsAction.addEntry({
        gameMode: "daily",
        id: 2,
        challenge: "normal",
        guesses: null,
        time: null,
        synced: false,
      })
    );
    const expect1: SyncedStatsEntry[] = [
      {
        gameMode: "daily",
        id: 1,
        challenge: "normal",
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "daily",
        id: 2,
        challenge: "normal",
        guesses: null,
        time: null,
        synced: false,
      },
    ];
    expect(store.getState().stats.history).toEqual(expect1);
  });
});

describe("game", () => {
  it("should save", () => {
    const store = configureStore({ reducer });
    store.dispatch(
      gameAction.start({
        gameMode: "daily",
        challenge: "normal",
        timestamp: 1677609625570,
      })
    );
    store.dispatch(gameAction.inputLetter({ letter: "H" }));
    store.dispatch(gameAction.inputLetter({ letter: "E" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "O" }));
    store.dispatch(gameAction.inputEnter({ timestamp: 1677609625570 }));
    expect(store.getState().storage).toEqual({
      daily: {
        normal: {
          id: 363,
          guesses: ["HELLO"],
          startTime: 1677609625570,
          endTime: null,
          pauseTime: null,
        },
        sequence: null,
        jumble: null,
      },
      lastUpdated: "1970-01-01",
      account: null,
      prevUserId: null,
    });
  });
  it("should time", () => {
    let timestamp = 1000;
    const store = configureStore({ reducer });
    timestamp += 1000;
    store.dispatch(
      uiAction.navigate({
        to: { view: "game", gameMode: "daily", challenge: "normal" },
        timestamp,
      })
    );
    store.dispatch(gameAction.inputLetter({ letter: "H" }));
    store.dispatch(gameAction.inputLetter({ letter: "E" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "O" }));
    store.dispatch(gameAction.inputEnter({ timestamp }));
    timestamp += 1000;
    expect(store.getState().game.startTime).toEqual(2000);
    expect(store.getState().game.endTime).toEqual(null);
    // Do this 36 more times to finish the game
    for (let i = 0; i < 36; i++) {
      store.dispatch(gameAction.inputLetter({ letter: "H" }));
      store.dispatch(gameAction.inputLetter({ letter: "E" }));
      store.dispatch(gameAction.inputLetter({ letter: "L" }));
      store.dispatch(gameAction.inputLetter({ letter: "L" }));
      store.dispatch(gameAction.inputLetter({ letter: "O" }));
      store.dispatch(gameAction.inputEnter({ timestamp }));
      timestamp += 1000;
    }
    expect(store.getState().game.startTime).toEqual(2000);
    expect(store.getState().game.endTime).toEqual(38000);
  });
  it("should pause", () => {
    let timestamp = 1000;
    const store = configureStore({ reducer });
    store.dispatch(
      uiAction.navigate({
        to: { view: "game", gameMode: "daily", challenge: "normal" },
        timestamp,
      })
    );
    timestamp += 1000;
    store.dispatch(gameAction.inputLetter({ letter: "H" }));
    store.dispatch(gameAction.inputLetter({ letter: "E" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "O" }));
    store.dispatch(gameAction.inputEnter({ timestamp }));
    expect(store.getState().game.startTime).toEqual(2000);
    expect(store.getState().game.endTime).toEqual(null);
    expect(store.getState().game.pauseTime).toEqual(null);
    timestamp += 1000;
    store.dispatch(uiAction.navigate({ to: { view: "welcome" }, timestamp }));
    expect(store.getState().game.startTime).toEqual(2000);
    expect(store.getState().game.endTime).toEqual(null);
    expect(store.getState().game.pauseTime).toEqual(3000);
    timestamp += 1000;
    store.dispatch(
      uiAction.navigate({
        to: { view: "game", gameMode: "daily", challenge: "normal" },
        timestamp,
      })
    );
    expect(store.getState().game.startTime).toEqual(3000);
    expect(store.getState().game.endTime).toEqual(null);
    expect(store.getState().game.pauseTime).toEqual(null);
  });
});
