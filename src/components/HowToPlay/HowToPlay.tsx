import styles from "./HowToPlay.module.css";
import cn from "classnames";
import { useAppSelector } from "../../store";

export function HowToPlay() {
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);

  return (
    <div className={cn(styles.main, colorBlind && styles.colorBlind)}>
      <h1 className={styles.big}>Ugani vseh 32 besed v 37 poskusih!</h1>
      <p>
        V igri Dvaintrideseterka morate uganiti 32 skrivnih besed. Začnite
        tako, da vnesete katerokoli 5-črkovno besedo. Preizkus se izvede
        za vseh 32 besed hkrati.
      </p>
      <p>
        Po vsaki ugibanju se ploščice pobarvajo glede na pravilnost poskusa.
        Vsi poskusi morajo biti pravilne slovenske besede.
      </p>
      <div className={styles.row}>
        <div className={styles.grid}>
          <div className={cn(styles.cell, styles.green)}>K</div>
          <div className={cn(styles.cell, styles.green)}>R</div>
          <div className={styles.cell}>A</div>
          <div className={styles.cell}>V</div>
          <div className={styles.cell}>A</div>
          <div className={styles.cell}>O</div>
          <div className={styles.cell}>T</div>
          <div className={cn(styles.cell, styles.yellow)}>R</div>
          <div className={styles.cell}>O</div>
          <div className={cn(styles.cell, styles.yellow)}>K</div>
          <div className={styles.cell}>P</div>
          <div className={styles.cell}>T</div>
          <div className={cn(styles.cell, styles.green)}>I</div>
          <div className={styles.cell}>C</div>
          <div className={styles.cell}>A</div>
          <div className={cn(styles.cell, styles.input)}>K</div>
          <div className={cn(styles.cell, styles.input)}>R</div>
          <div className={cn(styles.cell, styles.input)}>I</div>
          <div className={cn(styles.cell, styles.input)}></div>
          <div className={cn(styles.cell, styles.input)}></div>
        </div>
      </div>
      <p>
        Rumena ploščica pomeni, da je črka v besedi, vendar ni na pravilnem
        mestu. Zelena ploščica pomeni, da je črka na pravilnem mestu v besedi.
        Siva ploščica pomeni, da črka ni v besedi.
      </p>
      <p>Zatemnjene črke v vnosni vrstici prikazujejo položaj zelenih ploščic.</p>
      <div className={styles.row}>
        <div className={styles.grid}>
        <div className={cn(styles.cell, styles.green)}>K</div>
          <div className={cn(styles.cell, styles.green)}>R</div>
          <div className={styles.cell}>A</div>
          <div className={styles.cell}>V</div>
          <div className={styles.cell}>A</div>
          <div className={styles.cell}>O</div>
          <div className={styles.cell}>T</div>
          <div className={cn(styles.cell, styles.yellow)}>R</div>
          <div className={styles.cell}>O</div>
          <div className={cn(styles.cell, styles.yellow)}>K</div>
          <div className={styles.cell}>P</div>
          <div className={styles.cell}>T</div>
          <div className={cn(styles.cell, styles.green)}>I</div>
          <div className={styles.cell}>C</div>
          <div className={styles.cell}>A</div>
          <div className={cn(styles.cell, styles.hint)}>K</div>
          <div className={cn(styles.cell, styles.hint)}>R</div>
          <div className={cn(styles.cell, styles.hint)}>I</div>
          <div className={cn(styles.cell, styles.hint)}>P</div>
          <div className={cn(styles.cell, styles.hint)}>A</div>
        </div>
      </div>
      <p>
        Včasih se ob vnosu besede črke obarvajo rumeno, kar pomeni, da vaše
        ugibanje ne more biti pravilno. Preverite položaj vseh rumenih in zelenih
        črk ter poskusite z drugo besedo.
      </p>
      <p>
        Igra se konča, ko uganete vseh 32 besed ali vam zmanjka poskusov.
      </p>
      <h1 className={styles.big}>Način zaporedje</h1>
      <p>
        V načinu zaporedje je hkrati vidna samo ena plošča. Ko uganete besedo,
        se odklene naslednja plošča. Za pomoč pri dodatnem izzivu dobite 2
        dodatna poskusa (skupaj 39).
      </p>
      <h1 className={styles.big}>Način zmešanka</h1>
      <p>
        V načinu zmešanka so prve tri besede naključno izbrane. Za pomoč pri
        dodatnem izzivu dobite 1 dodaten poskus (skupaj 38).
      </p>
      <h1 className={styles.big}>Popolni izziv</h1>
      <p>
        Ste pripravljeni na izziv? Uganite vseh 32 besed v natanko 32 poskusih.
        Prva beseda, ki jo vnesete, je samodejno pravilna.
      </p>
    </div>
  );
}
