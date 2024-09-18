import cn from "classnames";
import { useEffect, useState } from "react";
import { apiGetGameSaves } from "../../api";
import {
  Challenge,
  DailyChallenge,
  getCompletedBoardsCount,
  getDailyId,
  getTargetWords,
  NUM_BOARDS,
  storageAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { unreachable } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Welcome.module.css";

export function Welcome() {
  const dispatch = useAppDispatch();
  const tabIdx = useAppSelector((s) => s.ui.welcomeTab);
  const userId = useAppSelector((s) => s.storage.account?.userId ?? null);

  useEffect(() => {
    dispatch(storageAction.pruneSaves({ timestamp: Date.now() }));
    if (userId) {
      apiGetGameSaves(dispatch, userId, getDailyId(Date.now()));
    }
  }, [dispatch, userId]);

  return (
    <div
      className={cn(
        styles.welcome,
        tabIdx === 0 && styles.daily,
        tabIdx === 1 && styles.practice,
        tabIdx === 2 && styles.more
      )}
    >
      <TabButtons
        tabs={["Dnevno", "Vaja", "Več"]}
        idx={tabIdx}
        onTabChange={(idx) => dispatch(uiAction.setWelcomeTab(idx))}
      />
      <div className={styles.tabContainer}>
        {tabIdx === 0 ? (
          <DailyTab />
        ) : tabIdx === 1 ? (
          <PracticeTab />
        ) : tabIdx === 2 ? (
          <MoreTab />
        ) : (
          unreachable()
        )}
      </div>
    </div>
  );
}

function DailyTab() {
  return (
    <>
      <DailyLink
        title="Dnevna dvaintrideseterka"
        description="Reši 32 ugank naenkrat."
        challenge="normal"
      />
      <DailyLink
        title="Dnevno zaporedje"
        description="Naslednja uganka se razkrije šele po rešitvi trenutne."
        challenge="sequence"
      />
      <DailyLink
        title="Dnevna zmešanka"
        description="Ste naveličani uporabe istih začetnih besed? Prve 3 besede so vam naključno izbrane."
        challenge="jumble"
      />
    </>
  );
}

type DailyLinkProps = {
  title: string;
  description: string;
  challenge: DailyChallenge;
};
function DailyLink(props: DailyLinkProps) {
  const dispatch = useAppDispatch();
  const gameSave = useAppSelector((s) => s.storage.daily)[props.challenge];

  const handleClick = () => {
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "daily",
          challenge: props.challenge,
        },
        timestamp: Date.now(),
      })
    );
  };

  if (!gameSave) {
    return (
      <div className={styles.item}>
        <LinkButton className={styles.link} onClick={handleClick}>
          {props.title}
        </LinkButton>
        <p>{props.description}</p>
      </div>
    );
  }

  const targets = getTargetWords(gameSave.id, props.challenge);
  const guesses = gameSave.guesses;
  const boardsComplete = getCompletedBoardsCount(targets, guesses);
  const gameOver = gameSave.endTime !== null;

  return (
    <div className={styles.item}>
      <LinkButton className={styles.link} onClick={handleClick}>
        {gameOver ? "Ogled rezultatov" : "Nadaljuj"}
      </LinkButton>
      <p>
        {props.title} #{gameSave.id} ({boardsComplete}/{NUM_BOARDS})
      </p>
    </div>
  );
}

function PracticeTab() {
  const dispatch = useAppDispatch();
  const todaysId = getDailyId(Date.now());
  const [historicId, setHistoricId] = useState(() => todaysId - 1);
  const [historicChallenge, setHistoricChallenge] =
    useState<DailyChallenge>("normal");

  const handleNewPracticeGameClick = (challenge: Challenge) => {
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "practice",
          challenge,
        },
        timestamp: Date.now(),
      })
    );
  };

  const handleNewArchiveClick = () => {
    if (
      !Number.isInteger(historicId) ||
      historicId < 1 ||
      historicId >= todaysId
    ) {
      alert("Prosim vnesite število od 1 do " + (todaysId - 1));
      return;
    }
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "historic",
          challenge: historicChallenge,
          id: historicId,
        },
        timestamp: Date.now(),
      })
    );
  };

  return (
    <>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("normal")}
        >
          Poskusna dvaintrideseterka
        </LinkButton>
        <p>Reši 32 ugank naenkrat.</p>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("sequence")}
        >
          Poskusno zaporedje
        </LinkButton>
        <p>Naslednja uganka se razkrije šele po rešitvi trenutne.</p>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("jumble")}
        >
          Poskusna zmešanka
        </LinkButton>
        <p>
          Ste naveličani uporabe istih začetnih besed? Prve 3 besede so vam
          naključno izbrane.
        </p>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("perfect")}
        >
          Popolni izziv
        </LinkButton>
        <p>
          Najzahtevnejša dvaintrideseterka! Ali lahko rešiš 32 ugank brez
          napake?
        </p>
      </div>
      <div className={styles.item}>
        <LinkButton className={styles.link} onClick={handleNewArchiveClick}>
          Pretekle uganke
        </LinkButton>
        <p>Igraj katero od prejšnjih ugank.</p>
        <p className={styles.historicDescription}>
          <span>Igraj</span>
          <select
            className={styles.historicSelect}
            value={historicChallenge}
            onChange={(e) => setHistoricChallenge(e.target.value as "normal")}
          >
            <option value="normal">dvaintrideseterko</option>
            <option value="sequence">zaporedje</option>
            <option value="jumble">zmešanko</option>
          </select>
          <span>številka</span>
          <input
            size={3}
            className={styles.historicInput}
            type="number"
            min={0}
            max={todaysId - 1}
            value={historicId}
            onChange={(e) => setHistoricId(parseInt(e.target.value, 10))}
          />
        </p>
      </div>
    </>
  );
}

function MoreTab() {
  const dispatch = useAppDispatch();
  //const kofiEmail = useAppSelector((s) => s.settings.kofiEmail);
  //const username = useAppSelector((s) => s.storage.account?.username ?? null);

  return (
    <>
      {/*<div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "account" },
                timestamp: Date.now(),
              })
            )
          }
        >
          Račun
        </LinkButton>
        {username ? (
          <p>Prijavljeni ste kot {username}</p>
        ) : (
          <p>Upravljajte svoj račun.</p>
        )}
      </div>*/}
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "stats", gameMode: "daily", challenge: "normal" },
                timestamp: Date.now(),
              })
            )
          }
        >
          Statistika
        </LinkButton>
        <p>Oglejte si statistiko svojih iger</p>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "how-to-play" },
                timestamp: Date.now(),
              })
            )
          }
        >
          Kako igrati
        </LinkButton>
        <p>Naučite se igrati dvaintrideseterko</p>
      </div>
      {/*<div className={styles.item}>
        <a
          className={styles.link}
          target="_blank"
          href="https://ko-fi.com/thesilican"
          rel="noreferrer"
        >
          Kupite mi ☕️
        </a>
        {kofiEmail ? (
          <p>Hvala za podporo ♥️</p>
        ) : (
          <p>Pokažite podporo! (in odstranite oglase)</p>
        )}
      </div>*/}
      {/*<div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => dispatch(uiAction.showModal("changelog"))}
        >
          Seznam sprememb
        </LinkButton>
      </div>*/}
      <div className={styles.item}>
        <a
          className={styles.link}
          target="_blank"
          href="https://github.com/sasodoma/dvaintrideseterka"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
      {/*<div className={styles.item}>
        <a
          className={styles.link}
          target="_blank"
          href="mailto:admin@dvaintrideseterka.si"
          rel="noreferrer"
        >
          Kontakt
        </a>
      </div>*/}
      {/*<div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "privacy-policy" },
                timestamp: Date.now(),
              })
            )
          }
        >
          O zasebnosti
        </LinkButton>
      </div>*/}
    </>
  );
}
