import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <div className={styles.scene}>
      <div className={styles.room}>
        <div className={styles.cuboid}>
          <div className={styles.side} />
          <div className={styles.side} />
          <div className={styles.side} />
        </div>
        <div className={styles.oops}>
          <h2>OOPS!</h2>
          <p>We can&apos;t find the page that you&apos;re looking for :(</p>
        </div>
        <div className={styles.centerLine}>
          <div className={styles.hole}>
            <div className={styles.ladderShadow} />
            <div className={styles.ladder} />
          </div>
          <div className={styles.four}>4</div>
          <div className={styles.fourRight}>4</div>
          <div className={styles.btn}>
            <a href="/">BACK TO HOME</a>
          </div>
        </div>
      </div>
    </div>
  )
}
