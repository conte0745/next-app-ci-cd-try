import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <a href="./todo" className={styles.card} rel="noopener noreferrer">
        <h2>
					ToDoアプリ <span>-&gt;</span>
        </h2>
        <p>Go to my App</p>
      </a>
    </main>
  );
}
