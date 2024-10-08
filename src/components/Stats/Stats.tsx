import { Fragment, useEffect, useMemo, useState } from "react";
import { apiGetStats } from "../../api";
import {
  Challenge,
  entryKeysEqual,
  GameMode,
  normalizeHistory,
  NUM_GUESSES,
  StatsEntry,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { assertNever, formatTimeElapsed, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Stats.module.css";

export default function Stats() {
  const localStats = useAppSelector((s) => s.stats.history);
  const userId = useAppSelector((s) => s.storage.account?.userId ?? null);
  const dispatch = useAppDispatch();
  const [serverStats, setServerStats] = useState<StatsEntry[] | null>(null);
  const path = useAppSelector((s) => s.ui.path);

  const stats = useMemo(
    () => (serverStats ? mergeStats(localStats, serverStats) : []),
    [localStats, serverStats]
  );

  useEffect(() => {
    if (!userId) {
      setServerStats([]);
      return;
    }
    apiGetStats(dispatch, userId).then((x) => {
      if (x) {
        setServerStats(x);
      } else {
        setServerStats([]);
      }
    });
  }, [dispatch, userId]);

  if (path.view !== "stats") {
    return null;
  }

  const gameMode = path.gameMode;
  const challenge = path.challenge;
  const filteredStats = stats.filter(
    (x) => x.gameMode === gameMode && x.challenge === challenge
  );

  const gameModeTab =
    gameMode === "daily"
      ? 0
      : gameMode === "practice"
      ? 1
      : assertNever(gameMode);
  const challengeTab =
    challenge === "normal"
      ? 0
      : challenge === "sequence"
      ? 1
      : challenge === "jumble"
      ? 2
      : challenge === "perfect"
      ? 3
      : assertNever(challenge);

  function handleGameModeTabChange(idx: number) {
    if (idx === 0) {
      if (challenge === "perfect") {
        dispatch(
          uiAction.navigate({
            to: { view: "stats", gameMode: "daily", challenge: "normal" },
            timestamp: Date.now(),
          })
        );
      } else {
        dispatch(
          uiAction.navigate({
            to: { view: "stats", gameMode: "daily", challenge },
            timestamp: Date.now(),
          })
        );
      }
    } else if (idx === 1) {
      dispatch(
        uiAction.navigate({
          to: { view: "stats", gameMode: "practice", challenge },
          timestamp: Date.now(),
        })
      );
    }
  }

  function handleChallengeTabChange(idx: number) {
    let challenge: Challenge;
    if (idx === 0) {
      challenge = "normal";
    } else if (idx === 1) {
      challenge = "sequence";
    } else if (idx === 2) {
      challenge = "jumble";
    } else if (idx === 3) {
      challenge = "perfect";
    } else {
      return;
    }
    dispatch(
      uiAction.navigate({
        to: { view: "stats", gameMode, challenge },
        timestamp: Date.now(),
      })
    );
  }

  return (
    <div className={styles.container}>
      {serverStats ? null : (
        <div className={styles.loading}>
          <p>Loading...</p>
        </div>
      )}
      <div className={styles.main}>
        <div className={styles.tabs}>
          <TabButtons
            tabs={["Dnevno", "Vaja"]}
            idx={gameModeTab}
            onTabChange={handleGameModeTabChange}
            size="small"
          />
          <TabButtons
            tabs={
              gameModeTab === 0
                ? ["Navadno", "Zaporedje", "Zmešanka"]
                : ["Navadno", "Zaporedje", "Zmešanka", "Popolni izziv"]
            }
            idx={challengeTab}
            onTabChange={handleChallengeTabChange}
            size="small"
          />
        </div>
        <StatsInfo
          challenge={path.challenge}
          gameMode={path.gameMode}
          stats={filteredStats}
        />
        <hr />
        <StatsExport stats={stats} />
      </div>
    </div>
  );
}

function mergeStats(local: StatsEntry[], server: StatsEntry[]) {
  const entries = [...server];
  for (const entry of local) {
    if (!entries.find((x) => entryKeysEqual(entry, x))) {
      entries.push(entry);
    }
  }
  normalizeHistory(entries);
  return entries;
}

type StatsInfoProps = {
  stats: StatsEntry[];
  challenge: Challenge;
  gameMode: GameMode;
};
function StatsInfo(props: StatsInfoProps) {
  const {
    played,
    win,
    currStreak,
    maxStreak,
    guessCount,
    guessMax,
    bestTime,
    avgTime7,
    avgTimeAll,
    timeCount,
    timeMax,
  } = calculateStatsInfo(props.stats, props.gameMode, props.challenge);

  const rangeMin = props.challenge === "jumble" ? 35 : 32;
  const rangeMax = NUM_GUESSES[props.challenge];
  const bars: (number | null)[] = range(rangeMin, rangeMax + 1);
  bars.push(null);

  return (
    <div className={styles.statsContainer}>
      {props.gameMode === "daily" ? (
        <div className={styles.grid}>
          <p className={styles.value}>{played}</p>
          <p className={styles.value}>{win}</p>
          <p className={styles.value}>{currStreak}</p>
          <p className={styles.value}>{maxStreak}</p>
          <p className={styles.label}>Igre</p>
          <p className={styles.label}>% uspešnih</p>
          <p className={styles.label}>
            Trenutni
            <br />
            niz zmag
          </p>
          <p className={styles.label}>
            Najboljši
            <br />
            niz zmag
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          <div />
          <p className={styles.value}>{played}</p>
          <p className={styles.value}>{win}</p>
          <div />
          <div />
          <p className={styles.label}>Igre</p>
          <p className={styles.label}>% uspešnih</p>
          <div />
        </div>
      )}
      <p className={styles.title}>Zgodovina iger</p>
      <div className={styles.pastGames}>
        <p className={styles.header}>#</p>
        <p className={styles.header}>Poskusi</p>
        <p className={styles.header}>Čas</p>
        {props.stats
          .map((stats, i) => ({ stats, i }))
          .reverse()
          .map(({ stats, i }) => (
            <Fragment key={i}>
              <p>{stats.gameMode === "practice" ? i + 1 : stats.id}</p>
              <p>{stats.guesses ?? "X"}</p>
              <p>{stats.time ? formatTimeElapsed(stats.time) : "???"}</p>
            </Fragment>
          ))}
      </div>
      <p className={styles.title}>Porazdelitev poskusov</p>
      <p>Število poskusov</p>
      <div className={styles.chart}>
        {bars.map((i) => {
          const label = i === null ? "X" : i;
          const count = guessCount.get(i) ?? 0;
          const percent = guessMax === 0 ? 0 : count / guessMax;
          const width = `max(20px, ${percent * 100}%)`;
          return (
            <Fragment key={i}>
              <p>{label}</p>
              <div className={styles.barWrapper}>
                <div className={styles.bar} style={{ width }}>
                  <div className={styles.barColor} />
                  <p>{count}</p>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
      <p className={styles.title}>Porazdelitev časov</p>
      <div className={styles.times}>
        <p>Najboljši:</p>
        <p>{bestTime}</p>
        <p>Povprečje zadnjih 7:</p>
        <p>{avgTime7}</p>
        <p>Povprečje vseh:</p>
        <p>{avgTimeAll}</p>
      </div>
      <p>Čas (minute)</p>
      <div className={styles.chart}>
        {TIME_BUCKETS.map((i) => {
          const last = i === Infinity;
          const time = !last
            ? i / 60000
            : TIME_BUCKETS[TIME_BUCKETS.length - 2] / 60000;
          const label = (!last ? "<" : ">") + time;
          const count = timeCount.get(i) ?? 0;
          const percent = timeMax === 0 ? 0 : count / timeMax;
          const width = `max(20px, ${percent * 100}%)`;
          return (
            <Fragment key={i}>
              <p>{label}</p>
              <div className={styles.barWrapper}>
                <div className={styles.bar} style={{ width }}>
                  <div className={styles.barColor} />
                  <p>{count}</p>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const TIME_BUCKETS = [
  1.0 * 60000,
  2.0 * 60000,
  3.0 * 60000,
  4.0 * 60000,
  5.0 * 60000,
  6.0 * 60000,
  7.0 * 60000,
  8.0 * 60000,
  9.0 * 60000,
  10.0 * 60000,
  12.0 * 60000,
  14.0 * 60000,
  16.0 * 60000,
  18.0 * 60000,
  20.0 * 60000,
  25.0 * 60000,
  30.0 * 60000,
  35.0 * 60000,
  40.0 * 60000,
  45.0 * 60000,
  Infinity,
];

function calculateStatsInfo(
  entries: StatsEntry[],
  gameMode: GameMode,
  challenge: Challenge
) {
  const stats = entries.filter(
    (x) => x.gameMode === gameMode && x.challenge === challenge
  );
  const played = stats.length;
  const wonGames = stats.filter((x) => x.guesses !== null).length;
  const win = played === 0 ? 0 : ((wonGames / played) * 100).toFixed(0);

  // Get a list of all streak lengths
  const streaks = [];
  let prev: number | null = null;
  for (let i = 0; i < stats.length; i++) {
    const entry = stats[i];
    if (entry.guesses === null || entry.gameMode !== "daily") {
      continue;
    }
    if (prev !== null && entry.id === prev + 1) {
      streaks[streaks.length - 1]++;
    } else {
      streaks.push(1);
    }
    prev = entry.id;
  }

  // Calculate streak stats
  const currStreak =
    streaks.length === 0 || stats[stats.length - 1].guesses === null
      ? 0
      : streaks[streaks.length - 1];
  const maxStreak = Math.max(0, ...streaks);

  // Calculate guess distribution
  const guessCount = new Map<number | null, number>();
  for (const entry of stats) {
    const key = entry.guesses;
    const count = guessCount.get(key) ?? 0;
    guessCount.set(key, count + 1);
  }
  const guessMax = Math.max(...guessCount.values());

  // Calculate best, average of 7, and average times
  const times = stats
    .filter((x) => x.guesses !== null && x.time !== null)
    .map((x) => x.time!);
  let bestTime, avgTime7, avgTimeAll;
  if (times.length === 0) {
    bestTime = avgTime7 = avgTimeAll = formatTimeElapsed(0);
  } else {
    bestTime = formatTimeElapsed(Math.min(...times));
    const sumTimesAll = times.reduce((a, v) => a + v);
    avgTimeAll = formatTimeElapsed(sumTimesAll / times.length);
    const times7 = times.slice(-7);
    const sumTimes7 = times7.reduce((a, v) => a + v);
    avgTime7 = formatTimeElapsed(sumTimes7 / times7.length);
  }

  // Create times chart, bucket by minutes
  const timeCount = new Map<number, number>();
  for (const entry of stats) {
    if (!entry.guesses || !entry.time) {
      continue;
    }
    for (let i = 0; i < TIME_BUCKETS.length; i++) {
      if (entry.time < TIME_BUCKETS[i]) {
        const key = TIME_BUCKETS[i];
        const count = timeCount.get(key) ?? 0;
        timeCount.set(key, count + 1);
        break;
      }
    }
  }
  const timeMax = Math.max(...timeCount.values());

  return {
    played,
    win,
    currStreak,
    maxStreak,
    guessCount,
    guessMax,
    bestTime,
    avgTime7,
    avgTimeAll,
    timeCount,
    timeMax,
  };
}

type StatsExportProps = {
  stats: StatsEntry[];
};
function StatsExport(props: StatsExportProps) {
  const [isExpanded, setExpanded] = useState(false);

  const value = stringifyHistory(props.stats);

  return (
    <div className={styles.exportContainer}>
      {isExpanded ? (
        <>
          <LinkButton onClick={() => setExpanded(false)}>Zapri</LinkButton>
          <textarea
            className={styles.export}
            rows={10}
            value={value}
            readOnly
            onClick={(e) => e.currentTarget.select()}
          />
        </>
      ) : (
        <>
          <LinkButton onClick={() => setExpanded(true)}>Izvozi</LinkButton>
        </>
      )}
    </div>
  );
}

export function stringifyHistory(stats: StatsEntry[]): string {
  const lines = [];
  lines.push("Način,Izziv,Id,Poskusi,Čas (ms)");
  for (const entry of stats) {
    const line = [];
    line.push(entry.gameMode);
    line.push(entry.challenge);
    line.push(entry.id);
    line.push(entry.guesses);
    line.push(entry.time);
    lines.push(line.join(","));
  }
  return lines.join("\n");
}
